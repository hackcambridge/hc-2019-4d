let _ = require('lodash');
let yaml = require('js-yaml');
let fs = require('fs');
let moment = require('moment-timezone');
let crypto = require('crypto');
let markdown = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true
}).use(require('markdown-it-attrs'));
let nunjucks = require('nunjucks');
const path = require('path');

let loadedResources = {};
let loadedMarkdowns = {};
let app;

const PROJECT_ROOT = path.resolve(path.join(__dirname, '../../../../../'));

function timeProperties(items, properties) {
  items.forEach((item) => properties.forEach((prop) => item[prop] = moment.tz(item[prop], 'Europe/London')));
}


function markdownProperties(items, properties) {
  items.forEach((item) => properties.forEach((prop) => { if (item[prop]) { item[prop] = nunjucks.runtime.markSafe(markdown.render(item[prop])); }} ));
}

exports.init = function init(a) {
  app = a;
};

exports.resolvePath = function resolvePath(fromProjectRoot) {
  return path.join(PROJECT_ROOT, fromProjectRoot);
};

let assetsFile;

try {
  assetsFile = require(exports.resolvePath('./assets/dist/rev-manifest.json'));
} catch (e) {
  assetsFile = { };
}

exports.asset = function (asset, prefix) {
  if (prefix == null) {
    prefix = '/assets/';
  }

  if (_.has(assetsFile, asset)) {
    asset = assetsFile[asset];
  }

  return prefix + asset;
};

let loadedAssets = { };

exports.loadAsset = function loadAsset(assetName) {
  if ((!loadedAssets[assetName]) || (app.settings.env == 'development')) {
    loadedAssets[assetName] = fs.readFileSync(exports.asset(assetName, 'assets/dist/'));
  }

  return loadedAssets[assetName];
};

function markdownPropertiesRecursive(object, properties) {
  for (let property in object) {
    if (object.hasOwnProperty(property)) {
      if (typeof(object[property]) === 'object') {
        // recurse
        markdownPropertiesRecursive(object[property], properties);
      } else {
        if(properties.indexOf(property) >= 0) {
          // This is one of the properties we identified as being markdown, render it
          object[property] = nunjucks.runtime.markSafe(markdown.renderInline(object[property]));
        }
      }
    }
  }
}

exports.loadResource = function loadResource(resourceName) {
  if ((!loadedResources[resourceName]) || (app.settings.env == 'development')) {
    let loadedResource = yaml.safeLoad(
      fs.readFileSync(exports.resolvePath(`src/resources/${resourceName}.yml`))
    )[resourceName];

    switch (resourceName) {
      case 'faqs':
        markdownProperties(loadedResource, ['answer']);
        break;
      case 'prizes':
        _.forOwn(loadedResource, (item) => markdownProperties(item, ['description', 'prize']));
        break;
      case 'workshops':
      case 'api_demos':
        markdownProperties(loadedResource, ['description']);
        timeProperties(loadedResource, ['time']);

        loadedResource = loadedResource.sort((r1, r2) => {
          let time1 = r1.time;
          let time2 = r2.time;

          if (time1.isValid()) {
            if (!time2.isValid()) {
              return -1;
            } else {
              return Math.sign(time1.diff(time2));
            }
          } else {
            return (time2.isValid()) ? 1 : 0;
          }
        });
        break;
      case 'apis':
        markdownProperties(loadedResource, ['description']);
        break;
      case 'schedule':
        timeProperties(loadedResource, ['time']);
        loadedResource = {
          saturday: loadedResource.filter((event) => event.time.date() == 28),
          sunday: loadedResource.filter((event) => event.time.date() == 29)
        };
        break;
      case 'dashboard':
        markdownPropertiesRecursive(loadedResource, ['content', 'title']);
    }

    loadedResources[resourceName] = loadedResource;
  }

  return loadedResources[resourceName];
};


exports.loadMarkdown = function loadMarkdown(markdownName) {
  if ((!loadedMarkdowns[markdownName]) || (app.settings.env == 'development')) {
    let loadedMarkdown = nunjucks.runtime.markSafe(
      markdown.render(fs.readFileSync(exports.resolvePath(
        `src/resources/${markdownName}.md`), 'utf8'
      ))
    );
    loadedMarkdowns[markdownName] = loadedMarkdown;
  }

  return loadedMarkdowns[markdownName];
};

let publicId = crypto.randomBytes(12).toString('hex');

exports.getPublicId = function () {
  return publicId;
};
