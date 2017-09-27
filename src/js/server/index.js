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
const chalk = require('chalk');
var utils = require('./utils');
var app = express();
const auth = require('js/server/auth');
const errors = require('js/server/errors');
const colors = require('js/shared/colors');
const statuses = require('js/shared/status-constants');

var server = require('http').Server(app);
var fetch = require('node-fetch');
const { dbSynced } = require('js/server/models');

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at: Promise', promise, 'reason', reason);
});

utils.init(app);

app.use(function (req, res, next) {
  res.locals.title = 'Hack Cambridge';
  res.locals.colors = colors;
  const port = (app.settings.env == 'development') ? ':' + req.app.settings.port : '';
  const protocol = (app.settings.env == 'development') ? req.protocol : 'https';
  res.locals.requestedUrl = req.requestedUrl = url.parse(
    protocol + '://' + req.hostname + port + req.originalUrl
  );
  next();
});

// Static file serving
var staticOptions = { };
if (app.settings.env != 'development') {
  staticOptions.maxAge = 60 * 60 * 365 * 1000;
}
app.use(require('compression')());
app.use('/assets', express.static(utils.resolvePath('assets/dist'), staticOptions));

auth.setUpAuth(app);

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
app.use('/apply', require('./apply/router'));
app.use('/hcapi', require('./hcapi'));

function renderHome(req, res) {
  res.render('index.html', {
    faqs: utils.loadResource('faqs'),
    sponsors: utils.loadResource('sponsors'),
    countdown: Countdown.createStartCountdown(),
    applicationsOpen: process.env.APPLICATIONS_OPEN_STATUS == statuses.applicationsOpen.OPEN,
  });
}

app.get('/', renderHome);

app.get('/terms-and-conditions', function (req, res) {
  res.render('terms-and-conditions.html');
});

// 2017 page location

app.get('/terms', function (req, res) {
  res.redirect(301, '/terms-and-conditions');
});

app.get('/splash18', function (req, res) {
    res.render('splash.html');
});

app.get('/privacy-policy', function (req, res) {
  res.render('privacy-policy.html');
});

// 2017 page location

app.get('/privacy', function (req, res) {
  res.redirect(301, '/privacy-policy');
});

app.get('/pay', function (req, res) {
  res.render('pay.html', {
    title: 'Make a payment to Hack Cambridge',
    stripeKey: process.env.STRIPE_PUBLISH_KEY
  });
});

app.get('/event', function (req, res) {
  res.render('event.html', {
    title: 'Hack Cambridge Recurse',
    api_demos: utils.loadResource('api_demos'),
    workshops: utils.loadResource('workshops'),
    prizes: utils.loadResource('prizes'),
    schedule: utils.loadResource('schedule'),
    apis: utils.loadResource('apis')
  });
});

app.get('/live', function (req, res) {
  res.render('live.html', {
    title: 'Hack Cambridge Recurse',
    sponsors: utils.loadResource('sponsors'),
    pusherKey: process.env.PUSHER_KEY,
  });
});

app.get('/volunteers', (req, res) => {
  res.redirect(302, 'https://goo.gl/forms/2jHTyCKiXQgGR6Jy2');
});

app.get('/favicon.ico', function (req, res) {
  res.sendFile(utils.resolvePath('assets/images/favicon.ico'));
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

server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
