/* jshint node: true */
'use strict';

var browserify = require('browserify');
var gulp       = require('gulp');
var gutil      = require('gulp-util');
var source     = require('vinyl-source-stream');
var streamify  = require('gulp-streamify');
var uglify     = require('gulp-uglify');
var watchify   = require('watchify');

var error = require('./error');

var bundle = function(taskname, filename, entries, watch) {
    var backend, bundler, env, rebundle;

    env     = gutil.env.env;
    backend = gutil.env.backend || '';

    bundler = browserify({
            debug        : (env !== 'production'),
            entries      : entries,
            extensions   : ['.js'],
            cache        : {},
            packageCache : {},
            fullPaths    : true
        })
        .on('log', gutil.log);

    if (watch) {
        watchify(bundler);
    }

    rebundle = function() {
        return bundler.bundle()
            .on('error', error('browserify:' + taskname))
            .pipe(source(filename))
            .pipe(env === 'production' ? streamify(uglify()) : gutil.noop())
            .pipe(gulp.dest('./extension/js'));
    };

    bundler.on('update', rebundle);

    return rebundle();
};

gulp.task('browserify:extension', function() {
    return bundle('extension', 'background.js', ['./src/bootstrap.js'], false);
});

gulp.task('watchify:extension', function() {
    return bundle('extension', 'background.js', ['./src/bootstrap.js'], true);
});
