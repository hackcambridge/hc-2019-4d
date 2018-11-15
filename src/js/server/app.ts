import * as express from 'express';
import * as url from 'url';
import * as moment from 'moment';
import * as bodyParser from 'body-parser';
import { ServeStaticOptions } from 'serve-static';

import router from './routes/router';
import apiRouter from './routes/api-router';
import applyRouter from './routes/apply-router';
import eventRouter from './routes/event-router';
import hcApiRouter from './routes/hc-api-router';

import * as auth from 'js/server/auth';
import * as utils from 'js/server/utils';
import * as errors from 'js/server/errors';

import * as colors from 'js/shared/colors';
import * as metadata from 'js/shared/metadata';
import * as dates from 'js/shared/dates';
import * as theme from 'js/shared/theme';

const app = express();
let server = require('http').Server(app);

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
  res.locals.user = req.user;
  const port = (app.settings.env == 'development') ? ':' + req.app.settings.port : '';
  const protocol = (app.settings.env == 'development') ? req.protocol : 'https';
  res.locals.requestedUrl = req.requestedUrl = url.parse(
    protocol + '://' + req.hostname + port + req.originalUrl
  );
  next();
});

utils.init(app);

// Static file serving
let staticOptions: ServeStaticOptions = { };
if (app.settings.env != 'development') {
  staticOptions.maxAge = 60 * 60 * 365 * 1000;
}
app.use(require('compression')());
app.use('/assets', express.static(utils.resolvePath('assets/dist'), staticOptions));

auth.setUpAuth(app);

app.locals.asset = utils.asset;
app.locals.moment = moment;

if (process.env.BS_SNIPPET) {
  app.locals.browserSync = process.env.BS_SNIPPET;
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', router);
app.use('/api', apiRouter);
app.use('/apply', applyRouter);
app.use('/event', eventRouter);
app.use('/hcapi', hcApiRouter);

app.use((req, res) => res.status(404).render('404'));

app.use(errors.middleware);

export default app;
