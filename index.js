'use strict';

try {
  require('dotenv').load();
} catch (e) { }

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
var mailchimp = require('mailchimp-api');
var Countdown = require('./lib/countdown');
var utils = require('./utils');
var MC = new mailchimp.Mailchimp(process.env.MAILCHIMP_API_KEY);
var app = express();


utils.init(app);

// Static file serving
var staticOptions = { };
if (app.settings.env != 'development') {
  staticOptions.maxAge = 60 * 60 * 365;
}

app.use('/assets', express.static('assets/dist', staticOptions));

// View rendering
var nunjucksEnv = nunjucks.configure('views', {
  autoescape: true,
  noCache: app.settings.env == 'development',
  express: app
});

var assetsFile;
try {
  assetsFile = require('./assets/dist/rev-manifest.json');
} catch (e) {
  assetsFile = { };
}

app.locals.asset = function (asset) {
  if (_.has(assetsFile, asset)) {
    asset = assetsFile[asset];
  }

  return '/assets/' + asset;
};

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

app.use('/api', require('./api'));

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

app.get('/apply', function (req, res) {
  crypto.randomBytes(3, function(ex, buf) {
    var token = buf.toString('hex') + '-' + (Math.floor(Date.now() / 1000).toString().substr(-6));
    var formUrl = url.parse(process.env.APPLICATION_URL);
    // Search contains `?` character as first character
    // So we remove it
    var query = querystring.parse(formUrl.search.substr(1));

    if (_.has(req.query, 'referrer')) {
      query.referrer = req.query.referrer;
    }
    query.applicationid = token;

    formUrl.search = querystring.stringify(query);

    res.render('form.html', {
      title: 'Apply to Hack Cambridge',
      formUrl: url.format(formUrl)
    });
  });
});

app.get('/event', function (req, res) {
  res.render('event.html', {
    title: 'Hack Cambridge 2016',
    workshops: utils.loadResource('workshops'),
    prizes: utils.loadResource('prizes'),
    schedule: utils.loadResource('schedule')
  });
});

app.get('/teamapply', function(req, res) {
  res.render('form.html', {
    title: 'Apply to Hack Cambridge as a Team',
    formUrl: process.env.TEAM_APPLICATION_URL
  })
});

app.get('/pay', function (req, res) {
  res.render('pay.html', {
    title: 'Make a payment to Hack Cambridge',
    stripeKey: process.env.STRIPE_PUBLISH_KEY
  });
});

app.get('/favicon.ico', function (req, res) {
  res.sendFile(path.join(__dirname, '/assets/images/favicon.ico'));
});

app.use(renderHome);

// Start server
app.set('port', (process.env.PORT || 3000));

module.exports = app;

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
