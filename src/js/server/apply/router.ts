import { Router, Request } from 'express';

import * as hackerApplicationsController from 'js/server/controllers/hacker-applications-controller';
import * as teamsController from 'js/server/controllers/teams-controller';
import * as dashboardController from 'js/server/controllers/dashboard-controller';
import * as auth from 'js/server/auth';
import * as utils from '../utils.js';
import * as statuses from 'js/shared/status-constants';
import { Hacker, TeamMember, HackerApplication, HackerInstance, HackerApplicationInstance } from 'js/server/models';
import { rsvpToResponse } from 'js/server/attendance/logic';
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

applyRouter.get('/dashboard', auth.requireAuth, dashboardController.showDashboard);

applyRouter.all('/form', goHomeIfAlreadyApplied, checkApplicationsOpen);
applyRouter.get('/form', hackerApplicationsController.newHackerApplication);
// The spread operator is needed because the validation middleware can't be wrapped in a lambda (or function).
applyRouter.post('/form', ...hackerApplicationsController.createHackerApplication);

applyRouter.all('/team', checkApplicationsOpen);
applyRouter.get('/team', teamsController.newTeam);
// The spread operator is needed because the validation middleware can't be wrapped in a lambda (or function).
applyRouter.post('/team', ...teamsController.createTeam);

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

applyRouter.get('/logout', auth.logout, (req, res) => res.redirect('/'));

// The login page (has the login button)

applyRouter.get('/', (req, res) => res.render('apply/index.html'));

/**
 * Intercepts the request to check if the user has submitted an application
 * 
 * If they have, it will redirect them to the dashboard. Otherwise, it will let them proceed
 * as normal.
 */
function goHomeIfAlreadyApplied(req, res, next) {
  req.user.getHackerApplication().then((hackerApplication: HackerApplicationInstance) => {
    if (hackerApplication) {
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
