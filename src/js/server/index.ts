import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as url from 'url';
import * as moment from 'moment';

import * as auth from 'js/server/auth';
import * as errors from 'js/server/errors';
import * as colors from 'js/shared/colors';
import * as metadata from 'js/shared/metadata';
import * as currentEvent from 'js/server/live/current-event';
import { ServeStaticOptions } from '../../../node_modules/@types/serve-static';
import apiRouter from './api';
import applyRouter from './apply/router';
import hcapiRouter from './hcapi';
import * as utils from './utils';
import * as dates from 'js/shared/dates';
import * as theme from 'js/shared/theme';

const app = express();
app.set('view engine', 'pug');
let server = require('http').Server(app);

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at: Promise', promise, 'reason', reason);
});

utils.init(app);

app.use((req: any, res, next) => {
  res.locals.title = metadata.title;
  res.locals.description = metadata.description;
  res.locals.colors = colors;
  const port = (app.settings.env == 'development') ? ':' + req.app.settings.port : '';
  const protocol = (app.settings.env == 'development') ? req.protocol : 'https';
  res.locals.requestedUrl = req.requestedUrl = url.parse(
    protocol + '://' + req.hostname + port + req.originalUrl
  );
  next();
});

// Static file serving
let staticOptions: ServeStaticOptions = { };
if (app.settings.env != 'development') {
  staticOptions.maxAge = 60 * 60 * 365 * 1000;
}
app.use(require('compression')());
app.use('/assets', express.static(utils.resolvePath('assets/dist'), staticOptions));

auth.setUpAuth(app);

app.locals.asset = utils.asset;

if (process.env.BS_SNIPPET) {
  app.locals.browserSync = process.env.BS_SNIPPET;
}

// Routes

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', apiRouter);
app.use('/apply', applyRouter);
app.use('/hcapi', hcapiRouter);

app.get('/', (req, res) => {
  res.render('index.html', {
    sponsors: utils.loadResource('sponsors')
  });
});

app.get('/live-api/event-info', (req, res) => {
  const schedule = utils.loadResource('schedule');
  res.json({
    currentEvents: currentEvent.getCurrentEvents(schedule),
    nextEvents: currentEvent.getNextEvents(schedule)
  });
});

app.get('/live', (req, res) => {
  res.render('live.html', {
    title: 'Hack Cambridge Ternary',
    sponsors: utils.loadResource('sponsors'),
    pusherKey: process.env.PUSHER_KEY
  });
});

app.get('/terms-and-conditions', (req, res) => {
  res.render('terms-and-conditions.html');
});

app.get('/terms', (req, res) => {
  // This URL was used in 2017 and previously, redirect it to the new location
  res.redirect(301, '/terms-and-conditions');
});

app.get('/faqs', (req, res) => {
  res.render('faqs.html', {
    faqs: utils.loadResource('faqs')
  });
});

app.get('/privacy-policy', (req, res) => {
  res.render('privacy-policy.html');
});

app.get('/privacy', (req, res) => {
  // This URL was used in 2017 and previously, redirect it to the new location
  res.redirect(301, '/privacy-policy');
});

app.get('/pay', (req, res) => {
  res.render('pay.html', {
    title: 'Make a payment to Hack Cambridge',
    stripeKey: process.env.STRIPE_PUBLISH_KEY
  });
});

app.get('/favicon.ico', (req, res) => {
  res.sendFile(utils.resolvePath('assets/images/favicons/favicon.ico'));
});

app.get('/sponsorship', (req, res) => {
  res.render('sponsorship.html');
});

app.get('/event', (req, res) => {
  res.render('event/index.html');
});

app.get('/event/schedule', (req, res) => {
  res.render('event/schedule.html', {
    schedule: utils.loadResource('schedule'),
    workshops: utils.loadResource('workshops'),
    demos: utils.loadResource('api_demos')
  });
});

app.get('/event/hacking', (req, res) => {
  res.render('event/hacking.html', {
    apis: utils.loadResource('apis'),
    prizes: utils.loadResource('prizes')
  });
});

app.get('/event/location', (req, res) => {
  res.render('event/location.html');
});

app.get('/favicons/browserconfig.xml', (req, res) => {
  res.render('favicons/browserconfig.xml');
});

app.get('/favicons/manifest.json', (req, res) => {
  res.render('favicons/manifest.json');
});

app.use((req, res) => {
  res.status(404).render('404.html');
});

app.use(errors.middleware);

// Start server
app.set('port', (process.env.PORT || 3000));

server.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});

export default app;
