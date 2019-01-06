import { Request, Response, Router } from 'express';

import { loadResource } from 'server/utils';

const eventRouter = Router();

eventRouter.get('/', (_req: Request, res: Response) => res.render('event/index'));

eventRouter.get('/schedule', (_req: Request, res: Response) => {
  res.render('event/schedule', {
    schedule: loadResource('schedule'),
    workshops: loadResource('workshops'),
    demos: loadResource('api_demos')
  });
});

eventRouter.get('/hacking', (_req: Request, res: Response) => {
  res.render('event/hacking', {
    apis: loadResource('apis'),
    prizes: loadResource('prizes')
  });
});

eventRouter.get('/location', (_req: Request, res: Response) => res.render('event/location'));

export default eventRouter;
