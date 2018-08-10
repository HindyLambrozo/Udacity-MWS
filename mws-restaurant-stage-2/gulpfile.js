// generated on 2018-07-17 using generator-webapp 3.0.1
// fixed based on https://developers.google.com/web/tools/workbox/

const gulp = require('gulp');

const autoprefixer = require('gulp-autoprefixer');
const babelify = require('babelify');
const browserify = require('browserify');
const browserSync = require('browser-sync').create();
const buffer = require('vinyl-buffer');
const clean_css = require('gulp-clean-css');
const concat = require('gulp-concat');
const del = require('del');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');

const gulpLoadPlugins = require('gulp-load-plugins');
const reload = browserSync.reload;
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const runSequence = require('run-sequence');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const wiredep = require('wiredep').stream;

const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const webp = require('gulp-webp');
const responsive = require('gulp-responsive')
const workboxBuild = require('workbox-build');

const $ = gulpLoadPlugins();

/* Task 1 - cleanup*/
// Remove all files in build.
gulp.task('clean-build', () => {
  return del.sync('build');
});

// Remove all images except src.
gulp.task('clean-images', () => {
  return del.sync([
    'app/img',
    'build/img'
  ]);
});

// Remove all JS in build.
gulp.task('clean-js', () => {
  return del.sync([
    'build/js'
  ]);
}); 

gulp.task('clean', cb => {
  runSequence(
    'clean-build',
    'clean-js',
    'clean-images'
 );
});

/*Task 2: images*/

// Copy images that need no manipulations to app.
gulp.task('images-copy2app', () =>
  gulp.src([
    'src/images/touch/**'
  ])
  .pipe(gulp.dest('app/img/touch'))
);

// Create WebP images.
gulp.task('images-webp', () =>
  gulp.src('src/images/*.jpg')
  .pipe(webp())
  .pipe(gulp.dest('app/images'))
);

// Create responsive images.
// https://github.com/mahnunchik/gulp-responsive/blob/HEAD/examples/multiple-resolutions.md
gulp.task('images-resize', function () {
  return gulp.src('app/images/*.{jpg,webp}')
    .pipe($.responsive({
      // Resize all JPEG/WebP images to sizes: 300, 433, 552, 653, 752, 800.
      '*.{jpg,webp}': [{
        width: 300,
        rename: { suffix: '_w_300' },
      }, {
        width: 433,
        rename: { suffix: '_w_433' },
      }, {
        width: 552,
        rename: { suffix: '_w_552' },
      }, {
        width: 653,
        rename: { suffix: '_w_653' },
      }, {
        width: 752,
        rename: { suffix: '_w_752' },
      }, {
        width: 800,
        rename: { suffix: '_w_800' },
      }],
    }, {
      // Global configuration for all images.
      // The output quality for JPEG, WebP and TIFF output formats.
      quality: 70,
      // Use progressive (interlace) scan for JPEG and PNG output.
      progressive: true,
      // Zlib compression level of PNG output format
      compressionLevel: 6,
      // Strip all metadata.
      withMetadata: false,
    }))
    .pipe(gulp.dest('build/img'));
});

// Copy the images from app to build.
gulp.task('images-copy2build', () =>
  gulp.src('app/img/**/*', {base: 'app/img/'})
  .pipe(gulp.dest('build/img'))
);
gulp.task('images', cb => {
  runSequence(
   'images-copy2app',
   'images-webp',
   'images-resize',
   'images-copy2build'
 );
});
// Copy HTML from app to build.
gulp.task('html-copy2build', () =>
  gulp.src('app/*.html')
  .pipe(gulp.dest('build'))
);

gulp.task('html', cb => {
  runSequence(
    'html-copy2build',
   );
});

/*CSS minify and copy*/

gulp.task('css-minify', () => {
  return gulp.src('app/styles/**/*.css')
    .pipe(cleanCSS({debug: true}, (details) => {
      console.log(`${details.name}: ${details.stats.originalSize}`);
      console.log(`${details.name}: ${details.stats.minifiedSize}`);
    }))
  .pipe(gulp.dest('build/css'));
});



// http://babeljs.io/docs/setup/#installation
// https://babeljs.io/docs/usage/babelrc/
// https://github.com/babel/gulp-babel
gulp.task('js-babel', () => {
  // return gulp.src('app/js/**/*.js')
  return gulp.src([
    'app/js/dbhelper.js', 
    'app/js/restaurant_info.js', 
    'app/js/idb-promised.js',
    'app/js/idb.js',
    'app/js/main.js',
    //'app/js/map.js',
    'app/js/registerSW.js',
    ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    // .pipe(concat('app.min.js'))
    // .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/js'));
});

gulp.task('js-minify-idb', () => {
  return gulp.src([
    'app/js/idb-promised.js', 'app/js/idb.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('idb-bundle.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/js'));
});

gulp.task('js-minify-main', () => {
  return gulp.src([
    'app/js/dbhelper.js', 'app/js/main.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('main-bundle.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/js'));
});

gulp.task('js-minify-resto', () => {
  return gulp.src([
    'app/js/dbhelper.js', 'app/js/restaurant_info.js'
    ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat('resto-bundle.min.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/js'));
});

// Copy JavaScript from app to build.
gulp.task('js-copy2build', () =>
  gulp.src('app/js/**/*.js')
  .pipe(gulp.dest('build/js'))
);

gulp.task('js', cb => {
  runSequence(
    'js-babel',
    'js-minify-main',
    'js-minify-idb',
    'js-minify-resto',
    'js-copy2build'
 );
});


// Create a service worker in build.
gulp.task('pwa-service-worker', () => {
  return workboxBuild.injectManifest({
    swSrc: 'src/sw.js',
    swDest: 'build/sw.js',
    globDirectory: 'build',
    globPatterns: [
      '**\/*.css',
      'index.html',
      'js\/animation.js',
      'images\/home\/*.jpg',
      'images\/icon\/*.svg'
    ],
    globIgnores: [
      'workbox-config.js',
      'node_modules/**/*'
    ]
  }).then(({count, size, warnings}) => {
    // Optionally, log any warnings and details.
    warnings.forEach(console.warn);
    console.log(
      `[INFO] ${count} files will be precached, totaling ${size} bytes.`);
  }).catch(err => {
    console.log('[ERROR] ' + err);
  });
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

// Copy manifest.json to build.
gulp.task('pwa-manifest-copy2build', () =>
  gulp.src('app/manifest.json')
  .pipe(gulp.dest('build'))
);






// This task watches our 'app' files & rebuilds whenever they change.
gulp.task('watch', () => {
  gulp.watch('app/img/**', ['images-copy2build']);
  gulp.watch('app/*.html', ['html-copy2build']);
  gulp.watch('app/css/**/*.css', ['css-copy2build']);
  // gulp.watch('app/js/**/*.js', ['js-copy2build']);
  // gulp.watch('app/js/**/*.js', ['js-minify-idb']);
  gulp.watch('app/js/**/*.js', ['build-js']);
  // gulp.watch('app/js/**/*.js', ['babel']);
  gulp.watch('app/manifest.json', ['pwa-manifest-copy2build']);
  gulp.watch('src/js/sw.js', ['pwa-service-worker']);
});


// Clean up and build the images.
gulp.task('build-images', cb => {
  runSequence(
    'clean-images', 
    'images-copy2app', 
    //'images-webp', 
    'images-resize',
    'images-copy2build',
    cb);
});

// Clean up and build the JavaScript.
gulp.task('build-js', cb => {
  runSequence(
    'clean-js',
    'js-minify-idb',
    ['js-minify-main', 'js-minify-resto'],
    'pwa-service-worker',
    cb);
});

// Clean up and build the production app.
gulp.task('build', cb => {
  runSequence(
    'clean-build',
    'build-images',
    'html-copy2build',
    'css-minify',
    ['js-minify-idb', 'js-minify-main', 'js-minify-resto'],
    'pwa-manifest-copy2build', 'pwa-service-worker',
    cb);
});

//Default Gulp task.
gulp.task('default', cb => {
  runSequence(
    'build-js',
    'build-images',
    'build'
 );
});


//gulp serve
gulp.task('serve', () => {
  //runSequence(['build-js', 'build-images', 'build'] () => {
    browserSync.init({
      notify: false,
      port: 8000,
      server: {
        baseDir: ['app', 'build'],
        routes: {
          '/bower_components': 'bower_components'
        }
      }
    });

    gulp
      .watch([
        'app/*.html',
        'app/images/**/*',
        'app/img/**/*',
        'app/icons/**/*',
        'app/js/**/*',
        '.tmp/fonts/**/*'
        
      ])
      .on('change', reload);

    gulp.watch('app/css/**/*.css', ['css-minify']);
    gulp.watch('app/js/**/*.js', ['build-js']);
    gulp.watch('app/sw.js', ['pwa-service-worker']);
    gulp.watch('app/fonts/**/*', ['fonts']);
    gulp.watch('bower.json', ['wiredep', 'fonts']);
  });

gulp.task('serve:build', () => {
  browserSync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['build']
    }
  });
});

gulp.task('serve:test', ['js-copy2build'], () => {
  browserSync.init({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/js': '.tmp/js',
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch('app/js/**/*.js', ['js']);
  gulp.watch(['test/spec/**/*.js', 'test/index.html']).on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});
