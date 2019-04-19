# Hack Cambridge Website

[![Build Status](https://travis-ci.com/hackcambridge/hack-cambridge-website.svg?branch=master)](https://travis-ci.com/hackcambridge/hack-cambridge-website)

## Getting started

To run the website on your machine, first make sure you have the following things installed:

- [Node.js](https://nodejs.org/dist/latest-v8.x/) v8 LTS.  If you need to keep multiple versions of Node installed, you might find [Node Version Manager](https://github.com/creationix/nvm) helpful.
- [Yarn](https://yarnpkg.com/en/docs/install/)

Then [clone this repository from GitHub](https://help.github.com/articles/cloning-a-repository/):

```bash
git clone https://github.com/hackcambridge/hack-cambridge-website.git
```

### Environment variables

Certain environment variables need to be available for features to work. These variables are stored in the `.env` file at the root of the repository.

To get started, create a `.env` file at the root of your project with the following contents:

```text
AUTH_SESSION_SECRET=auth_session_secret_placeholder
S3_BUCKET=s3_bucket_placeholder
APPLICATIONS_OPEN_STATUS=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
MAILCHIMP_API_KEY=
MAILCHIMP_INTERESTED_LIST_ID=
MAILGUN_API_KEY=
MYMLH_CLIENT_ID=
MYMLH_CLIENT_SECRET=
NODE_ENV=development
PUSHER_KEY=
SLACK_API_TOKEN=
STRIPE_PRIVATE_KEY=
STRIPE_PUBLISH_KEY=
```

Leaving most of these variables undefined is sufficient to get the basic website up-and-running, but not all features will work without valid tokens for all the environment variables. If you're working on the Hack Cambridge committee, you can ask for these tokens on the #development_and_web channel on Slack, but we're looking to improve this process.

You can run the website in different environments by changing the value of `NODE_ENV`. By default, the valid values are `development`, `test`, and `production`. For example, if you are allocating teams to hackers, you will probably want to run the teams `suggest` script on the `production` environment.

In order to use the `production` environment, add the following variables to your `.env` file:

```text
PGUSER=
PGPASSWORD=
PGDATABASE=
PGHOST=
PGPORT=
```

### Dependencies

We use Yarn to manage dependencies, and PostgreSQL for our database.

#### Installing PostgreSQL and packages

You have various options for installing PostgreSQL:

- By [downloading Docker](https://www.docker.com/products/docker-desktop) and using a Docker image (guarantees an identical environment)
- By [downloading Postgres.app](https://postgresapp.com/downloads.html) if you're running macOS (very easy, and [integrates with Postico](https://eggerapps.at/postico/))
- [Using the installers on the PostgreSQL website](https://www.postgresql.org/download/)
- Using your favourite package manager (e.g. Homebrew, APT, RPM…)

If you install PostgreSQL using a method other than Docker, be aware that we use PostgreSQL 9.6 in production (so you may encounter unexpected behaviour if you use a different version).
Usually the database can be configured to start automatically after login (this is the default for Postgres.app).
If you use Docker though, you need to start the database manually each time with:

```bash
docker-compose up
```

Once PostgreSQL is running, run:

```bash
yarn setup
```

This will create the database, run the migrations, and install the packages specified in `package.json`.

#### Installing packages only

If you don't need PostgreSQL, just run:

```bash
yarn install
```

### Starting the web server

To start the web server, run:

```bash
yarn watch
```

You will be able to access the site at [http://localhost:3000](http://localhost:3000).

## OAuth2 API

We run an API which authenticates admin users via tokens. Currently the only way to create tokens is
through scripts. To create a user:

```bash
yarn hc-script -- create-admin --email email@domain.com --name UserName
```

To then create a token for that user:

```bash
yarn hc-script -- create-token email@domain.com
```

Once you have your token, you can use it to authenticate requests to the API in your HTTP headers:

```text
Authorization: Bearer <<TOKEN GOES HERE >>
```

## Responses

To send responses to applicants, you can use the `respond` script:

```bash
yarn hc-script respond invite applications.json
```

You can either `invite` or `reject`.

`applications.json` refers to an applications file, which can be generated with `suggest-responses`.

```bash
yarn hc-script -- suggest-responses invite 50 applications.json
```

The use of this script requires a score augmentation function for any custom scoring logic. It is placed in `src/hc-scripts/augment-score.ts`.
It takes in a computed application object and returns an augmented score. The identity function (leaving the score unchanged) looks like this:

```typescript
module.exports = ({ rating }) => rating;
```

It also makes use of a selection script stored in `src/hc-scripts/choose-applicants.ts`
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
yarn hc-script -- teams suggest teams.json
```

Then you can send them

```bash
yarn hc-script -- teams send teams.json
```

## Build System

This uses [Gulp](http://gulpjs.org). Run to build styles and scripts.

```bash
yarn build # Build the assets
yarn watch # Start the server, automatically build assets and reload the browser when changes are made
yarn build --prod # Build production assets (or set NODE_ENV to production)
```

## Database generators

We use [Sequelize](http://docs.sequelizejs.com) to manage migrations. To create your own:

```bash
yarn migration:generate --name YOURMIGRATION
```

Or to create both a model and migration:

```bash
yarn model:generate --name YOURMODEL
```

And for a seed:

```bash
yarn seed:generate --name YOURSEED
```

## Database tasks

If you run in an environment other than `development` you'll need to set up a database for it and run the migrations. To do this run:

```bash
yarn db:setup
```

To run the migrations for the current database run:

```bash
yarn db:migrate
```

And to get a fresh, empty database, run:

```bash
yarn db:reset
```

To add new environments other than `development`, `test`, and `production`, copy `db/config.dist.js` to `db/config.js` and add the database configuration for the new environments to `db/config.js`.

## Rolling your own

Want to run this in production? Hack Cambridge runs on [Heroku](https://heroku.com) so we recommend that. This application
handles a lot of sensitive user data so you'll want to make sure **https is implemented and enforced**.
