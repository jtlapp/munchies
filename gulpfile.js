"use strict";

const gulp = require('gulp');
const ts = require("gulp-typescript")
const tsconfig = require("./tsconfig");
const compilerOptions = tsconfig.compilerOptions;
compilerOptions.rootDir = __dirname;

gulp.task("watch", () => {
    gulp.watch('src/**/*.ts', ["build"]);
});

gulp.task("build", [
    'build-src',
    'build-demo'
]);

gulp.task("build-src", () => {
    console.log("building src/")
    return gulp.src(['src/**/*.ts'])
    .pipe(ts(compilerOptions))
    .pipe(gulp.dest('build/src'))
})

gulp.task("build-demo", () => {
    console.log("building demo/")
    return gulp.src(['demo/**/*.ts'])
    .pipe(ts(compilerOptions))
    .pipe(gulp.dest('build/demo'))
})

gulp.task("default", ["watch"]);
