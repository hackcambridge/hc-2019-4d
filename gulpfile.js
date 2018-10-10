'use strict';

let gulp = require('gulp');
let $ = require('gulp-load-plugins')();
let argv = require('yargs').argv;
let path = require('path');
let source = require('vinyl-source-stream');
let buffer = require('vinyl-buffer');
let del = require('del');
let browserify = require('browserify');
let sequence = require('run-sequence');
let bs = require('browser-sync').create();
let nodemon = require('nodemon');
let validateYaml = require('gulp-yaml-validate');
let concatCss = require('gulp-concat-css');

let prod = !!argv.prod || process.env.NODE_ENV == 'production';

let assetPath = ['assets/**', '!assets/dist/**'];

const ts = require('gulp-typescript');

console.log(argv);

let onError = function onError(err) {
  $.util.beep();
  console.log(err);
  this.emit('end');
};

gulp.task('clean', () => {
  return del(['dist', 'assets/dist']);
});

// CSS

gulp.task('preprocess-css', () => {
  gulp.src('assets/**/*.css')
    .pipe($.if(!prod, $.sourcemaps.init()))
    .pipe($.concatCss("styles/all-stylesheets.css"))
    .pipe($.autoprefixer())
    .pipe($.if(!prod, $.sourcemaps.write()))
    .pipe(gulp.dest('assets/dist/styles'))
    .pipe(bs.stream());
});

// YAML

gulp.task('validate-yaml', () => {
  gulp.src('./src/resources/*.yml')
    .pipe(validateYaml({ html: false }));
});

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
    .pipe($.if(!prod, $.sourcemaps.init({ loadMaps: true })))
    .pipe($.if(prod, $.uglify()))
    .pipe($.if(!prod, $.sourcemaps.write()))
    .pipe(gulp.dest('assets/dist/scripts'))
    .pipe(bs.stream());
});

gulp.task('compile-typescript', () => {
  const tsProject = ts.createProject('tsconfig.json');
  return tsProject.src()
    .pipe(tsProject())
    .js.pipe(gulp.dest('dist'));
});

gulp.task('copy-source', () => {
  const paths = ['src/**', '!src/**/*.ts'];
  return gulp.src(paths)
    .pipe(gulp.dest('dist'));
});

// Other assets

gulp.task('copy-assets', () => {
  return gulp.src(assetPath)
    .pipe(gulp.dest('assets/dist'))
    .pipe(bs.stream({ once: true }));
});

gulp.task('rev-assets', () => {
  return gulp.src('assets/dist/**')
    .pipe($.revAll.revision({
      includeFilesInManifest: ['.css', '.html', '.icns', '.ico', '.jpg', '.js', '.png', '.svg']
    }))
    .pipe(gulp.dest('assets/dist'))
    .pipe($.revAll.manifestFile())
    .pipe(gulp.dest('assets/dist'));
});

gulp.task('wait', (cb) => {
  setTimeout(cb, 2000);
});

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
  gulp.watch(['src/js/**'], ['compile', 'copy', 'scripts']);
  gulp.watch('assets/**/*.css', ['preprocess-css']);
  gulp.watch(['src/views/**', 'src/resources/**'], bs.reload);
  gulp.watch(assetPath, ['assets']);
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
