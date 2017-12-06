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
const ts = require('gulp-typescript');

const tsProject = ts.createProject('tsconfig.json');

let prod = !!argv.prod || process.env.NODE_ENV == 'production';

const eslint = prod ? null : require('gulp-eslint');

console.log(argv);

let onError = function onError(err) {
  $.util.beep();
  console.log(err);
  this.emit('end');
};

gulp.task('clean', () => {
  return del('assets/dist');
});

// css

gulp.task('main-styles', () => {
  return gulp.src('src/styles/main.styl')
    .pipe($.if(!prod, $.sourcemaps.init()))
    .pipe($.stylus({
      'include css': true,
      paths: ['./node_modules']
    }))
    .pipe($.autoprefixer())
    .pipe($.if(!prod, $.sourcemaps.write()))
    .pipe(gulp.dest('assets/dist/styles'))
    .pipe(bs.stream());
});

gulp.task('hc2018-styles', () => {
  gulp.src('src/styles/hc-2018/all-stylesheets.styl')
    .pipe($.if(!prod, $.sourcemaps.init()))
    .pipe($.stylus({
      'include css': true,
      paths: ['./node_modules']
    }))
    .pipe($.autoprefixer())
    .pipe($.if(!prod, $.sourcemaps.write()))
    .pipe(gulp.dest('assets/dist/styles/hc-2018'))
    .pipe(bs.stream());
});

gulp.task('styles', ['main-styles', 'hc2018-styles']);

// js
gulp.task('client-scripts', () => {
  let gulpBrowserify = function (fileIn, fileOut) {
    return browserify({
      entries: fileIn,
      debug: !prod,
      paths: [path.dirname(fileIn), './src']
    })
      .transform('babelify', { presets: ['es2015'] })
      .bundle()
      .on('error', onError)
      .pipe(source(fileOut))
      .pipe(buffer());
  };

  return gulpBrowserify('./src/js/client/main.js', 'main.js')
    .pipe($.if(!prod, $.sourcemaps.init({ loadMaps: true })))
    .pipe($.if(prod, $.uglify()))
    .pipe($.if(!prod, $.sourcemaps.write()))
    .pipe(gulp.dest('assets/dist/scripts'))
    .pipe(bs.stream());
});

gulp.task('server-scripts', () => {
  return tsProject.src()
    .pipe(tsProject())
    .js.pipe(gulp.dest('assets/dist/built'));
});

gulp.task('scripts', ['client-scripts', 'server-scripts']);

let assetPath = ['assets/**', '!assets/dist/**'];

// other assets
gulp.task('assets', () => {
  return gulp.src(assetPath)
    .pipe(gulp.dest('assets/dist'))
    .pipe(bs.stream({ once: true }));
});

gulp.task('lint', () => {
  return gulp.src(['**/*.js', '!node_modules/**', '!assets/dist/**.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('rev', () => {
  return gulp.src('assets/dist/**')
    .pipe($.revAll.revision())
    .pipe(gulp.dest('assets/dist'))
    .pipe($.revAll.manifestFile())
    .pipe(gulp.dest('assets/dist'));
});

gulp.task('wait', (cb) => {
  setTimeout(cb, 2000);
});

gulp.task('watch', ['build'], () => {
  gulp.watch(['src/js/**'], ['scripts']);
  gulp.watch('src/styles/**', ['styles']);
  gulp.watch(['src/views/**', 'src/resources/**'], bs.reload);
  gulp.watch(assetPath, ['assets']);
});

gulp.task('serve', ['watch'], () => {
  let runnode = function (env = {}) {
    nodemon({
      script: 'assets/dist/built/js/index.js',
      ext: 'js',
      ignore: ['src/**', 'gulpfile.js', 'assets/dist/built/js/client/**'],
      env: Object.assign({
        NODE_PATH: './assets/dist/built',
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
      NODE_PATH: `${process.env.NODE_PATH}:./assets/dist/built`,
    });
  }
});

gulp.task('build', (cb) => {
  let args = ['clean'];

  if (!prod) {
    args.push('lint');
  }

  args.push('assets', 'scripts', 'styles');

  if (prod) {
    // HACK: Waiting for a little bit means all of the assets actually get rev'd
    args.push('wait');
    args.push('rev');
  }

  args.push(cb);

  sequence.apply(null, args);
});
