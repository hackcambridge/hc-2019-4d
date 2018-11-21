import { urlencoded as parseUrlEncoded } from 'body-parser';
import * as compression from 'compression';
import * as express from 'express';
import * as moment from 'moment';
import { ServeStaticOptions } from 'serve-static';
import { parse as parseUrl } from 'url';

import { applicationsMiddleware } from 'js/server/middleware';
import { apiRouter, applyRouter, eventRouter, hcApiRouter, router } from './routes';

import { setUpAuth } from 'js/server/auth';
import { middleware as errorMiddleware } from 'js/server/errors';
import { asset, init as initializeUtils, resolvePath as resolveAssetPath } from 'js/server/utils';

import * as colors from 'js/shared/colors';
import * as dates from 'js/shared/dates';
import * as metadata from 'js/shared/metadata';
import * as theme from 'js/shared/theme';

const app = express();
const server = require('http').Server(app);

app.set('view engine', 'pug');
// Start server
app.set('port', (process.env.PORT || 3000));

server.listen(app.get('port'), _ => console.log('Node app is running on port', app.get('port')));

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at: Promise', promise, 'reason', reason);
});

app.use((req: any, res, next) => {
  res.locals.title = metadata.title;
  res.locals.description = metadata.description;
  res.locals.colors = colors;
  res.locals.event = { dates, theme };
  const port = (app.settings.env === 'development') ? ':' + req.app.settings.port : '';
  const protocol = (app.settings.env === 'development') ? req.protocol : 'https';
  res.locals.requestedUrl = req.requestedUrl = parseUrl(
    protocol + '://' + req.hostname + port + req.originalUrl
  );
  next();
});

initializeUtils(app);

// Static file serving
const staticOptions: ServeStaticOptions = { };
if (app.settings.env !== 'development') {
  staticOptions.maxAge = 60 * 60 * 365 * 1000;
}
app.use(compression());
app.use('/assets', express.static(resolveAssetPath('assets/dist'), staticOptions));

setUpAuth(app);
app.use(applicationsMiddleware.setAppliedStatus);
app.use(applicationsMiddleware.setApplicationsStatus);

app.locals.asset = asset;
app.locals.moment = moment;

if (process.env.BS_SNIPPET) {
  app.locals.browserSync = process.env.BS_SNIPPET;
}

app.use(parseUrlEncoded({ extended: true }));
app.use('/', router);
app.use('/api', apiRouter);
app.use('/apply', applyRouter);
app.use('/event', eventRouter);
app.use('/hcapi', hcApiRouter);

// This URL was sent out as a typo in a 2019 social media email.
app.get('/appl', (_, res) => res.redirect(302, '/apply'));

app.use((req, res) => res.status(404).render('404'));

app.use(errorMiddleware);

export default app;
