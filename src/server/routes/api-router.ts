// TODO: update to mailchimp-api-v3
import { json as parseJson, urlencoded as parseUrlEncoded } from 'body-parser';
import { Router } from 'express';
import { isEmpty } from 'lodash';
import * as mailchimp from 'mailchimp-api';
import * as Stripe from 'stripe';

import { ErrorWithStatus } from 'server/utils';

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);

const MC = new mailchimp.Mailchimp(process.env.MAILCHIMP_API_KEY);

const api = Router();
api.use(parseJson());
api.use(parseUrlEncoded({ extended: true }));

api.post('/subscribe/interested', (req, res, next) => {
  if (isEmpty(req.body.email)) {
    next(new ErrorWithStatus('Must provide email', 401));
    return;
  }

  // TODO: Check user is already subscribed
  MC.lists.subscribe({
    id: process.env.MAILCHIMP_INTERESTED_LIST_ID,
    email: { email: req.body.email },
    merge_vars: { EMAIL: req.body.email },
    update_existing: true
  }, _data => {
    res.json({ message: 'We\'ve added you to our mailing list. Please check your email to confirm.' });
  }, _error => {
    next(new ErrorWithStatus('We couldn\'t add you. Please check that this is a valid email.', 500));
  });
});

api.post('/payment', (req, res, next) => {
  if (isEmpty(req.body.reference)) {
    next(new ErrorWithStatus('Must provide reference', 401));
  }
  if (isEmpty(req.body.amount)) {
    next(new ErrorWithStatus('Must provide amount', 401));
  }
  if (isEmpty(req.body.token)) {
    next(new ErrorWithStatus('Must provide token', 401));
  }
  if (isEmpty(req.body.email)) {
    next(new ErrorWithStatus('Must provide email', 401));
  }

  const amount = Math.round(req.body.amount * 100);

  stripe.charges.create({
    amount,
    currency: 'gbp',
    source: req.body.token,
    receipt_email: req.body.email,
    description: req.body.reference
  }, (err, _charge) => {
    if (err) {
      console.error(err);
      next(new ErrorWithStatus(err.message || 'Something went wrong with your transaction.', 500));
      return;
    }

    res.json({ message: 'Your payment of £' + (amount / 100).toFixed(2) + ' has been processed. Thank you!'});
  });
});

api.use((_req, _res, next) => {
  next(new ErrorWithStatus('Not found', 404));
});

api.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500);
  res.json({
    error: err.message || 'An error occurred'
  });
});

export default api;
