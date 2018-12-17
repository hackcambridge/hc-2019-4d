import { Request, Response } from 'express';
import { RequestHandlerParams } from 'express-serve-static-core';
import { checkSchema, validationResult, ValidationSchema } from 'express-validator/check';
import { Mailchimp } from 'mailchimp-api';

const MC = new Mailchimp(process.env.MAILCHIMP_API_KEY);

const schema: ValidationSchema = {
  email: {
    in: 'body',
    isEmail: {
      errorMessage: 'Enter an email address',
    },
  },
};

export const createSubscription: RequestHandlerParams = [
  ...checkSchema(schema),
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There's a problem with the existing type definition (`email` has type `{}`)
      const errorMap: any = errors.mapped();
      res.status(400).json(errorMap.email.msg);
    } else {
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
  }
];
