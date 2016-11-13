'use strict';

var express = require('express');
var nunjucks = require('nunjucks');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var url = require('url');
var querystring = require('querystring');
var yaml = require('js-yaml');
var crypto = require('crypto');
var Countdown = require('js/shared/countdown');
const session = require('client-sessions');
var utils = require('./utils');
var app = express();
const auth = require('js/server/auth');

var server = require('http').Server(app);
var fetch = require('node-fetch');
const { dbSynced } = require('js/server/models');

require('./sockets.js')(server);

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at: Promise', promise, 'reason', reason);
});

utils.init(app);

app.use(function(req, res, next) {
  // Force https
  if ((req.headers['x-forwarded-proto'] != 'https') && (process.env.FORCE_HTTPS == "1")) {
    res.redirect('https://' + req.hostname + req.originalUrl);
  } else {
    next();
  }
});

app.use(function (req, res, next) {
  res.locals.title = 'Hack Cambridge';
  const port = (app.settings.env == "development") ? ':' + req.app.settings.port : '';
  res.locals.requestedUrl = req.requestedUrl = url.parse(
    req.protocol + '://' + req.hostname + port + req.originalUrl
  );
  next();
});

auth.setUpAuth(app);

// Static file serving
var staticOptions = { };
if (app.settings.env != 'development') {
  staticOptions.maxAge = 60 * 60 * 365 * 1000;
}
app.use(require('compression')());
app.use('/assets', express.static(utils.resolvePath('assets/dist'), staticOptions));

// View rendering
var nunjucksEnv = nunjucks.configure(utils.resolvePath('src/views'), {
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
app.use('/apply', require('./routes/apply'));

function renderHome(req, res) {
  res.render('index.html', {
    faqs: utils.loadResource('faqs'),
    sponsors: utils.loadResource('sponsors'),
    countdown: Countdown.createStartCountdown()
  });
}

app.get('/', renderHome);

app.get('/terms', function (req, res) {
  res.render('terms.html');
});

app.get('/privacy', function (req, res) {
  res.render('privacy.html');
});

app.get('/pay', function (req, res) {
  res.render('pay.html', {
    title: 'Make a payment to Hack Cambridge',
    stripeKey: process.env.STRIPE_PUBLISH_KEY
  });
});

app.get('/volunteers', (req, res) => {
  res.redirect(302, 'https://goo.gl/forms/2jHTyCKiXQgGR6Jy2');
})

app.get('/favicon.ico', function (req, res) {
  res.sendFile(utils.resolvePath('assets/images/favicon.ico'));
});

app.use((req, res) => {
  res.status(404).render('404.html');
});

// Start server
app.set('port', (process.env.PORT || 3000));

module.exports = app;

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
