# Hack Cambridge Website

[
  ![Master branch unit testing result](https://travis-ci.org/hackcambridge/hack-cambridge-website.svg?branch=master)
](https://travis-ci.org/hackcambridge/hack-cambridge-website)

## Getting Started

To run the website on your machine, make sure you have [Node.js](https://nodejs.org) and [Yarn](https://yarnpkg.com/) installed. Then inside this folder, run

```bash
yarn global add gulp
yarn install
gulp serve
```

And your server will be ready to go.

## Environment Variables

Certain environment variables need to be available for features to work. For convenience
you can do this in the `.env` file at the root of your project.

```
MAILCHIMP_API_KEY=
MAILCHIMP_LIST_ID=
APPLICATION_URL=
TEAM_APPLICATION_URL=
STRIPE_PUBLISH_KEY=
STRIPE_PRIVATE_KEY=
GOOGLE_SHEETS_AUTH_EMAIL=
GOOGLE_SHEETS_AUTH_KEY=
GOOGLE_SHEETS_WIFI_SHEET_ID=
MYMLH_CLIENT_ID=
MYMLH_CLIENT_SECRET=
AUTH_SESSION_SECRET="auth_session_secret_placeholder"
MAILGUN_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
S3_BUCKET="s3_bucket_placeholder"
PGHOST=
PGUSER=
PGDATABASE=
PGPASSWORD=
PGPORT=
SLACK_API_TOKEN=
APPLICATIONS_OPEN_STATUS=
PUSHER_KEY=
```

In order to get the basic website up-and-running none of these variables need to
be set, but the .env file does need to be present. Not all features will work
without valid tokens for all the environment variables.

## Database

To use our database in development, you'll first need to start it. Make sure you have [Docker](https://www.docker.com/) installed. Then run

```
docker-compose up
```

And now you can connect to it on port 5432

```
psql --host=localhost --username=postgres
```

### Migrations

Before starting the app for the first time, you'll need to put the tables in the places:

```
yarn run migrate
```

We are using the sequelize CLI to manage migrations. So to create your own:

```
yarn run sequelize -- migration:create --name YOURMIGRATION
```

## OAuth2 API

We run an API which authenticates admin users via tokens. Currently the only way to create tokens is
through scripts. To create a user:

```
yarn run hc-script -- create-admin --email email@domain.com --name UserName
```

To then create a token for that user:

```
yarn run hc-script -- create-token email@domain.com
```

Once you have your token, you can use it to authenticate requests to the API in your HTTP headers:

```
Authorization: Bearer <<TOKEN GOES HERE >>
```

## Responses

To send responses to applicants, you can use the `respond` script:

```
yarn run hc-script respond invite applications.json
```

You can either `invite` or `reject`.

`applications.json` refers to an applications file, which can be generated with `suggest-responses`.

```
yarn run hc-script -- suggest-responses invite 50 applications.json
```

The use of this script requires a score augmentor function for any custom scoring logic. It is placed in `src/js/hc-scripts/augment-score.js`.
It takes in a computed application object and returns an augmented score. The identity function (leaving the score unchanged) looks like this:

```
module.exports = ({ rating }) => rating;
```

It also makes use of a selection script stored in `src/js/hc-scripts/choose-applicants.js`
This takes a sorted list of applications, a result count limit and an inviteType
and returns a list of the suggested applications to invite/reject.
E.g. to just takes the top n in the sorted list:

```
module.exports = ( (sortedApplications, n, inviteType) => {
  return sortedApplications.slice(0, n));
});
```

## Closing applications

You can control whether or not applications are open using the APPLICATION_OPEN_STATUS environment variable. This takes a value of either
`open` or `closed`.

## Team Allocations

To send team allocations for ticketed hackers that have requested them, you must first suggest some:

```
yarn run hc-script -- teams suggest teams.json
```

Then you can send them

```
yarn run hc-script -- teams send teams.json
```

## Build System

This uses [Gulp](http://gulpjs.org). Install it globally, and then run to build styles and scripts.

```bash
yarn global add gulp
gulp build # Build the assets
gulp serve # Start the server, automatically build assets and reload the browser when changes are made
gulp watch # Watch for changes in assets and build automatically
gulp build --prod # Build production assets (or set NODE_ENV to production)
```

## Rolling your own

Want to run this in production? Hack Cambridge runs on [Heroku](https://heroku.com) so we recommend that. This application
handles a lot of sensitive user data so you'll want to make sure **https is implemented and enforced**.
