import { Router } from 'express';

import { loadResource } from 'js/server/utils';

const eventRouter = Router();

eventRouter.get('/', (_req, res) => res.render('event/index'));

eventRouter.get('/schedule', (_req, res) => {
  res.render('event/schedule', {
    schedule: loadResource('schedule'),
    workshops: loadResource('workshops'),
    demos: loadResource('api_demos')
  });
});

eventRouter.get('/hacking', (_req, res) => {
  res.render('event/hacking', {
    apis: loadResource('apis'),
    prizes: loadResource('prizes')
  });
});

eventRouter.get('/location', (_req, res) => res.render('event/location'));

export default eventRouter;
