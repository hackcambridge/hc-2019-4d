import { Router, Request } from 'express';

import { hackerApplicationsController, teamsController, rsvpsController, dashboardController } from 'js/server/controllers/apply/index';
import { appliableConcern } from 'js/server/controllers/apply/concerns/index';
import { requireAuth, logout } from 'js/server/auth';
import { HackerInstance } from 'js/server/models';

const applyRouter = Router();

export interface UserRequest extends Request {
  user: HackerInstance;
};

applyRouter.get('/', (req: UserRequest, res) => {
  req.user ? res.redirect('dashboard') : res.redirect('login');
});

applyRouter.get('/login', (req: UserRequest, res) => res.render('apply/login'));

applyRouter.use(requireAuth);

applyRouter.get('/logout', logout, (req: UserRequest, res) => res.redirect('/'));

applyRouter.get('/dashboard', requireAuth, dashboardController.showDashboard);

applyRouter.route('/form')
  .all(appliableConcern.goHomeIfAlreadyApplied, appliableConcern.checkApplicationsOpen)
  .get(hackerApplicationsController.newHackerApplication)
  // The spread operator is needed because the validation middleware can't be wrapped in a lambda (or function).
  .post(...hackerApplicationsController.createHackerApplication);

applyRouter.route('/team')
  .all(appliableConcern.checkApplicationsOpen)
  .get(teamsController.newTeam)
  // The spread operator is needed because the validation middleware can't be wrapped in a lambda (or function).
  .post(...teamsController.createTeam);

// Process the RSVP response
applyRouter.post('/rsvp', requireAuth, rsvpsController.createRsvp);

export default applyRouter;
