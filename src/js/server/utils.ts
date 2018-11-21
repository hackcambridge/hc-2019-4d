import * as crypto from 'crypto';
import { render as renderEjs } from 'ejs';
import { Express } from 'express';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as _ from 'lodash';
import * as moment from 'moment-timezone';
import * as path from 'path';

import * as dates from 'js/shared/dates';
import * as theme from 'js/shared/theme';

const loadedResources = {};
let app: Express;

const PROJECT_ROOT = path.resolve(path.join(__dirname, '../../../'));

function timeProperties(items, properties) {
  items.forEach(item => properties.forEach(prop => item[prop] = moment.tz(item[prop], 'Europe/London')));
}

export function init(a) {
  app = a;
}

export function resolvePath(fromProjectRoot) {
  return path.join(PROJECT_ROOT, fromProjectRoot);
}

let assetsFile;

try {
  assetsFile = require(resolvePath('./assets/dist/rev-manifest.json'));
} catch (e) {
  assetsFile = { };
}

export function asset(assetPath, prefix) {
  if (prefix == null) {
    prefix = '/assets/';
  }

  if (_.has(assetsFile, assetPath)) {
    assetPath = assetsFile[assetPath];
  }

  return prefix + assetPath;
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

export function loadResource(resourceName) {
  if ((!loadedResources[resourceName]) || app === undefined || app.settings.env === 'development') {
    let loadedResource = yaml.safeLoad(
      renderEjs(
        fs.readFileSync(resolvePath(`src/resources/${resourceName}.yml`)).toString(),
        { dates, theme }
      )
    )[resourceName];

    switch (resourceName) {
      case 'workshops':
      case 'api_demos':
        timeProperties(loadedResource, ['time']);

        loadedResource = loadedResource.sort((r1, r2) => {
          const time1 = r1.time;
          const time2 = r2.time;

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
      case 'faqs':
    }

    loadedResources[resourceName] = loadedResource;
  }

  return loadedResources[resourceName];
}

const publicId = crypto.randomBytes(12).toString('hex');

export function getPublicId() {
  return publicId;
}

export class ErrorWithStatus extends Error {
  constructor(name: string, public status: number) {
    super(name);
  }
}
