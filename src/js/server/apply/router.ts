import { Router, Request } from 'express';

import * as auth from 'js/server/auth';
import * as utils from '../utils.js';
import * as statuses from 'js/shared/status-constants';
import { Hacker, TeamMember, HackerApplication, HackerInstance, HackerApplicationInstance } from 'js/server/models';
import { getHackathonStartDate, getHackathonEndDate } from 'js/shared/dates';
import { hackerApplicationsController, teamsController, rsvpsController, dashboardController } from 'js/server/controllers/apply/index'
import { appliableConcern } from 'js/server/controllers/apply/concerns/index'

const applyRouter = Router();

export interface UserRequest extends Request {
  user: HackerInstance;
}

applyRouter.get('/', (req: UserRequest, res) => {
  req.user ? res.redirect(`${req.baseUrl}/dashboard`) : res.render('apply/login.html');
});

applyRouter.use(auth.requireAuth);

// Route to redirect to whatever next step is required
applyRouter.get('/', (req, res) => res.redirect(`${req.baseUrl}/form`));

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
applyRouter.post('/rsvp', auth.requireAuth, rsvpsController.createRsvp);

applyRouter.get('/', (req, res) => res.render('apply/login.html'));

applyRouter.get('/logout', auth.logout, (req, res) => res.redirect('/'));

export default applyRouter;
