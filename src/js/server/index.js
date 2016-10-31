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
var fetch = require('node-fetch');

// Authorisation config
let client_id = process.env.MYMLH_CLIENT_ID;
let client_secret = process.env.MYMLH_CLIENT_SECRET;
let auth_callback = "http://localhost:3000/apply/success";

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

// Take a code and return a promise of user info from the MyMLH api
function getUser(access_token) {
  var base_url = "https://my.mlh.io/api/v2/user.json";
  var query = {
    access_token: access_token
  }
  var query_string = querystring.stringify(query);
  var full_url = base_url + "?" + query_string;

  return fetch(full_url, {
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'GET',
  }).then(function(response) {
    return response.json();
  }).then(function(json) {
    if (json.hasOwnProperty("data")) {
      return json.data;
    } else {
      console.log("Bad data");
      console.log(json);
      throw "Couldn't get user data";
    }
  });
}

app.get('/', renderHome);

app.get('/terms', function (req, res) {
  res.render('terms.html');
});

app.get('/apply', function (req, res) {
  res.render('apply.html');
});

app.get('/apply/mymlh', function(req, res) {
  let base_url = "https://my.mlh.io/oauth/authorize";

  // Construct the query string
  var qs = querystring.stringify({
    client_id: client_id,
    redirect_uri: auth_callback,
    response_type: 'code',
    scope: [
      // All the user details we need
      'email',
      'phone_number',
      'demographics',
      'birthday',
      'education',
      'event'
    ].join(' ')
  });

  // Redirec to the authorization page on MyMLH
  res.redirect(base_url + "?" + qs);
})

app.get('/apply/success', function(req, res) {

  // Now we have an authorization code, we can get an access token
  var base_url = "https://my.mlh.io/oauth/token";
  var code = req.query.code;

  // For debugging purposes
  console.log(code);


  var headers = { 'Content-Type': 'application/json' }
  var body = {
    'client_id': client_id,
    'client_secret': client_secret,
    'code': code,
    'grant_type': "authorization_code",
    'redirect_uri': auth_callback
  }

  fetch(base_url, {

    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(body)

  }).then(function(response) {
    return response.json();
  }).then(function(j) {
    getUser(j.access_token).then(function(user) {
      console.log(user);
      res.render('success.html', {
        user: user
      });
    }).catch(function(err) {
      console.log("Caught bad code")
      console.log(err);
      // Couldn't get the user data, redirect to the auth page
      res.redirect('/apply/mymlh');
    });
  }).catch(function(err) {
    // Error :(
    console.log(err);
  });
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
