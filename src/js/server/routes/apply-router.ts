import { Request, Router } from 'express';

import { logout, requireAuth } from 'js/server/auth';
import { dashboardController, hackerApplicationsController, rsvpsController, teamsController } from 'js/server/controllers/apply';
import { applicationsMiddleware } from 'js/server/middleware';
import { HackerInstance } from 'js/server/models';

const applyRouter = Router();

export interface UserRequest extends Request {
  user: HackerInstance;
}

applyRouter.get('/', (req: UserRequest, res) => {
  req.user ? res.redirect('apply/dashboard') : res.redirect('apply/login');
});

applyRouter.get('/login', (_req: UserRequest, res) => res.render('apply/login'));

applyRouter.use(requireAuth);

applyRouter.get('/logout', logout, (_req: UserRequest, res) => res.redirect('/'));

applyRouter.get('/dashboard', requireAuth, dashboardController.showDashboard);

applyRouter.route('/form')
  .all(applicationsMiddleware.goBackIfApplied, applicationsMiddleware.goBackIfApplicationsClosed)
  .get(hackerApplicationsController.newHackerApplication)
  .post(hackerApplicationsController.createHackerApplication);

applyRouter.route('/team')
  .all(applicationsMiddleware.goBackIfApplicationsClosed)
  .get(teamsController.newTeam)
  .post(teamsController.createTeam);

// Process the RSVP response
applyRouter.post('/rsvp', requireAuth, rsvpsController.createRsvp);

export default applyRouter;
