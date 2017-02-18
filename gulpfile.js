var gulp = require("gulp");
var ts = require("gulp-typescript");
var del = require("del");
var runSequence = require("run-sequence");

var tsProject = ts.createProject("tsconfig.json");
var configJSON = "src/core/config/config.json";

gulp.task("default", () => {
    return runSequence("cleanDist", "build");
});

gulp.task("build", () => {
    return gulp.start("buildProject", "copyAssets");
});

gulp.task("cleanDist", () => {
    return del(['dist/**'], {
        force: true
    });
});

gulp.task("buildProject", () => {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist/"));
});

gulp.task("copyAssets", () => {
    return gulp.start('copyConfigJSON');
});

gulp.task("copyConfigJSON", () => {
    return gulp.src(configJSON)
        .pipe(gulp.dest("dist/config"));
});