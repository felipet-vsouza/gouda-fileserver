var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");
var configJSON = "src/core/config/config.json";

gulp.task("default", function () {
    gulp.start("build", "copyAssets");
});

gulp.task("build", function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist/"));
});

gulp.task("copyAssets", function () {
    gulp.start('copyConfigJSON');
});

gulp.task("copyConfigJSON", () => {
    gulp.src(configJSON)
        .pipe(gulp.dest("dist/config"));
});