'use strict';

let express = require('express');
let nunjucks = require('nunjucks');
let bodyParser = require('body-parser');
let url = require('url');
let utils = require('./utils');
let app = express();
const auth = require('js/server/auth');
const errors = require('js/server/errors');
const colors = require('js/shared/colors');
const metadata = require('js/shared/metadata');

let server = require('http').Server(app);

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at: Promise', promise, 'reason', reason);
});

utils.init(app);

app.use((req, res, next) => {
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
let staticOptions = { };
if (app.settings.env != 'development') {
  staticOptions.maxAge = 60 * 60 * 365 * 1000;
}
app.use(require('compression')());
app.use('/assets', express.static(utils.resolvePath('assets/dist'), staticOptions));

auth.setUpAuth(app);

// View rendering
nunjucks.configure(utils.resolvePath('src/views'), {
  autoescape: true,
  noCache: app.settings.env == 'development',
  express: app
});

app.locals.asset = utils.asset;
app.locals.loadAsset = utils.loadAsset;
app.locals.markdownResource = utils.loadMarkdown;

if (process.env.BS_SNIPPET) {
  app.locals.browserSync = process.env.BS_SNIPPET;
}

// Routes

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', require('./api'));
app.use('/apply', require('./apply/router'));
app.use('/hcapi', require('./hcapi'));

app.get('/', (req, res) => {
  res.render('index.html', {
    sponsors: utils.loadResource('sponsors'),
  });
});

app.get('/event', (req, res) => {
  res.render('event.html', {
    title: 'Hack Cambridge Ternary',
    api_demos: utils.loadResource('api_demos'),
    workshops: utils.loadResource('workshops'),
    prizes: utils.loadResource('prizes'),
    schedule: utils.loadResource('schedule'),
    apis: utils.loadResource('apis')
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

app.use((req, res) => {
  res.status(404).render('404.html');
});

app.use(errors.middleware);

// Start server
app.set('port', (process.env.PORT || 3000));

module.exports = app;

server.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'));
});
