var _ = require('lodash');
var yaml = require('js-yaml');
var marked = require('marked');
var fs = require('fs');

var loadedResources = [];

function markdownProperties(items, properties) {
  items.forEach((item) => properties.forEach((prop) => item[prop] = marked(item[prop])));
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
        break;
    }

    loadedResources[resourceName] = loadedResource;
  }

  return loadedResources[resourceName];
}
