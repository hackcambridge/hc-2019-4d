const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const BearerStrategy = require('passport-http-bearer');
const { Admin, OauthAccessToken } = require('js/server/models');
const errors = require('./errors');

passport.use(new BearerStrategy((token, done) => {
  OauthAccessToken.getAdminFromTokenString(token)
    .then((admin) => {
      if (!admin) {
        done(null, false);
        return;
      }

      done(null, admin, { scope: 'all' });
    })
    .catch(error => done(error));
}));

/**
 * The hcapi is a separate express app to completely separate anything going on in our main website
 */
const hcapi = express();

hcapi.use(passport.authenticate('bearer', { session: false }));
hcapi.use(bodyParser.json());

// API endpoints
hcapi.use('/tokens', require('./tokens'));
hcapi.use('/admins', require('./admins'));
hcapi.use('/applications', require('./applications'));

// Errors
hcapi.use(errors.middleware.notFound);
hcapi.use(errors.middleware.error);

module.exports = hcapi;
