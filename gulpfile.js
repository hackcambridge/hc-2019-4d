'use strict';

const gulp = require('gulp');
const argv = require('yargs').argv;
const path = require('path');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const del = require('del');
const browserify = require('browserify');
const sequence = require('run-sequence');
const bs = require('browser-sync').create();
const nodemon = require('nodemon');

const autoprefixer = require('autoprefixer');
const concatCss = require('gulp-concat-css');
const gulpIf = require('gulp-if');
const postcss = require('gulp-postcss');
const revAll = require('gulp-rev-all');
const sourcemaps = require('gulp-sourcemaps');
const terser = require('gulp-terser');
const ts = require('gulp-typescript');
const util = require('gulp-util');
const validateYaml = require('gulp-yaml-validate');

let prod = !!argv.prod || process.env.NODE_ENV == 'production';

let assetPath = ['assets/**', '!assets/dist/**', '!assets/styles/**'];

function onError(err) {
  util.beep();
  console.log(err);
  this.emit('end');
  process.exit(1);
}

gulp.task('clean', () =>
  del(['dist', 'assets/dist'])
);

// CSS

gulp.task('preprocess-css', () =>
  gulp.src('assets/styles/all-stylesheets.css')
    .pipe(gulpIf(!prod, sourcemaps.init()))
    .pipe(concatCss('all-stylesheets.css'))
    .pipe(postcss([ autoprefixer() ]))
    .pipe(gulpIf(!prod, sourcemaps.write()))
    .pipe(gulp.dest('assets/dist/styles'))
    .on('error', onError)
    .pipe(bs.stream())
);

// YAML

gulp.task('validate-yaml', () =>
  gulp.src('./src/resources/*.yml')
    .pipe(validateYaml({ html: false }))
    .on('error', onError)
);

// JS

gulp.task('browserify', () => {
  let gulpBrowserify = function (fileIn, fileOut) {
    return browserify({
      entries: fileIn,
      debug: !prod,
      paths: [path.dirname(fileIn), './dist']
    })
      .transform('babelify', { presets: ['es2015'] })
      .bundle()
      .on('error', onError)
      .pipe(source(fileOut))
      .pipe(buffer());
  };

  return gulpBrowserify('./dist/js/client/main.js', 'main.js')
    .pipe(gulpIf(!prod, sourcemaps.init({ loadMaps: true })))
    .pipe(gulpIf(prod, terser()))
    .pipe(gulpIf(!prod, sourcemaps.write()))
    .pipe(gulp.dest('assets/dist/scripts'))
    .on('error', onError)
    .pipe(bs.stream());
});

gulp.task('compile-typescript', () => {
  const tsProject = ts.createProject('tsconfig.json');
  return tsProject.src()
    .pipe(tsProject())
    .on('error', onError)
    .js.pipe(gulp.dest('dist'));
});

gulp.task('copy-source', () => {
  const paths = ['src/**', '!src/**/*.ts'];
  return gulp.src(paths)
    .pipe(gulp.dest('dist'));
});

// Other assets

gulp.task('copy-assets', () =>
  gulp.src(assetPath)
    .pipe(gulp.dest('assets/dist'))
    .on('error', onError)
    .pipe(bs.stream({ once: true }))
);

gulp.task('rev-assets', () =>
  gulp.src('assets/dist/**')
    .pipe(revAll.revision({
      includeFilesInManifest: ['.css', '.html', '.icns', '.ico', '.jpg', '.js', '.png', '.svg']
    }))
    .pipe(gulp.dest('assets/dist'))
    .pipe(revAll.manifestFile())
    .on('error', onError)
    .pipe(gulp.dest('assets/dist'))
);

gulp.task('wait', (cb) =>
  setTimeout(cb, 2000)
);

gulp.task('build', (cb) => {
  let args = ['clean', 'copy-assets', 'compile-typescript', 'copy-source', 'browserify', 'preprocess-css', 'validate-yaml'];

  if (prod) {
    // HACK: Waiting for a little bit means all of the assets actually get rev'd
    args.push('wait');
    args.push('rev-assets');
  }

  args.push(cb);

  sequence.apply(null, args);
});

gulp.task('watch', ['build'], () => {
  gulp.watch(['src/js/**'], ['compile-typescript', 'copy-source', 'browserify']);
  gulp.watch('assets/styles/**.css', ['preprocess-css']);
  gulp.watch(['src/views/**', 'src/resources/**'], bs.reload);
  gulp.watch(assetPath, ['copy-assets']);
});

gulp.task('serve', ['watch'], () => {
  let runnode = function (env = {}) {
    nodemon({
      script: 'dist/index.js',
      ext: 'js',
      ignore: ['dist/js/client/**', 'gulpfile.js'],
      env: Object.assign({
        NODE_PATH: './dist',
      }, env),
    });
  };

  if (!argv.nobs) {
    bs.init({
      port: 8000,
      logSnippet: false
    }, (err) => {
      runnode({
        BS_SNIPPET: bs.getOption('snippet')
      });
    });
  } else {
    runnode({
      NODE_PATH: `${process.env.NODE_PATH}:./src`,
    });
  }
});
