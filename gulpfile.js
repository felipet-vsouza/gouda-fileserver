var gulp = require("gulp");
var ts = require("gulp-typescript");
var del = require("del");
var tsProject = ts.createProject("tsconfig.json");
var configJSON = "src/core/config/config.json";

gulp.task("default", () => {
    gulp.start("cleanDist", "build", "copyAssets");
});

gulp.task("build", () => {
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

gulp.task("cleanDist", () => {
    return del(['dist/**'], {
        force: true
    });
});