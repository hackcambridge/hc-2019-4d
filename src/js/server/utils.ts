import express = require('express');
import _ = require('lodash');
import yaml = require('js-yaml');
import fs = require('fs');
import moment = require('moment-timezone');
import crypto = require('crypto');
let markdown = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true
}).use(require('markdown-it-attrs'));
import nunjucks = require('nunjucks');
import path = require('path');

const PROJECT_ROOT = path.resolve(path.join(__dirname, '../../../../../'));

export default class Utils {
  public constructor() {
    try {
      this.assetsFile = require(Utils.resolvePath('./assets/dist/rev-manifest.json'));
    } catch (e) {
      this.assetsFile = { };
    }
  }

  private static timeProperties(items, properties) {
    items.forEach((item) => properties.forEach((prop) => item[prop] = moment.tz(item[prop], 'Europe/London')));
  }


  private static markdownProperties(items, properties) {
    items.forEach((item) => properties.forEach((prop) => { if (item[prop]) { item[prop] = nunjucks.runtime.markSafe(markdown.render(item[prop])); }} ));
  }

  public static resolvePath(fromProjectRoot) {
    return path.join(PROJECT_ROOT, fromProjectRoot);
  }

  public asset(asset, prefix) {
    if (prefix == null) {
      prefix = '/assets/';
    }

    if (_.has(this.assetsFile, asset)) {
      asset = this.assetsFile[asset];
    }

    return prefix + asset;
  }

  public loadAsset(assetName) {
    if ((!this.loadedAssets[assetName]) || (Utils.app.settings.env == 'development')) {
      this.loadedAssets[assetName] = fs.readFileSync(exports.asset(assetName, 'assets/dist/'));
    }

    return this.loadedAssets[assetName];
  }

  private static markdownPropertiesRecursive(object, properties) {
    for (let property in object) {
      if (object.hasOwnProperty(property)) {
        if (typeof(object[property]) === 'object') {
          // recurse
          Utils.markdownPropertiesRecursive(object[property], properties);
        } else {
          if(properties.indexOf(property) >= 0) {
            // This is one of the properties we identified as being markdown, render it
            object[property] = nunjucks.runtime.markSafe(markdown.renderInline(object[property]));
          }
        }
      }
    }
  }

  public loadResource(resourceName) {
    if ((!this.loadedResources[resourceName]) || (Utils.app.settings.env == 'development')) {
      let loadedResource = yaml.safeLoad(
        fs.readFileSync(Utils.resolvePath(`src/resources/${resourceName}.yml`))
      )[resourceName];

      switch (resourceName) {
        case 'faqs':
          Utils.markdownProperties(loadedResource, ['answer']);
          break;
        case 'prizes':
          _.forOwn(loadedResource, (item) => Utils.markdownProperties(item, ['description', 'prize']));
          break;
        case 'workshops':
        case 'api_demos':
          Utils.markdownProperties(loadedResource, ['description']);
          Utils.timeProperties(loadedResource, ['time']);

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
          Utils.markdownProperties(loadedResource, ['description']);
          break;
        case 'schedule':
          Utils.timeProperties(loadedResource, ['time']);
          loadedResource = {
            saturday: loadedResource.filter((event) => event.time.date() == 28),
            sunday: loadedResource.filter((event) => event.time.date() == 29)
          };
          break;
        case 'dashboard':
          Utils.markdownPropertiesRecursive(loadedResource, ['content', 'title']);
      }

      this.loadedResources[resourceName] = loadedResource;
    }

    return this.loadedResources[resourceName];
  }

  public loadMarkdown(markdownName) {
    if ((!this.loadedMarkdowns[markdownName]) || (Utils.app.settings.env == 'development')) {
      let loadedMarkdown = nunjucks.runtime.markSafe(
        markdown.render(fs.readFileSync(Utils.resolvePath(
          `src/resources/${markdownName}.md`), 'utf8'
        ))
      );
      this.loadedMarkdowns[markdownName] = loadedMarkdown;
    }

    return this.loadedMarkdowns[markdownName];
  }

  

  public getPublicId() {
    return this.publicId;
  }

  public assetsFile;
  private publicId = crypto.randomBytes(12).toString('hex');

  public static app: express.Express;
  private loadedAssets = {};
  private loadedMarkdowns = {};
  private loadedResources = {};
}
