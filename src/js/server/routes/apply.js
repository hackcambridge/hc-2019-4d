const express = require('express');
const { createApplicationForm, maxFieldSize } = require('js/shared/application-form');
const renderForm = require('js/shared/render-form');
var querystring = require('querystring');
var fetch = require('node-fetch');
const multer = require('multer');
const crypto = require('crypto');

// Authorisation config
let client_id = process.env.MYMLH_CLIENT_ID;
let client_secret = process.env.MYMLH_CLIENT_SECRET;
let auth_callback = "http://localhost:3000/apply/form";

const applyFormUpload = multer({
  // storage: s3?
  limits: {
    fields: 20,
    fieldSize: maxFieldSize
  },
  fileFilter(req, file, callback) {
    // At this stage, we know we are only uploading a CV in PDF. Only accept PDFs
    if (file.mimetype === 'application/pdf') {
      callback(null, true);
    }

    callback(null, false);
  },
});

const applyRouter = new express.Router();

applyRouter.post('/form', applyFormUpload.single('cv'), (req, res) => {
  const form = createApplicationForm();

  // HACK: Put all our fields in the same place by moving the file into req.body
  req.body.cv = req.file;

  form.handle(req.body, {
    success: () => {
      // redirect to the next page but for now...
      res.redirect('/form');
    },
    error: (resultForm) => {
      renderApplyPageWithFormAndUser(res, resultForm, null);
    },
    empty: () => {
      renderApplyPageWithFormAndUser(res, form, null);
    }
  });
});

// The main apply page (has the login button)
applyRouter.get('/', function (req, res) {
  res.render('apply/index.html');
});

// The redirect to the authorization page
applyRouter.get('/auth', function(req, res) {
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

  // Redirect to the authorization page on MyMLH
  res.redirect(base_url + "?" + qs);
})

// Redirect the request if there is no code in the query
function ensureCode(req, res) {
  if (req.query.code === undefined) {
    res.redirect('/auth');
  }
}

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

// Render the form for additional applicant details
applyRouter.get('/form', function(req, res) {

  ensureCode(req, res);

  getToken(req.query.code).then(function(access_token) {
    getUser(access_token).then(function(user) {
      // We got the user object, render the page
      console.log(user);
      renderApplyPageWithFormAndUser(res, createApplicationForm(), user);

    }).catch(function(err) {
      // Couldn't get the user data, redirect to the auth page
      console.log("Caught bad code")
      console.log(err);
      res.redirect('/apply/auth');
    });
  }).catch(function(err) {
    // Something went south
    console.log(err);
  })

});

function renderApplyPageWithFormAndUser(res, form, user) {
  res.render('apply/form.html', {
    formHtml: form.toHTML(renderForm),
    user: user
  });
}

module.exports = applyRouter;