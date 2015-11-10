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
var mailchimp = require('mailchimp-api');
var MC = new mailchimp.Mailchimp(process.env.MAILCHIMP_API_KEY);
var app = express();

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

nunjucksEnv.addGlobal('asset', function (asset) {
  if (_.has(assetsFile, asset)) {
    asset = assetsFile[asset];
  }

  return '/assets/' + asset;
});

// API
var api = new express.Router();
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: true }));

api.post('/subscribe', function (req, res, next) {
  console.log(req.body);
  if (_.isEmpty(req.body.email)) {
    var err = new Error('Must provide email');
    err.status = 401;
    next(err);
    return;
  }

  // TODO: Check user is already subscribed
  MC.lists.subscribe({
    id: process.env.MAILCHIMP_LIST_ID,
    email: { email: req.body.email },
    merge_vars: { EMAIL: req.body.email },
    update_existing: true
  }, function(data) {
      res.json({ message: 'We\'ve added you to our mailing list. Please check your email to confirm.' });
  }, function(error) {
      var err = new Error('We couldn\'t add you. Please check that this is a valid email.');
      err.status = 500;
      next(err);
  });
});

api.use(function (req, res, next) {
  var err = new Error('Not found');
  err.status = 404;
  next(err);
});

api.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500);
  res.json({
    error: err.message || 'An error occurred'
  });
});

// Routes
app.use('/api', api);

app.get('/', function (req, res) {
  var faqs =[];
   if(app.settings.env == "development") {
      faqs = JSON.parse(fs.readFileSync('./resources/faqs.json'));
	} else {
      faqs = require('./resources/faqs.json');
	}
    console.log(faqs);
    res.render('index.html', {faqs: faqs.faqs});
});

app.get('/favicon.ico', function (req, res) {
  res.sendFile(path.join(__dirname, '/assets/images/favicon.ico'));
});

app.use(function (req, res) {
  res.render('index.html');
});

// Start server
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
