import { Router, Request } from 'express';

import * as hackerApplicationsController from 'js/server/controllers/hacker-applications-controller';
import * as teamsController from 'js/server/controllers/teams-controller';
import * as appliableConcern from 'js/server/controllers/concerns/appliable-concern';
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
  req.user ? res.redirect(`${req.baseUrl}/dashboard`) : res.render('apply/login.html');
});

applyRouter.use(auth.requireAuth);

// Route to redirect to whatever next step is required
applyRouter.get('/', (req, res) => {
  res.redirect(`${req.baseUrl}/form`);
});

applyRouter.get('/dashboard', auth.requireAuth, dashboardController.showDashboard);

applyRouter.all('/form', appliableConcern.goHomeIfAlreadyApplied, appliableConcern.checkApplicationsOpen);
applyRouter.get('/form', hackerApplicationsController.newHackerApplication);
// The spread operator is needed because the validation middleware can't be wrapped in a lambda (or function).
applyRouter.post('/form', ...hackerApplicationsController.createHackerApplication);

applyRouter.all('/team', appliableConcern.checkApplicationsOpen);
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

applyRouter.get('/', (req, res) => res.render('apply/login.html'));


export default applyRouter;
