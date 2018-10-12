import * as crypto from 'crypto';
import { Express } from 'express';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as _ from 'lodash';
import * as markdown_module from 'markdown-it';
import * as moment from 'moment-timezone';
import * as nunjucks from 'nunjucks';
import * as path from 'path';

import * as dates from 'js/shared/dates';

const markdown = markdown_module({
  html: true,
  linkify: true,
  typographer: true
}).use(require('markdown-it-attrs'));

const loadedResources = {};
let app: Express;

const PROJECT_ROOT = path.resolve(path.join(__dirname, '../../../'));

function timeProperties(items, properties) {
  items.forEach((item) => properties.forEach((prop) => item[prop] = moment.tz(item[prop], 'Europe/London')));
}

export function init(a) {
  app = a;
}

export function resolvePath(fromProjectRoot) {
  return path.join(PROJECT_ROOT, fromProjectRoot);
}

let assetsFile;

try {
  assetsFile = require(exports.resolvePath('./assets/dist/rev-manifest.json'));
} catch (e) {
  assetsFile = { };
}

export function asset(asset, prefix) {
  if (prefix == null) {
    prefix = '/assets/';
  }

  if (_.has(assetsFile, asset)) {
    asset = assetsFile[asset];
  }

  return prefix + asset;
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
          object[property] = nunjucks.renderString(markdown.renderInline(object[property]), {});
        }
      }
    }
  }
}

function loadScheduleTimeProperties(loadedScheduleResource) {
  loadedScheduleResource.forEach(day => {
    timeProperties(day.entries, ['time']);
    day.entries.forEach(entry => {
      entry.events.forEach(event => {
        if (event.subevents) {
          timeProperties(event.subevents, ['time']);
        }
      });
    });
  });
}

function renderNunjucksInFaqs(faqsResource, context) {
  faqsResource.forEach(faq => {
    faq.answer = nunjucks.renderString(faq.answer, context);
    faq.question = nunjucks.renderString(faq.question, context);
  });
}

function renderNunjucksInDashboard(dashboardResource, context) {
  const message = dashboardResource['status-messages']['has-ticket'];
  message.subline = nunjucks.renderString(message.subline, context);
}

export function loadResource(resourceName) {
  if ((!loadedResources[resourceName]) || app === undefined || app.settings.env === 'development') {
    let loadedResource = yaml.safeLoad(
      fs.readFileSync(resolvePath(`src/resources/${resourceName}.yml`)).toString()
    )[resourceName];

    switch (resourceName) {
      case 'workshops':
      case 'api_demos':
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
      case 'schedule':
        loadScheduleTimeProperties(loadedResource);
        break;
      case 'dashboard':
        markdownPropertiesRecursive(loadedResource, ['content', 'title']);
        renderNunjucksInDashboard(loadedResource, {
          dates
        });
        break;
      case 'faqs':
        renderNunjucksInFaqs(loadedResource, {
          dates,
          event: loadResource('event'),
          moment
        });
        break;
    }

    loadedResources[resourceName] = loadedResource;
  }

  return loadedResources[resourceName];
};

let publicId = crypto.randomBytes(12).toString('hex');

export function getPublicId() {
  return publicId;
}

export class ErrorWithStatus extends Error {
  constructor(name: string, public status: number) {
    super(name);
  }
}
