import { Router, Request } from 'express';

import * as utils from 'js/server/utils';

const eventRouter = Router();

eventRouter.get('/', (req, res) => res.render('event/index'));

eventRouter.get('/schedule', (req, res) => {
  res.render('event/schedule', {
    schedule: utils.loadResource('schedule'),
    workshops: utils.loadResource('workshops'),
    demos: utils.loadResource('api_demos')
  });
});

eventRouter.get('/hacking', (req, res) => {
  res.render('event/hacking', {
    apis: utils.loadResource('apis'),
    prizes: utils.loadResource('prizes')
  });
});

eventRouter.get('/location', (req, res) => res.render('event/location'));

export default eventRouter;

