# Hack Cambridge Website

[
  ![Master branch unit testing result](https://travis-ci.org/hackcambridge/hack-cambridge-website.svg?branch=master)
](https://travis-ci.org/hackcambridge/hack-cambridge-website)

## Getting started

To run the website on your machine, first make sure you have the following things installed:

- [Node.js](https://nodejs.org) v8 LTS.  If you need to keep multiple versions of Node installed, you might find [Node Version Manager](https://github.com/creationix/nvm) helpful.
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com)

Then [clone this repository from GitHub](https://help.github.com/articles/cloning-a-repository/):

```bash
git clone https://github.com/hackcambridge/hack-cambridge-website.git
```

### Environment variables

Certain environment variables need to be available for features to work. These variables are stored in the `.env` file at the root of the repository.

To get started, create a `.env` file at the root of your project with the following contents:

```text
AUTH_SESSION_SECRET=auth_session_secret_placeholder
PGDATABASE=postgres
PGHOST=127.0.0.1
PGPASSWORD=
PGPORT=5432
PGUSER=postgres
S3_BUCKET=s3_bucket_placeholder
APPLICATIONS_OPEN_STATUS=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
GOOGLE_SHEETS_AUTH_EMAIL=
GOOGLE_SHEETS_AUTH_KEY=
GOOGLE_SHEETS_WIFI_SHEET_ID=
MAILCHIMP_API_KEY=
MAILCHIMP_INTERESTED_LIST_ID=
MAILGUN_API_KEY=
MYMLH_CLIENT_ID=
MYMLH_CLIENT_SECRET=
PUSHER_KEY=
SLACK_API_TOKEN=
STRIPE_PRIVATE_KEY=
STRIPE_PUBLISH_KEY=
```

Leaving most of these variables undefined is sufficient to get the basic website up-and-running, but not all features will work without valid tokens for all the environment variables.  If you're working on the Hack Cambridge committee, you can ask for these tokens on the #development_and_web channel on Slack, but we're looking to improve this process.

### Dependencies

We use [Yarn](https://yarnpkg.com/lang/en/) to manage dependencies.  To install the dependencies of the Hack Cambridge website, run:

```bash
yarn install
```

### Starting the database

To use our database in development, you'll first need to start it by running:

```bash
docker-compose up
```

Before starting the app for the first time, you'll need to setup the tables:

```bash
yarn run migrate
```

### Starting the web server

To start the web server, run:

```bash
yarn global add gulp
gulp serve
```

And you will be able to access the site at [http://localhost:3000](http://localhost:3000).

## OAuth2 API

We run an API which authenticates admin users via tokens. Currently the only way to create tokens is
through scripts. To create a user:

```bash
yarn run hc-script -- create-admin --email email@domain.com --name UserName
```

To then create a token for that user:

```bash
yarn run hc-script -- create-token email@domain.com
```

Once you have your token, you can use it to authenticate requests to the API in your HTTP headers:

```text
Authorization: Bearer <<TOKEN GOES HERE >>
```

## Responses

To send responses to applicants, you can use the `respond` script:

```bash
yarn run hc-script respond invite applications.json
```

You can either `invite` or `reject`.

`applications.json` refers to an applications file, which can be generated with `suggest-responses`.

```bash
yarn run hc-script -- suggest-responses invite 50 applications.json
```

The use of this script requires a score augmentor function for any custom scoring logic. It is placed in `src/js/hc-scripts/augment-score.js`.
It takes in a computed application object and returns an augmented score. The identity function (leaving the score unchanged) looks like this:

```typescript
module.exports = ({ rating }) => rating;
```

It also makes use of a selection script stored in `src/js/hc-scripts/choose-applicants.js`
This takes a sorted list of applications, a result count limit and an inviteType
and returns a list of the suggested applications to invite/reject.
E.g. to just takes the top n in the sorted list:

```typescript
module.exports = ( (sortedApplications, n, inviteType) => {
  return sortedApplications.slice(0, n));
});
```

## Closing applications

You can control whether or not applications are open using the APPLICATION_OPEN_STATUS environment variable. This takes a value of either
`open` or `closed`.

## Team Allocations

To send team allocations for ticketed hackers that have requested them, you must first suggest some:

```bash
yarn run hc-script -- teams suggest teams.json
```

Then you can send them

```bash
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

## Database migrations

We are using the sequelize CLI to manage migrations. So to create your own:

```bash
yarn run sequelize -- migration:create --name YOURMIGRATION
```

## Rolling your own

Want to run this in production? Hack Cambridge runs on [Heroku](https://heroku.com) so we recommend that. This application
handles a lot of sensitive user data so you'll want to make sure **https is implemented and enforced**.
