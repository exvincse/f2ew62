// 引用gulp
var gulp = require('gulp');
// 為gulp-postcss延伸套件(sass)
var autoprefixer = require('autoprefixer');
// 不須在最上層定義變數 僅限gulp-前啜詞套件且屬於原本gulp套件
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();
// gulp串接bower
var mainBowerFiles = require('main-bower-files');
// 建立本地伺服器
var browserSync = require('browser-sync').create();
// 以參數選擇壓縮或不壓縮
var minimist = require('minimist');
var gulpSequence = require('gulp-sequence');
// 延遲時間後進行
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

// 執行任務時清空指定資料夾資料
gulp.task('clean', function () {
  return gulp.src(['./.tmp', './public'], { read: false })
          .pipe(plugins.clean())
});
// 編譯.html檔至public資料夾
gulp.task('html', function () {
  gulp.src('./source/**/*.html')
          .pipe(plugins.plumber())
          .pipe(gulp.dest('./public/'))
          .pipe(browserSync.stream())
})
gulp.task('jade', function () {
  gulp.src('./source/**/*.jade')
          .pipe(plugins.jade({
                  pretty: true
          }))
          .pipe(gulp.dest('./public/'))
          .pipe(browserSync.stream())
});
// 編譯font資料夾至public資料夾
gulp.task('font', function () {
  gulp.src('./source/font/**')
          .pipe(gulp.dest('./public/font/'))
})
// 編譯.scss檔至public資料夾
gulp.task('sass', function () {
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
          .pipe(plugins.postcss([autoprefixer]))
          // .pipe(plugins.minifyCss())
          .pipe(plugins.if(options.env === 'production', plugins.cleanCss()))
          .pipe(plugins.sourcemaps.write('.'))
          .pipe(gulp.dest('./public/css'))
          .pipe(browserSync.stream())
});
// 將js裡面ES5以上降轉為ES5至public資料夾
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
// 選用bower_components裡面指定的套件至.tmp資料夾
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

// 取用.tmp資料夾裡面套件至source,public
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
// 建立本地伺服器
gulp.task('browser-sync', function () {
  browserSync.init({
          server: {
                  baseDir: "./public",
                  reloadDebounce: 2000
          }
  });
});

// gulp.task('js', function () {
//   gulp.src('./source/js/**/*.js')
//           .pipe(plugins.plumber())
//           .pipe(plugins.concat('all.js'))
//           .pipe(plugins.if(options.env === 'production', plugins.uglify()))
//           .pipe(gulp.dest('./public/js'))
//           .pipe(browserSync.stream())
// });

// 監聽任務
gulp.task('watch', ['html', 'sass', 'babel', 'images', 'font'], function () {
  gulp.watch('./source/**/*.html', ['html']);
  gulp.watch('./source/font/**', ['font']);
  gulp.watch('./source/scss/**/*.scss', ['sass']);
  // gulp.watch('./source/js/*.js', ['js']);
  gulp.watch('./source/js/*.js', ['babel']);
  gulp.watch('./source/images/**', ['images']);
});

// 壓縮圖片
gulp.task('images', () =>
    gulp.src('./source/images/**')
        .pipe(plugins.if(options.env === 'production', plugins.imagemin()))
        .pipe(gulp.dest('./public/images'))
);

// production時依序執行裡面任務
gulp.task('build', gulpSequence('clean', 'html', 'sass','vendorJs','images','babel'));

// development時依序執行裡面任務
gulp.task('default', ['watch','vendorJs', 'browser-sync']);