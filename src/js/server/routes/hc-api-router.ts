import * as express from 'express';
import { json as parseJson } from 'body-parser';

import * as errors from './hc-api/errors';
import * as auth from './hc-api/auth';
import tokensRouter from './hc-api/tokens';
import adminsRouter from './hc-api/admins';
import applicationsRouter from './hc-api/applications';
import statsRouter from './hc-api/stats';
import criteriaRouter from './hc-api/criteria';
import ticketsRouter from './hc-api/tickets';

/**
 * The hc-api is a separate express app to completely separate anything going on in our main website
 */
const hcApi = express();

hcApi.options('*', auth.middleware.cors);
hcApi.use(auth.middleware.cors);
hcApi.use(auth.middleware.bearer);
hcApi.use(parseJson());

// API endpoints
hcApi.use('/tokens', tokensRouter);
hcApi.use('/admins', adminsRouter);
hcApi.use('/applications', applicationsRouter);
hcApi.use('/stats', statsRouter);
hcApi.use('/criteria', criteriaRouter);
hcApi.use('/tickets', ticketsRouter);

// Errors
hcApi.use(errors.middleware.notFound);
hcApi.use(errors.middleware.error);

export default hcApi;
