import session     = require('client-sessions');
import fetch       = require('node-fetch');
import querystring = require('querystring');
import url         = require('url');

import { Hacker } from 'js/server/models';

// Authorisation config
const client_id     = process.env.MYMLH_CLIENT_ID;
const client_secret = process.env.MYMLH_CLIENT_SECRET;
const authorize_url = 'https://my.mlh.io/oauth/authorize';
const token_url     = 'https://my.mlh.io/oauth/token';
const user_url      = 'https://my.mlh.io/api/v2/user.json';
const auth_callback = '/auth/callback';
const dashboard_url = '/apply/dashboard'; // The default URL you end up at after logging in

class Auth {
  public static setUpAuth(app): void {
    // Used to store actual user data to avoid always hitting the db/API
    app.use(session({
      cookieName: 'userSession',
      secret: process.env.AUTH_SESSION_SECRET,
      duration: 2 * 60 * 60 * 1000, // lives for 2 hours
      activeDuration: 15 * 60 * 1000, // Gets refreshed for 15 mins on use
      httpOnly: true,
      // secure: true,
      ephemeral: true
    }));
    // Used to store the users intended destination
    app.use(session({
      cookieName: 'redirectTo',
      secret: process.env.AUTH_SESSION_SECRET,
      duration: 2 * 60 * 1000, // lives for 2 minutes
      httpOnly: true,
      // secure: true,
      ephemeral: true
    }));

    app.use(Auth.setUserFromSession);
    app.get('/auth/callback', Auth.handleCallback);
    app.get('/auth/error', (req, res) => {
      res.render('auth/error.html', {
        errorCode: req.query.code,
      });
    });
  }

  // Ensures that there is user data available, otherwise redirects to authenticate the user
  public static requireAuth(req, res, next): void {
    if (!req.user) {
      Auth.redirectToAuthorize(req, res);
    } else {
      next();
    }
  }

  public static logout(req, res, next): void {
    // Delete the user session
    if (req.userSession) {
      req.userSession.reset();
    }
    next();
  }

  // If there is user data available in the session, make sure it is put in the request and local res objects
  private static setUserFromSession(req, res, next): void {
    if (req.userSession && req.userSession.id) {
      Hacker.findById(req.userSession.id)
        .then(user => {
          if (user != null) {
            req.user = user;
            res.locals.user = user;
          }

          next();
        });
      return;
    }

    next();
  }

  private static handleCallback(req, res, next): void {
    // This is hit directly after the MyMLH authentication has happened
    // Should have authorization code in query
    if (req.query.code === undefined) {
      Auth.redirectToAuthorize(req, res);
    }

    Auth.getToken(req.query.code, req).then( access_token => {
      return Auth.getMlhUser(access_token);
    }).then( mlhUser => {
      Hacker
        .upsertAndFetchFromMlhUser(mlhUser)
        .then(user => {
          req.userSession = { id: user.id };

          const redirectTo = req.redirectTo.url ? req.redirectTo.url : dashboard_url;

          // For debugging
          if (!req.redirectTo) {
            console.log('No redirect URL stored');
          }

          // Delete the redirect data as it's no longer needed
          req.redirectTo.reset();

          // Redirect with auth
          res.redirect(redirectTo);
        }).catch(err => {
          if (err instanceof Hacker.TooYoungError) {
            res.redirect('/auth/error?code=TOO_YOUNG');
            return;
          }

          console.log('Error logging a user in');
          next(err);
        });
    }, err => {
      console.log('Caught bad code', err);
      Auth.redirectToAuthorize(req, res);
    });
  }

  private static redirectToAuthorize(req, res): void {
    // Store where the user was trying to get to so we can get back there
    req.redirectTo = { url: req.originalUrl };
    console.log(`Tried to store in cookie: ${req.originalUrl}`);

    // Construct the query string
    const qs = querystring.stringify({
      client_id,
      redirect_uri: url.resolve(req.requestedUrl, auth_callback),
      response_type: 'code',
      scope: [
        // All the user details we need
        'email',
        'phone_number',
        'demographics',
        'birthday',
        'education',
        'event'
      ].join(' ')
    });

    // Redirect to the authorization page on MyMLH
    res.redirect(`${authorize_url}?${qs}`);
  }

  // Take a code and return a promise of an access token
  private static getToken(code, req): Promise<string> {
    // Now we have an authorization code, we can exchange for an access token

    // For debugging purposes
    console.log(code);

    const body = {
      client_id,
      client_secret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: url.resolve(req.requestedUrl, auth_callback),
    };

    return fetch(token_url, {

      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(body)

    }).then( response => {

      return response.json();

    }).then( json => {

      return json.access_token;

    });
  }

  // Take an access_token and return a promise of user info from the MyMLH api
  private static getMlhUser(access_token: string) {
    const query = {
      access_token
    };
    const query_string = querystring.stringify(query);
    const full_url = user_url + '?' + query_string;

    return fetch(full_url, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'GET',
    }).then( response => {
      return response.json();
    }).then( json => {
      if (json.hasOwnProperty('data')) {
        return json.data;
      } else {
        console.log('Bad data');
        console.log(json);
        throw new Error('Couldn\'t get user data');
      }
    });
  }
}

export = Auth;
