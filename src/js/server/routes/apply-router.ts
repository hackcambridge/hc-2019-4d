import { Router, Request } from 'express';

import { hackerApplicationsController, teamsController, rsvpsController, dashboardController } from 'js/server/controllers/apply/index';
import { appliableConcern } from 'js/server/controllers/apply/concerns/index';
import { requireAuth, logout } from 'js/server/auth';
import { HackerInstance } from 'js/server/models';

const applyRouter = Router();

export interface UserRequest extends Request {
  user: HackerInstance;
}

applyRouter.get('/', (req: UserRequest, res) => {
  req.user ? res.redirect('dashboard') : res.redirect('login');
});

applyRouter.get('/login', (req: UserRequest, res) => res.render('apply/login'));

applyRouter.use(requireAuth);

applyRouter.get('/logout', logout, (req: UserRequest, res) => res.redirect('/'));

applyRouter.get('/dashboard', requireAuth, dashboardController.showDashboard);

applyRouter.route('/form')
  .all(appliableConcern.goBackIfApplied, appliableConcern.goBackIfApplicationsClosed)
  .get(hackerApplicationsController.newHackerApplication)
  .post(hackerApplicationsController.createHackerApplication);

applyRouter.route('/team')
  .all(appliableConcern.goBackIfApplicationsClosed)
  .get(teamsController.newTeam)
  .post(teamsController.createTeam);

// Process the RSVP response
applyRouter.post('/rsvp', requireAuth, rsvpsController.createRsvp);

export default applyRouter;
