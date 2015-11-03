'use strict';

var express = require('express');
var nunjucks = require('nunjucks');
var _ = require('lodash');
var app = express();

// Static file serving
var staticOptions = { };
if (app.settings.env != 'development') {
  staticOptions.maxAge = 60 * 60 * 365;
}

app.use('/assets', express.static('assets/dist', staticOptions));

// View rendering
var nunjucksEnv = nunjucks.configure('views', {
  autoescape: true,
  noCache: app.settings.env == 'development',
  express: app
});

var assetsFile;
try {
  assetsFile = require('./assets/dist/rev-manifest.json');
} catch (e) {
  assetsFile = { };
}


nunjucksEnv.addGlobal('asset', function (asset) {
  if (_.has(assetsFile, asset)) {
    asset = assetsFile[asset];
  }

  return '/assets/' + asset;
});

// Routes
app.get('/', function (req, res) {
  res.render('index.html');
});

// Start server
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Listening on port ' + listener.address().port);
});
