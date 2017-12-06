const passport = require('passport');
const BearerStrategy = require('passport-http-bearer');
import cors = require('cors');
const { OauthAccessToken } = require('js/server/models');

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

export const middleware = {
  cors: cors({
    origin: [
      // Match an empty origin to allow external tools (like postman) to easily interact with the API
      '',
      // Match Heroku instances
      /^https:\/\/hackcam(.*).herokuapp.com$/,
      // Match *.hackcambridge.com
      /^https:\/\/(.*\.)?hackcambridge\.com$/,
      // Match local development environment
      /^https?:\/\/localhost(:[0-9]+)?$/,
    ],
    credentials: true,
  }),
  bearer: passport.authenticate('bearer', { session: false }),
};