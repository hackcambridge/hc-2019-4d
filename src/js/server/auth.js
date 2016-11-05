const session     = require('client-sessions');
const querystring = require('querystring');
const fetch       = require('node-fetch');

// Authorisation config
const client_id     = process.env.MYMLH_CLIENT_ID;
const client_secret = process.env.MYMLH_CLIENT_SECRET;
const auth_callback = "http://localhost:3000/auth/callback";
const authorize_url = "https://my.mlh.io/oauth/authorize";
const token_url     = "https://my.mlh.io/oauth/token";
const user_url      = "https://my.mlh.io/api/v2/user.json";
const dashboard_url = "http://localhost:3000/apply"; // The default URL you end up at after logging in

var exports = module.exports = {};

exports.setUpAuth = function (app) {
  // Used to store actual user data to avoid always hitting the db/API
  app.use(session({
    cookieName: 'hc_user',
    secret: process.env.AUTH_SESSION_SECRET,
    duration: 2 * 60 * 60 * 1000, // lives for 2 hours
    activeDuration: 15 * 60 * 1000, // Gets refreshed for 15 mins on use
    httpOnly: true,
    // secure: true,
    ephemeral: true
  }));
  // Used to store the users intended destination
  app.use(session({
    cookieName: 'redirectTo',
    secret: process.env.AUTH_SESSION_SECRET,
    duration: 2 * 60 * 1000, // lives for 2 minutes
    httpOnly: true,
    // secure: true,
    ephemeral: true
  }));

  app.use('/apply', setUserFromSession); // TODO: Stop this firing for static resources
  app.get('/auth/callback', handleCallback);
}

// Ensures that there is user data available, otherwise redirects to authenticate the user
exports.authenticate = function (req, res, next) {
  if (!req.hc_user || !req.hc_user.hasOwnProperty('id')) {
    redirectToAuthorize(req, res);
  } else {
    next();
  }
};

// If there is user data available in the session, make sure it is put in the request and local res objects
function setUserFromSession (req, res, next) {
  if (req.hc_user) {
    // Check if we already have data
    const user = req.hc_user;
    res.locals.user = user;
  }
  next();
}

function handleCallback(req, res) {
  // This is hit directly after the MyMLH authentication has happened
  // Should have authorization code in query
  if (req.query.code === undefined) {
    redirectToAuthorize(req, res);
  }

  getToken(req.query.code).then(function(access_token) {
    return getUser(access_token);
  }).then(function(user) {
    // We got the user object, crack on
    req.hc_user = user;
    res.locals.user = user;

    // Get the redirect URL if it exists
    var redirectTo = req.redirectTo.url ? req.redirectTo.url : '/';

    // For debugging
    if (!req.redirectTo) {
      console.log("No redirect URL stored");
    }

    // Delete the redirect data as it's no longer needed
    delete req.redirectTo;

    // Redirect with auth
    res.redirect(redirectTo);
  }).catch(function(err) {
    // Couldn't get the user data, redirect to the auth page
    console.log("Caught bad code");
    console.log(err);
    redirectToAuthorize(req, res);
  });
}

function redirectToAuthorize(req, res) {
  // Store where the user was trying to get to so we can get back there

  req.redirectTo = {url: req.originalUrl};

  console.log("Tried to store in cookie: " + req.originalUrl);

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

  // Redirect to the authorization page on MyMLH
  res.redirect(authorize_url + "?" + qs);
}

// Take a code and return a promise of an access token
function getToken(code) {
  // Now we have an authorization code, we can exchange for an access token
  var base_url = "https://my.mlh.io/oauth/token";

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

  return fetch(base_url, {

    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify(body)

  }).then(function(response) {

    return response.json();

  }).then(function(json) {

    return json.access_token;

  });
}

// Take an access_token and return a promise of user info from the MyMLH api
function getUser(access_token) {
  var query = {
    access_token: access_token
  }
  var query_string = querystring.stringify(query);
  var full_url = user_url + "?" + query_string;

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