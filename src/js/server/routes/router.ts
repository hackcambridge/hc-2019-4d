import { Router } from 'express';
import * as bodyParser from 'body-parser';
import * as url from 'url';
import * as moment from 'moment';
import { ServeStaticOptions } from 'serve-static';

import * as auth from 'js/server/auth';
import * as errors from 'js/server/errors';
import * as colors from 'js/shared/colors';
import * as metadata from 'js/shared/metadata';
import * as currentEvent from 'js/server/live/current-event';
import * as utils from 'js/server/utils';
import * as dates from 'js/shared/dates';
import * as theme from 'js/shared/theme';

const router = Router();

router.get('/', (req, res) => {
  res.render('index', {
    sponsors: utils.loadResource('sponsors')
  });
});

router.get('/live-api/event-info', (req, res) => {
  const schedule = utils.loadResource('schedule');
  res.json({
    currentEvents: currentEvent.getCurrentEvents(schedule),
    nextEvents: currentEvent.getNextEvents(schedule)
  });
});

router.get('/live', (req, res) => {
  res.render('live', {
    title: 'Hack Cambridge Ternary',
    sponsors: utils.loadResource('sponsors'),
    pusherKey: process.env.PUSHER_KEY
  });
});

router.get('/terms-and-conditions', (req, res) => res.render('terms-and-conditions'));

router.get('/faqs', (req, res) => {
  res.render('faqs', {
    faqs: utils.loadResource('faqs')
  });
});

router.get('/privacy-policy', (req, res) => res.render('privacy-policy'));

router.get('/pay', (req, res) => {
  res.render('pay', {
    title: 'Make a payment to Hack Cambridge',
    stripeKey: process.env.STRIPE_PUBLISH_KEY
  });
});

router.get('/favicon.ico', (req, res) => res.sendFile(utils.resolvePath('assets/images/favicons/favicon.ico')));

router.get('/sponsorship', (req, res) => res.render('sponsorship'));

router.get('/favicons/browserconfig.xml', (req, res) => res.render('favicons/browserconfig.xml'));

router.get('/favicons/manifest.json', (req, res) => res.render('favicons/manifest.json'));

export default router;
