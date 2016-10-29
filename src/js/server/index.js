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
var utils = require('./utils');
var app = express();

var server = require('http').Server(app);

require('./sockets.js')(server);

utils.init(app);

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

app.use(function(req, res, next) {
  // Force https
  if ((req.headers['x-forwarded-proto'] != 'https') && (process.env.FORCE_HTTPS == "1")) {
    res.redirect('https://' + req.hostname + req.originalUrl);
  } else {
    next();
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', require('./api'));
app.use('/apply', require('./routes/apply'));

app.use(function (req, res, next) {
  res.locals.title = 'Hack Cambridge';
  var port = (app.settings.env == "development") ? ':' + req.app.settings.port : '';
  res.locals.requestedUrl = url.parse(
    req.protocol + '://' + req.hostname + port + req.originalUrl
  );
  next();
});

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

app.get('/apply', (req, res) => {
  
});

app.get('/favicon.ico', function (req, res) {
  res.sendFile(path.join(__dirname, '/assets/images/favicon.ico'));
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
