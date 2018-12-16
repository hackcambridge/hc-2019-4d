import { Request, Response } from 'express';
import * as mailchimp from 'mailchimp-api';

const MC = new mailchimp.Mailchimp(process.env.MAILCHIMP_API_KEY);

export function createSubscription(req: Request, res: Response) {
  // TODO: Check user is already subscribed
  MC.lists.subscribe({
    id: process.env.MAILCHIMP_INTERESTED_LIST_ID,
    email: { email: req.body.email },
    merge_vars: { EMAIL: req.body.email },
    update_existing: true
  },
  _ => res.json('An email requesting your confirmation has been sent to the address you provided.'),
  err => {
    if (err.name === 'ValidationError') {
      res.status(400).json(err.error);
    } else {
      res.status(500).json('The server encountered an error.');
    }
  });
}
