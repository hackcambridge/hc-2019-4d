import { json as parseJson, urlencoded as parseUrlEncoded } from 'body-parser';
import { Request, Response, Router } from 'express';

import { getCurrentEvents, getNextEvents } from 'server/live/current-event';
import { loadResource, resolvePath } from 'server/utils';

import { emailSubscriptionsController } from 'server/controllers';

const router = Router();

router.get('/', (_req, res) => {
  res.render('index', {
    sponsors: loadResource('sponsors')
  });
});

router.get('/live-api/event-info', (_req, res) => {
  const schedule = loadResource('schedule');
  res.json({
    currentEvents: getCurrentEvents(schedule),
    nextEvents: getNextEvents(schedule)
  });
});

router.get('/terms-and-conditions', (_req, res) => res.render('terms-and-conditions'));

router.get('/faqs', (_req, res) => {
  res.render('faqs', {
    faqs: loadResource('faqs')
  });
});

router.get('/privacy-policy', (_req, res) => res.render('privacy-policy'));

router.get('/favicon.ico', (_req, res) => res.sendFile(resolvePath('assets/images/favicons/favicon.ico')));

router.get('/sponsorship', (_req, res) => res.render('sponsorship'));

router.get('/live', (_req, res) => res.render('live', { pusherKey: process.env.PUSHER_KEY }));

router.get('/favicons/browserconfig.xml', (_req, res) => res.sendFile(resolvePath('assets/images/favicons/browserconfig.xml')));

router.get('/favicons/manifest.json', (_req, res) => res.sendFile(resolvePath('assets/images/favicons/manifest.json')));

router.use(parseJson());
router.use(parseUrlEncoded({ extended: true }));
router.route('/email-subscriptions')
  .post(emailSubscriptionsController.createSubscription)
  .all((_req: Request, res: Response) => res.sendStatus(405));

export default router;
