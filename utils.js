var _ = require('lodash');
var yaml = require('js-yaml');
var marked = require('marked');
var fs = require('fs');
var moment = require('moment-timezone');
var nunjucks = require('nunjucks');

var loadedResources = [];
var app;

function timeProperties(items, properties) {
  items.forEach((item) => properties.forEach((prop) => item[prop] = moment.tz(item[prop].time, 'Europe/London')));
}


function markdownProperties(items, properties) {
  items.forEach((item) => properties.forEach((prop) => item[prop] = nunjucks.runtime.markSafe(marked(item[prop]))));
}

exports.init = function init(a) {
  app = a;
};

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
    }

    loadedResources[resourceName] = loadedResource;
  }

  return loadedResources[resourceName];
}
