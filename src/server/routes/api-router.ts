// TODO: update to mailchimp-api-v3
import { json as parseJson, urlencoded as parseUrlEncoded } from 'body-parser';
import { Router } from 'express';
import { isEmpty } from 'lodash';
import * as mailchimp from 'mailchimp-api';

import { ErrorWithStatus } from 'server/utils';

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
