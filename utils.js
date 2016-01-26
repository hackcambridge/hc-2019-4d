var _ = require('lodash');
var yaml = require('js-yaml');
var fs = require('fs');
var moment = require('moment-timezone');
var markdown = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true
});
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
}
