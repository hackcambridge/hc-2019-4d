import * as autoprefixer from 'autoprefixer';
import * as browserSync from 'browser-sync';
import * as pack from 'webpack-stream';

import { dest, parallel, series, src, watch } from 'gulp';

import * as gulpClean from 'gulp-clean';
import * as gulpConcatCss from 'gulp-concat-css';
import * as gulpNodemon from 'gulp-nodemon';
import * as gulpPostcss from 'gulp-postcss';
import * as gulpRevAll from 'gulp-rev-all';
import * as gulpSourcemaps from 'gulp-sourcemaps';
import gulpTslint from 'gulp-tslint';
import { createProject } from 'gulp-typescript';
import * as gulpYamlValidate from 'gulp-yaml-validate';

import { browserSyncConfig } from 'config/browsersync';
import { nodemonConfig } from 'config/nodemon';
import { webpackConfig } from 'config/webpack';

const paths = {
  in: {
    assets: {
      resources: 'assets/resources/*.yml',
      styles: 'assets/styles/**.css',
      other: ['assets/**', '!assets/dist/**', '!assets/styles/**'],
      stylesheetManifest: 'assets/styles/all-stylesheets.css',
    },
    serverSide: {
      ts: ['src/**/*.ts', '!src/client/**'],
      nonTS: ['src/**', '!src/**/*.ts', '!src/client/**'],
      views: 'views/**',
    },
    clientSide: {
      entry: 'src/client/main.ts'
    },
  },
  out: {
    serverSide: 'dist',
    assets: 'assets/dist',
  }
};
const revisionedExtensions = ['.css', '.html', '.icns', '.ico', '.jpg', '.js', '.png', '.svg'];
const tsProject = createProject('tsconfig.json', { rootDir: 'src' });
const browserSyncInstance = browserSync.create();

export function clean() {
  return src([paths.out.serverSide, paths.out.assets])
    .pipe(gulpClean());
}

// Server-side

function compileServerSideTS() {
  return src(paths.in.serverSide.ts)
    .pipe(gulpTslint({ formatter: 'verbose' }))
    .pipe(gulpTslint.report())
    .pipe(tsProject()).js
    .pipe(dest('dist'));
}

function copyOtherServerSideSource() {
  return src(paths.in.serverSide.nonTS)
    .pipe(dest('dist'))
    .pipe(browserSyncInstance.stream({ once: true }));
}

const buildServerSide = parallel(compileServerSideTS, copyOtherServerSideSource);

// Client-side is not synchronous as Webpack will watch for changes

function packClientSide(cb) {
  src(paths.in.clientSide.entry)
    .pipe(pack(webpackConfig))
    .pipe(dest('assets/dist/scripts'))
    .pipe(browserSyncInstance.stream({ once: true }));
  cb();
}

const buildSource = parallel(buildServerSide, packClientSide);

// Other assets

function copyAssets() {
  return src(paths.in.assets.other)
    .pipe(gulpRevAll.revision({ includeFilesInManifest: revisionedExtensions }))
    .pipe(dest('assets/dist'))
    .pipe(gulpRevAll.manifestFile())
    .pipe(dest('assets/dist'))
    .pipe(browserSyncInstance.stream({ once: true }));
}

// CSS

function preprocessCSS() {
  return src(paths.in.assets.stylesheetManifest)
    .pipe(gulpSourcemaps.init())
    .pipe(gulpConcatCss('all-stylesheets.css'))
    .pipe(gulpPostcss([ autoprefixer() ]))
    .pipe(gulpSourcemaps.write())
    .pipe(dest('assets/dist/styles'))
    .pipe(browserSyncInstance.stream({ once: true }));
}

// YAML

function validateYAML() {
  return src(paths.in.assets.resources)
    .pipe(gulpYamlValidate({ html: false }))
    .pipe(browserSyncInstance.stream({ once: true }));
}

export const build = series(clean, parallel(copyAssets, buildSource, preprocessCSS, validateYAML));

function runNodemon(cb) {
  nodemonConfig.done = cb;
  gulpNodemon(nodemonConfig)
    .on('start', () => browserSyncInstance.init(browserSyncConfig))
    .on('restart', () => browserSyncInstance.reload());
}

watch(paths.in.assets.styles).on('change', preprocessCSS);
watch(paths.in.assets.resources).on('change', validateYAML);
watch(paths.in.assets.other).on('change', copyAssets);
watch(paths.in.serverSide.views).on('change', browserSyncInstance.reload);
// watch(paths.in.serverSide.ts).on('change', compileServerSideTS);

export default series(clean, parallel(series(parallel(copyAssets, buildServerSide, preprocessCSS, validateYAML),
                                                      runNodemon),
                                             packClientSide));
