import mailchimp = require('mailchimp-api');
import express = require('express');
import bodyParser = require('body-parser');
import _ = require('lodash');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

import ErrorWithStatus from './error-with-status';

const MC = new mailchimp.Mailchimp(process.env.MAILCHIMP_API_KEY);

let api = module.exports = express.Router();
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: true }));

api.post('/subscribe/interested', (req, res, next) => {
  if (_.isEmpty(req.body.email)) {
    let err = new ErrorWithStatus('Must provide email', 401);
    next(err);
    return;
  }

  // TODO: Check user is already subscribed
  MC.lists.subscribe({
    id: process.env.MAILCHIMP_INTERESTED_LIST_ID,
    email: { email: req.body.email },
    merge_vars: { EMAIL: req.body.email },
    update_existing: true
  }, (data) => {
    res.json({ message: 'We\'ve added you to our mailing list. Please check your email to confirm.' });
  }, (error) => {
    const err = new ErrorWithStatus('We couldn\'t add you. Please check that this is a valid email.', 500);
    next(err);
  });
});

api.post('/payment', (req, res, next) => {
  if (_.isEmpty(req.body.reference)) {
    const err = new ErrorWithStatus('Must provide reference', 401);
    next(err);
  }

  if (_.isEmpty(req.body.amount)) {
    const err = new ErrorWithStatus('Must provide amount', 401);
    next(err);
  }

  if (_.isEmpty(req.body.token)) {
    const err = new ErrorWithStatus('Must provide token', 401);
    next(err);
  }

  if (_.isEmpty(req.body.email)) {
    const err = new ErrorWithStatus('Must provide email', 401);
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
      let e = new ErrorWithStatus(err.message || 'Something went wrong with your transaction.', 500);
      console.error(err);
      next(e);
      return;
    }

    res.json({ message: 'Your payment of £' + (amount / 100).toFixed(2) + ' has been processed. Thank you!'});
  });
});

api.use((req, res, next) => {
  let err = new ErrorWithStatus('Not found', 404);
  next(err);
});

api.use((err: Error | ErrorWithStatus, req, res, next) => {
  console.error(err.stack);
  res.status((err instanceof ErrorWithStatus) ? (err.status ? err.status : 500) : 500);
  res.json({
    error: err.message || 'An error occurred'
  });
});
