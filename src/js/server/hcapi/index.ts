import * as express from 'express';
import * as bodyParser from 'body-parser';

import * as errors from './errors';
import * as auth from './auth';
import tokensRouter from './tokens';
import adminsRouter from './admins';
import applicationsRouter from './applications';
import statsRouter from './stats';
import criteriaRouter from './criteria';
import ticketsRouter from './tickets';

/**
 * The hcapi is a separate express app to completely separate anything going on in our main website
 */
const hcapi = express();

hcapi.options('*', auth.middleware.cors);
hcapi.use(auth.middleware.cors);
hcapi.use(auth.middleware.bearer);
hcapi.use(bodyParser.json());

// API endpoints
hcapi.use('/tokens', tokensRouter);
hcapi.use('/admins', adminsRouter);
hcapi.use('/applications', applicationsRouter);
hcapi.use('/stats', statsRouter);
hcapi.use('/criteria', criteriaRouter);
hcapi.use('/tickets', ticketsRouter);

// Errors
hcapi.use(errors.middleware.notFound);
hcapi.use(errors.middleware.error);

export default hcapi;
