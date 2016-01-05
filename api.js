var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

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

  stripe.charges.create({
    amount: Math.round(req.body.amount * 100),
    currency: 'gbp',
    source: req.body.token,
    description: 'Reference: ' + req.body.reference + '\nAmount: ' + req.body.amount
  }, function (err, charge) {
    if (err) {
      var e = new Error('Something went wrong with your transaction');
      console.error(err);
      e.status = 500;
      next(e);
      return;
    }

    res.json({ message: 'Your payment has been processed. Thank you!'});
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
