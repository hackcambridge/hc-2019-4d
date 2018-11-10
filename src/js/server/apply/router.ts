import { Router, Request } from 'express';
import * as tag from 'forms/lib/tag';

import * as hackerApplicationsController from 'js/server/controllers/hacker-applications-controller';
import * as teamsController from 'js/server/controllers/teams-controller';
import * as dashboardController from 'js/server/controllers/dashboard-controller';
import { createApplicationForm } from 'js/shared/apply/application-form';
import { createTeamForm } from 'js/shared/apply/team-form';
import renderForm from 'js/shared/apply/render-form';
import renderTableForm from 'js/shared/apply/render-table-form';
import * as auth from 'js/server/auth';
import * as utils from '../utils.js';
import * as statuses from 'js/shared/status-constants';
import { Hacker, TeamMember, HackerApplication, HackerInstance, HackerApplicationInstance } from 'js/server/models';
import { rsvpToResponse } from 'js/server/attendance/logic';
import * as applyLogic from './logic';
import { getHackathonStartDate, getHackathonEndDate } from 'js/shared/dates';


const applyRouter = Router();

export interface UserRequest extends Request {
  user: HackerInstance;
}

applyRouter.get('/', (req: UserRequest, res) => {
  req.user ? res.redirect(`${req.baseUrl}/dashboard`) : res.render('apply/index.html');
});

applyRouter.use(auth.requireAuth);

// Route to redirect to whatever next step is required
applyRouter.get('/', (req, res) => {
  res.redirect(`${req.baseUrl}/form`);
});

applyRouter.all('/form', checkHasApplied);
applyRouter.all('/form', checkApplicationsOpen);
applyRouter.get('/form', hackerApplicationsController.newHackerApplication);
applyRouter.post('/form', hackerApplicationsController.createHackerApplication);

applyRouter.all('/team', checkApplicationsOpen);
applyRouter.get('/team', teamsController.newTeam);
applyRouter.post('/team', teamsController.createTeam);

// Process the RSVP response
applyRouter.post('/rsvp', auth.requireAuth, (req: UserRequest, res) => {
  const rsvp = req.body.rsvp;
  if (rsvp) {
    // RSVP was given, store it
    req.user.getHackerApplication().then(hackerApplication => {

      if (hackerApplication == null) {
        return Promise.resolve(null);
      } else {
        return hackerApplication.getApplicationResponse();
      }

    }).then(applicationResponse => {

      if (applicationResponse != null) {
        // Found a response
        return applicationResponse.getResponseRsvp().then(responseRsvp => {
          if (responseRsvp != null) {
            console.log('There was already an RSVP for this application, ignoring new');
            return Promise.resolve(null);
          } else {
            return rsvpToResponse(applicationResponse, rsvp);
          }
        });
      } else {
        // No response found
        return Promise.resolve(null);
      }

    }).then(() => {
      res.redirect('/apply/dashboard');
    });
  } else {
    // No RSVP given so just redirect
    res.redirect('/apply/dashboard');
  }
});

applyRouter.get('/dashboard', auth.requireAuth, dashboardController.showDashboard);

applyRouter.get('/logout', auth.logout, (req, res) => res.redirect('/'));

// The login page (has the login button)
applyRouter.get('/', (req, res) => res.render('apply/index.html'));

// Render the form for team applications
applyRouter.get('/team', (req: UserRequest, res) => {
  req.user.getHackerApplication().then(hackerApplication => {
    if (hackerApplication !== null) {
      req.user.getTeam().then(team => {
        if (team === null) {
          res.locals.applicationSlug = hackerApplication.applicationSlug;
          renderTeamPageWithForm(res, createTeamForm());
        } else {
          // User already in a team
          res.redirect('/apply/dashboard');
        }
      });
    } else {
      res.redirect('/apply/form');
    }
  });
});

applyRouter.get('/', (req, res) => res.render('apply/index.html'));

/**
 * Intercepts the request to check if the user has submitted an application
 * 
 * If they have, it will redirect them to the dashboard. Otherwise, it will let them proceed
 * as normal.
 */
function checkHasApplied(req, res, next) {
  req.user.getHackerApplication().then((hackerApplication: HackerApplicationInstance) => {
    if (hackerApplication) {
      //If the hacker wants to create a team, redirect to the team page otherwise send them to the dashboard
      if (hackerApplication.inTeam) {
        res.redirect(`${req.baseUrl}/team`);
        return;
      }
      res.redirect(`${req.baseUrl}/dashboard`);
      return;
    } 

    next();
  }).catch(next);
}

/**
 * Intercepts requests to check if applications are still open, redirecting to the dashboard if not
 */
function checkApplicationsOpen(req, res, next) {
  console.log(process.env.APPLICATIONS_OPEN);
  if (process.env.APPLICATIONS_OPEN_STATUS === statuses.applicationsOpen.CLOSED) {
    res.redirect(`${req.baseUrl}/dashboard`);
    return;
  }
  
  next();
}

export default applyRouter;
