var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
var googleSpreadsheet = require("google-spreadsheet");
var google_sheets_auth_email = process.env.GOOGLE_SHEETS_AUTH_EMAIL;
var google_sheets_auth_key = (process.env.GOOGLE_SHEETS_AUTH_KEY || '').replace(/\\n/g, '\n');
var google_sheets_wifi_sheet_id = process.env.GOOGLE_SHEETS_WIFI_SHEET_ID;

var api = module.exports = new express.Router();
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: true }));

api.post('/subscribe', function (req, res, next) {
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

api.post('/payment', function (req, res, next) {
  if (_.isEmpty(req.body.reference)) {
    var err = new Error('Must provide reference');
    err.status = 401;
    next(err);
  }

  if (_.isEmpty(req.body.amount)) {
    var err = new Error('Must provide amount');
    err.status = 401;
    next(err);
  }

  if (_.isEmpty(req.body.token)) {
    var err = new Error('Must provide token');
    err.status = 401;
    next(err);
  }

  if (_.isEmpty(req.body.email)) {
    var err = new Error('Must provide email');
    err.status = 401;
    next(err);
  }

  var amount = Math.round(req.body.amount * 100);

  stripe.charges.create({
    amount: amount,
    currency: 'gbp',
    source: req.body.token,
    receipt_email: req.body.email,
    description: req.body.reference
  }, function (err, charge) {
    if (err) {
      var e = new Error(err.message || 'Something went wrong with your transaction.');
      console.error(err);
      e.status = 500;
      next(e);
      return;
    }

    res.json({ message: 'Your payment of £' + (amount / 100).toFixed(2) + ' has been processed. Thank you!'});
  });
});

api.post('/wifi', function (req, res, next) {
  if (_.isEmpty(req.body.ticket_id)) {
    var err = new Error('Must provide ticket_id');
    err.status = 401;
    next(err);
  }

  var ticket_id = req.body.ticket_id;
  var google_sheets_auth = {
    client_email: google_sheets_auth_email,
    private_key: google_sheets_auth_key
  }

  // spreadsheet key is the long id in the sheets URL
  var wifi_sheet = new googleSpreadsheet(google_sheets_wifi_sheet_id);

  wifi_sheet.useServiceAccountAuth(google_sheets_auth, function(err) {
	  // getInfo returns info about the sheet and an array or "worksheet" objects

	  wifi_sheet.getInfo(function(err, sheet_info) {

		  var ticket_sheet = sheet_info.worksheets[1];
		  ticket_sheet.getRows({
        "start-index": 1,
        "max-results": 1,
        "query":  "applicationid = " + ticket_id
      }, function(err, rows) {
        if (err) {
          var err = new Error('An error occured');
          err.status = 500;
          next(err);
          return;
        } else if (rows.length == 0) {
          var err = new Error('Ticket ID not found');
          err.status = 404;
          next(err);
          return;
        }

        var wifi_key = rows[0].uisid;
        res.json({ message: 'Your UIS WiFi key is: <code>' + wifi_key + '</code>'});
		  });
	  });
  })
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
