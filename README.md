# Hack Cambridge Website

## Getting Started

To run the website on your machine, make sure you have [Node.js](https://nodejs.org) installed. Then inside this folder, run

```bash
npm install
npm start
```

And your server will be ready to go.

To enable the MailChimp integration, environment variables `MAILCHIMP_API_KEY` and `MAILCHIMP_LIST_ID` must be present. For convenience, these can be placed in a `.env` file at the root of the project.

## Build System

This uses [Gulp](http://gulpjs.org). Install it globally, and then run to build styles and scripts.

```bash
npm install -g gulp
gulp build # Build the assets
gulp watch # Watch for changes in assets and build automatically
gulp build --prod # Build production assets (or set NODE_ENV to production)
```

## Deploying

Set up Heroku in your local copy, then simply:

```bash
git push heroku master
```
