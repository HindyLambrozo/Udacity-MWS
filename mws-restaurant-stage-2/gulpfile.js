const $ = gulpLoadPlugins();
const autoprefixer = require('gulp-autoprefixer');
const babelify = require("babelify");
const browserify = require("browserify");
const browserSync = require("browser-sync").create();
const buffer = require('vinyl-buffer');
const clean_css = require('gulp-clean-css');
const concat = require("gulp-concat");
const del = require("del");
const gulp = require("gulp");
const gulpLoadPlugins = require("gulp-load-plugins");
const reload = browserSync.reload;
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const runSequence = require("run-sequence");
const source = require("vinyl-source-stream");
const sourcemaps = require('gulp-souremaps');
const uglify = require('gulp-uglify');
const wiredep = require("wiredep").stream;

console.log(JSON.stringify(plugins));

//let dev = true;

gulp.task("css", () => {
  return gulp
    .src("app/css/*.css")
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe(
      $.autoprefixer({ browsers: ["> 1%", "last 2 versions", "Firefox ESR"] })
    )
    .pipe($.if(dev, $.sourcemaps.write()))
    .pipe(gulp.dest(".tmp/css"))
    .pipe(reload({ stream: true }));
});

gulp.task("js", () => {
  return gulp
    .src("app/js/**/*.js")
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(dev, $.sourcemaps.write(".")))
    .pipe(gulp.dest(".tmp/js"))
    .pipe(reload({ stream: true }));
});

gulp.task("sw", () => {
  const b = browserify({
    debug: true
  });

  return b
    .transform(babelify)
    .require("app/sw.js", {entry:true})
    .bundle()
    .pipe(source("sw.js"))
    .pipe(gulp.dest(".tmp/"))
});

function lint(files) {
  return gulp
    .src(files)
    .pipe($.eslint({ fix: false }))
    .pipe(reload({ stream: true, once: true }))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task("lint", () => {
  return lint("app/js/**/*.js").pipe(gulp.dest("app/js"));
});
gulp.task("lint:test", () => {
  return lint("test/spec/**/*.js").pipe(gulp.dest("test/spec"));
});

gulp.task("html", ["css", "js", "sw"], () => {
  return gulp
    .src("app/*.html")
    .pipe($.useref({ searchPath: [".tmp", "app", "."] }))
    .pipe($.if(/\.js$/, $.uglify({ compress: { drop_console: true } })))
    .pipe($.if(/\.css$/, $.cssnano({ safe: true, autoprefixer: false })))
    .pipe(
      $.if(
        /\.html$/,
        $.htmlmin({
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: { compress: { drop_console: true } },
          processConditionalComments: true,
          removeComments: true,
          removeEmptyAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        })
      )
    )
    .pipe(gulp.dest("dist"));
});

gulp.task("images", () => {
  return gulp
    .src("app/img/**/*")
    .pipe($.cache($.imagemin()))
    .pipe(gulp.dest("dist/img"));
});

gulp.task("icons", () => {
  return gulp.src("app/icons/**/*").pipe(gulp.dest("dist/icons"));
});

gulp.task("fonts", () => {
  return gulp
    .src(
      require("main-bower-files")("**/*.{eot,svg,ttf,woff,woff2}", function(
        err
      ) {}).concat("app/fonts/**/*")
    )
    .pipe($.if(dev, gulp.dest(".tmp/fonts"), gulp.dest("dist/fonts")));
});

gulp.task("extras", () => {
  return gulp
    .src(["app/*", "!app/*.html"], {
      dot: true
    })
    .pipe(gulp.dest("dist"));
});

gulp.task("clean", del.bind(null, [".tmp", "dist"]));

gulp.task("serve", () => {
  runSequence(["clean", "wiredep"], ["css", "js", "sw", "fonts"], () => {
    browserSync.init({
      notify: false,
      port: 8000,
      server: {
        baseDir: [".tmp", "app"],
        routes: {
          "/bower_components": "bower_components"
        }
      }
    });

    gulp
      .watch([
        "app/*.html",
        "app/images/**/*",
        "app/icons/**/*",
        ".tmp/fonts/**/*"
      ])
      .on("change", reload);

    gulp.watch("app/css/**/*.css", ["css"]);
    gulp.watch("app/js/**/*.js", ["js"]);
    gulp.watch("app/sw.js", ["sw"]);
    gulp.watch("app/fonts/**/*", ["fonts"]);
    gulp.watch("bower.json", ["wiredep", "fonts"]);
  });
});

gulp.task("serve:dist", ["default"], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ["dist"]
    }
  });
});

gulp.task("serve:test", ["js"], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: "test",
      routes: {
        "/js": ".tmp/js",
        "/bower_components": "bower_components"
      }
    }
  });

  gulp.watch("app/js/**/*.js", ["js"]);
  gulp.watch(["test/spec/**/*.js", "test/index.html"]).on("change", reload);
  gulp.watch("test/spec/**/*.js", ["lint:test"]);
});

// inject bower components
gulp.task("wiredep", () => {
  gulp
    .src("app/*.html")
    .pipe(
      wiredep({
        ignorePath: /^(\.\.\/)*\.\./
      })
    )
    .pipe(gulp.dest("app"));
});

gulp.task(
  "build",
  ["lint", "html", "images", "icons", "fonts", "extras"],
  () => {
    return gulp.src("dist/**/*").pipe($.size({ title: "build", gzip: true }));
  }
);

gulp.task("default", () => {
  return new Promise(resolve => {
    dev = false;
    runSequence(["clean", "wiredep"], "build", resolve);
  });
});