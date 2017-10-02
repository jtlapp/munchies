"use strict";

const gulp = require('gulp');
const shell = require('gulp-shell');
const del = require('del');

gulp.task("build",
    shell.task('tsc', { 
        cwd: __dirname
    })
);

gulp.task("clean", () => {
    return del(['build/**/*']);
});

gulp.task("watch", () => {
    gulp.watch([
        'src/**/*.ts',
        'demo/**/*.ts'
    ], [ "build" ]);
});

gulp.task("default", ["watch"]);
