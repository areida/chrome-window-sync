/* jshint node: true */
'use strict';

var gulp   = require('gulp');
var gutil  = require('gulp-util');
var rimraf = require('rimraf');
var zip    = require('gulp-zip');
var _      = require('underscore');

// Require all our tasks
require('./gulp-tasks/browserify');

// Build app and run server but don't watch for changes
gulp.task('default', ['build']);

// Build app and don't run server or watch for changes
gulp.task('build', ['preprocess', 'browserify:extension']);

// Build app, run server, and watch for changes
gulp.task('watch', ['preprocess', 'watchify:extension']);

gulp.task('preprocess', function() {
    gulp.src('./src/content.js').pipe(gulp.dest('./extension/js'));

    return gulp.src([
            './manifest.json',
            './media/**/*.*'
        ])
        .pipe(gulp.dest('./extension'));
});

gulp.task('dist', ['build'], function() {
    return gulp.src('./build/**/*')
        .pipe(zip(Date.now() + '.zip'))
        .pipe(gulp.dest('./dist'));
});

// Clean up the build directories
gulp.task('clean', ['clean:extension', 'clean:dist']);

// Clean definitions
gulp.task('clean:extension', function(cb) {
    rimraf('./extension', cb);
});

gulp.task('clean:dist', function(cb) {
    rimraf('./dist', cb);
});
