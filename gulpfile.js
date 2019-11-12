var gulp = require('gulp');
var autoprefixer = require('autoprefixer');
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();
var mainBowerFiles = require('main-bower-files');
var browserSync = require('browser-sync').create();
var minimist = require('minimist');
var gulpSequence = require('gulp-sequence');
var wait = require('gulp-wait');
var envOptions = {
  default: { env: 'dev' }
};

var options = minimist(process.argv.slice(2), envOptions);
//gulp vendorJs --env production
//process.argv.slice(2) 略過--
//envOptions 預設為 develop
//minimist(env,envOptions)
//--env production=={env: 'production'}
//--beep=boop =={beep:'boop'}

gulp.task('clean', function () {
  return gulp.src(['./.tmp', './public'], { read: false })
          .pipe(plugins.clean())
});

gulp.task('html', function () {
  gulp.src('./source/**/*.html')
          .pipe(plugins.plumber())
          .pipe(gulp.dest('./public/'))
          .pipe(browserSync.stream())
})
gulp.task('font', function () {
  gulp.src('./source/font/**')
          .pipe(gulp.dest('./public/font/'))
})
gulp.task('jade', function () {
  gulp.src('./source/**/*.jade')
          .pipe(plugins.jade({
                  pretty: true
          }))
          .pipe(gulp.dest('./public/'))
          .pipe(browserSync.stream())
});

gulp.task('sass', function () {
  var plugin = [
          autoprefixer({
                  overrideBrowserslist: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 9', 'iOS >= 8', 'Android >= 4']
          })]
  gulp.src('./source/scss/*.scss')
          .pipe(wait(200))
          .pipe(plugins.plumber())
          .pipe(plugins.sourcemaps.init())
          .pipe(plugins.sass(
                  {
                          outputStyle: 'nested',
                          includePaths: ['./node_modules/bootstrap/scss']
                  }
          ).on('error', plugins.sass.logError))
          // .pipe(autoprefixer({
          //     browsers: ['last 3 versions','> 5%','ie 8'],
          // }))
          .pipe(plugins.postcss(plugin))
          .pipe(plugins.minifyCss())
          .pipe(plugins.if(options.env === 'production', plugins.cleanCss()))
          .pipe(plugins.sourcemaps.write('.'))
          .pipe(gulp.dest('./public/css'))
          .pipe(browserSync.stream())
});

gulp.task('babel', () =>
  gulp.src('./source/js/**/*.js')
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.babel({
              presets: ['@babel/env']
      }))
      .pipe(plugins.concat('all.js'))
      .pipe(plugins.uglify())
      .pipe(plugins.if(options.env === 'production', plugins.uglify({
              compress: {
                      drop_console: true
              }
      })))
      .pipe(plugins.sourcemaps.write('.'))
      .pipe(gulp.dest('./public/js'))
      .pipe(browserSync.stream())
);

gulp.task('bower', function () {
  return gulp.src(mainBowerFiles({
    "overrides": {
      "vue": {
        "main": "dist/vue.js"
      },
      "nicescroll": {
        "main": "dist/jquery.nicescroll.js"
      },
    }
  }))
    .pipe(gulp.dest('./.tmp/vendors'))
});

// gulp.task('others', function () {
//   gulp.src('./bower_components/sweetalert/**')
//     .pipe(gulp.dest('./source/vue'))
//     .pipe(gulp.dest('./public/vue'))
// })

gulp.task('vendorJs', ['bower'], function () {
  return gulp.src('./.tmp/vendors/**/*')
          // .pipe(plugins.concat('vendors.js'))
          // .pipe(plugins.uglify())
          // .pipe(plugins.order([
          //         'vendors.js',
          //         'sweetalert.js'
          // ]))
          .pipe(gulp.dest('./source/vue'))
          .pipe(plugins.if(options.env === 'production', plugins.uglify()))
          .pipe(gulp.dest('./public/vue'))
})

gulp.task('browser-sync', function () {
  browserSync.init({
          server: {
                  baseDir: "./public",
                  reloadDebounce: 2000
          }
  });
});

gulp.task('js', function () {
  gulp.src('./source/js/**/*.js')
          .pipe(plugins.plumber())
          .pipe(plugins.concat('all.js'))
          .pipe(plugins.if(options.env === 'production', plugins.uglify()))
          .pipe(gulp.dest('./public/js'))
          .pipe(browserSync.stream())
});

gulp.task('watch', ['html', 'sass', 'babel', 'images', 'font'], function () {
  gulp.watch('./source/**/*.html', ['html']);
  gulp.watch('./source/font/**', ['font']);
  gulp.watch('./source/scss/**/*.scss', ['sass']);
  // gulp.watch('./source/js/*.js', ['js']);
  gulp.watch('./source/js/*.js', ['babel']);
  gulp.watch('./source/images/**', ['images']);
});

gulp.task('images', () =>
    gulp.src('./source/images/**')
        .pipe(plugins.if(options.env === 'production', plugins.imagemin()))
        .pipe(gulp.dest('./public/images'))
);

// gulp.task('deploy', function () {
//     return gulp.src('./public/**/*')
//         .pipe(plugins.ghPages());
// });

gulp.task('build', gulpSequence('clean', 'html', 'sass','vendorJs','babel'));

gulp.task('default', ['watch','vendorJs', 'browser-sync']);