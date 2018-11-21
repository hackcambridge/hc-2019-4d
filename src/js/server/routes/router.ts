import { Router } from 'express';

import { getCurrentEvents, getNextEvents } from 'js/server/live/current-event';
import { loadResource, resolvePath } from 'js/server/utils';

const router = Router();

router.get('/', (req, res) => {
  res.render('index', {
    sponsors: loadResource('sponsors')
  });
});

router.get('/live-api/event-info', (req, res) => {
  const schedule = loadResource('schedule');
  res.json({
    currentEvents: getCurrentEvents(schedule),
    nextEvents: getNextEvents(schedule)
  });
});

router.get('/live', (req, res) => {
  res.render('live', {
    title: 'Hack Cambridge Ternary',
    sponsors: loadResource('sponsors'),
    pusherKey: process.env.PUSHER_KEY
  });
});

router.get('/terms-and-conditions', (req, res) => res.render('terms-and-conditions'));

router.get('/faqs', (req, res) => {
  res.render('faqs', {
    faqs: loadResource('faqs')
  });
});

router.get('/privacy-policy', (req, res) => res.render('privacy-policy'));

router.get('/pay', (req, res) => {
  res.render('pay', {
    title: 'Make a payment to Hack Cambridge',
    stripeKey: process.env.STRIPE_PUBLISH_KEY
  });
});

router.get('/favicon.ico', (req, res) => res.sendFile(resolvePath('assets/images/favicons/favicon.ico')));

router.get('/sponsorship', (req, res) => res.render('sponsorship'));

router.get('/favicons/browserconfig.xml', (req, res) => res.render('favicons/browserconfig.xml'));

router.get('/favicons/manifest.json', (req, res) => res.render('favicons/manifest.json'));

export default router;
