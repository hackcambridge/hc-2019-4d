var _ = require('lodash');
var yaml = require('js-yaml');
var fs = require('fs');
var moment = require('moment-timezone');
var crypto = require('crypto');
var markdown = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true
}).use(require('markdown-it-attrs'));
var nunjucks = require('nunjucks');

var loadedResources = {};
var loadedMarkdowns = {};
var app;

function timeProperties(items, properties) {
  items.forEach((item) => properties.forEach((prop) => item[prop] = moment.tz(item[prop], 'Europe/London')));
}


function markdownProperties(items, properties) {
  items.forEach((item) => properties.forEach((prop) => item[prop] = nunjucks.runtime.markSafe(markdown.render(item[prop]))));
}

exports.init = function init(a) {
  app = a;
};

var assetsFile;

try {
  assetsFile = require('./assets/dist/rev-manifest.json');
} catch (e) {
  assetsFile = { };
}

exports.asset = function (asset, prefix) {
  if (prefix == null) {
    prefix = '/assets/'
  }

  if (_.has(assetsFile, asset)) {
    asset = assetsFile[asset];
  }

  return prefix + asset;
};

var loadedAssets = { };

exports.loadAsset = function loadAsset(assetName) {
  if ((!loadedAssets[assetName]) || (app.settings.env == 'development')) {
    loadedAssets[assetName] = fs.readFileSync(exports.asset(assetName, 'assets/dist/'));
  }

  return loadedAssets[assetName];
}

exports.loadResource = function loadResource(resourceName) {
  if ((!loadedResources[resourceName]) || (app.settings.env == 'development')) {
    var loadedResource = yaml.safeLoad(fs.readFileSync('./resources/' + resourceName + '.yml'))[resourceName];

    switch (resourceName) {
      case 'faqs':
        markdownProperties(loadedResource, ['answer']);
        break;
      case 'prizes':
        _.forOwn(loadedResource, (item) => markdownProperties(item, ['description', 'prize']));
        break;
      case 'workshops':
        markdownProperties(loadedResource, ['description']);
        timeProperties(loadedResource, ['time'])
        break;
      case 'schedule':
        timeProperties(loadedResource, ['time']);
        loadedResource = {
          saturday: loadedResource.filter((event) => event.time.date() == 30),
          sunday: loadedResource.filter((event) => event.time.date() == 31)
        };
    }

    loadedResources[resourceName] = loadedResource;
  }

  return loadedResources[resourceName];
}


exports.loadMarkdown = function loadMarkdown(markdownName) {
  if ((!loadedMarkdowns[markdownName]) || (app.settings.env == 'development')) {
    var loadedMarkdown = nunjucks.runtime.markSafe(markdown.render(fs.readFileSync('./resources/' + markdownName + '.md', 'utf8')));
    loadedMarkdowns[markdownName] = loadedMarkdown;
  }

  return loadedMarkdowns[markdownName];
};

var publicId = crypto.randomBytes(12).toString('hex');

exports.getPublicId = function () {
  return publicId;
};
