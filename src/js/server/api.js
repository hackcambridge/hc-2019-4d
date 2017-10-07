const mailchimp = require('mailchimp-api');
let express = require('express');
let bodyParser = require('body-parser');
let _ = require('lodash');
let stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);
let googleSpreadsheet = require('google-spreadsheet');

const MC = new mailchimp.Mailchimp(process.env.MAILCHIMP_API_KEY);
let google_sheets_auth_email = process.env.GOOGLE_SHEETS_AUTH_EMAIL;
let google_sheets_auth_key = (process.env.GOOGLE_SHEETS_AUTH_KEY || '').replace(/\\n/g, '\n');
let google_sheets_wifi_sheet_id = process.env.GOOGLE_SHEETS_WIFI_SHEET_ID;

let api = module.exports = new express.Router();
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: true }));

api.post('/subscribe', (req, res, next) => {
  if (_.isEmpty(req.body.email)) {
    let err = new Error('Must provide email');
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
  }, (data) => {
    res.json({ message: 'We\'ve added you to our mailing list. Please check your email to confirm.' });
  }, (error) => {
    const err = new Error('We couldn\'t add you. Please check that this is a valid email.');
    err.status = 500;
    next(err);
  });
});

api.post('/payment', (req, res, next) => {
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

  let amount = Math.round(req.body.amount * 100);

  stripe.charges.create({
    amount: amount,
    currency: 'gbp',
    source: req.body.token,
    receipt_email: req.body.email,
    description: req.body.reference
  }, (err, charge) => {
    if (err) {
      let e = new Error(err.message || 'Something went wrong with your transaction.');
      console.error(err);
      e.status = 500;
      next(e);
      return;
    }

    res.json({ message: 'Your payment of £' + (amount / 100).toFixed(2) + ' has been processed. Thank you!'});
  });
});

api.use((req, res, next) => {
  let err = new Error('Not found');
  err.status = 404;
  next(err);
});

api.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500);
  res.json({
    error: err.message || 'An error occurred'
  });
});
