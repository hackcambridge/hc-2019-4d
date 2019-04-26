'use strict';

const gulp = require('gulp');
const argv = require('yargs').argv;
const path = require('path');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const del = require('del');
const browserify = require('browserify');
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
const tslint = require('gulp-tslint');
const validateYaml = require('gulp-yaml-validate');

let prod = !!argv.prod || process.env.NODE_ENV == 'production';

let assetPaths = ['assets/**', '!assets/dist/**', '!assets/styles/**'];

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
    .pipe(bs.stream())
);

// YAML

gulp.task('validate-yaml', () =>
  gulp.src('./assets/resources/*.yml')
    .pipe(validateYaml({ html: false }))
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
      .pipe(source(fileOut))
      .pipe(buffer());
  };

  return gulpBrowserify('./dist/client/main.js', 'main.js')
    .pipe(gulpIf(!prod, sourcemaps.init({ loadMaps: true })))
    .pipe(gulpIf(prod, terser()))
    .pipe(gulpIf(!prod, sourcemaps.write()))
    .pipe(gulp.dest('assets/dist/scripts'))
    .pipe(bs.stream());
});

gulp.task('compile-typescript', () => {
  const tsProject = ts.createProject('tsconfig.json');
  return tsProject.src()
    .pipe(tsProject())
    .js.pipe(gulp.dest('dist'));
});

gulp.task("lint-typescript", () =>
  gulp
    .src("src/**/*.ts")
    .pipe(tslint({
        formatter: "verbose"
    }))
    .pipe(tslint.report())
);

gulp.task('copy-source', () => {
  const paths = ['src/**', '!src/**/*.ts'];
  return gulp.src(paths)
    .pipe(gulp.dest('dist'));
});

// Other assets

gulp.task('copy-assets', () =>
  gulp.src(assetPaths)
    .pipe(gulp.dest('assets/dist'))
    .pipe(bs.stream({ once: true }))
);

gulp.task('rev-assets', () =>
  gulp.src('assets/dist/**')
    .pipe(revAll.revision({
      includeFilesInManifest: ['.css', '.html', '.icns', '.ico', '.jpg', '.js', '.png', '.svg']
    }))
    .pipe(gulp.dest('assets/dist'))
    .pipe(revAll.manifestFile())
    .pipe(gulp.dest('assets/dist'))
);

gulp.task('wait', (cb) =>
  setTimeout(cb, 2000)
);

function generateBuildTasks() {
  let tasks = ['clean', 'copy-assets', 'lint-typescript', 'compile-typescript', 'copy-source', 'browserify', 'preprocess-css', 'validate-yaml'];

  if (prod) {
    // HACK: Waiting for a little bit means all of the assets actually get rev'd
    tasks.push('wait');
    tasks.push('rev-assets');
  }

  return tasks;
}

gulp.task('build', gulp.series(... generateBuildTasks()));

gulp.task('run-watchers', () => {
  gulp.watch(['src/**'], gulp.series('compile-typescript', 'copy-source', 'browserify'));
  gulp.watch('assets/styles/**.css', gulp.series('preprocess-css'));
  gulp.watch(['views/**', 'assets/resources/**'], bs.reload);
  gulp.watch(assetPaths, gulp.series('copy-assets'));
})

gulp.task('watch', gulp.series('build', 'run-watchers'));

gulp.task('run-server',  () => {
  let runnode = function (env = {}) {
    nodemon({
      script: 'dist/index.js',
      ext: 'js',
      ignore: ['dist/client/**', 'gulpfile.js'],
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

gulp.task('serve', gulp.series('build', gulp.parallel('run-watchers', 'run-server')));
