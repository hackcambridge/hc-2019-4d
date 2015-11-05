'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var argv = require('yargs').argv;
var path = require('path');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var del = require('del');
var browserify = require('browserify');
var sequence = require('run-sequence');

var prod = !!argv.prod || process.env.NODE_ENV == 'production';

var onError = function onError(err) {
  $.util.beep();
  console.log(err.message);
  this.emit('end');
};

gulp.task('clean', function () {
  return del('assets/dist');
});

// css
gulp.task('styles', function () {
  gulp.src('assets/styles/main.styl')
    .pipe($.stylus({
      'include css': true,
      paths: ['./node_modules']
    }))
    .pipe($.autoprefixer())
    .pipe(gulp.dest('assets/dist/styles'));
});

// js
gulp.task('scripts', function () {
  var gulpBrowserify = function (fileIn, fileOut) {
    return browserify({
      entries: fileIn,
      debug: !prod,
      paths: [path.dirname(fileIn)]
    })
    .bundle()
    .on('error', onError)
    .pipe(source(fileOut))
    .pipe(buffer());
  };

  return gulpBrowserify('./assets/scripts/main.js', 'main.js')
    .pipe($.if(!prod, $.sourcemaps.init({ loadMaps: true })))
    .pipe($.if(prod, $.uglify()))
    .pipe($.if(!prod, $.sourcemaps.write()))
    .pipe(gulp.dest('assets/dist/scripts'));
});

var assetPath = ['assets/**', '!assets/scripts/**', '!assets/styles/**', '!assets/dist/**'];

// other assets
gulp.task('assets', function () {
  gulp.src(assetPath)
    .pipe(gulp.dest('assets/dist'));
});

gulp.task('rev', function () {
  var rev = new $.revAll();

  gulp.src('assets/dist/**')
    .pipe(rev.revision())
    .pipe(gulp.dest('assets/dist'))
    .pipe(rev.manifestFile())
    .pipe(gulp.dest('assets/dist'));
});

gulp.task('watch', ['build'], function () {
  gulp.watch('assets/scripts/**', ['scripts']);
  gulp.watch('assets/styles/**', ['styles']);
  gulp.watch(assetPath, ['assets']);
});

gulp.task('build', function () {
  var args = ['clean', ['assets', 'scripts', 'styles']];
  if (prod) {
    args.push('rev');
  }
  sequence.apply(null, args);
});
