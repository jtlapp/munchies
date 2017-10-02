"use strict";

const gulp = require('gulp');
const shell = require('gulp-shell');
const del = require('del');

gulp.task("build", [
    'clean',
    'update'
]);

gulp.task("update",
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
    ], [ "update" ]);
});

gulp.task("default", ["watch"]);
