const gulp = require('gulp');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const uglify = require('gulp-uglify');
const clean = require('gulp-clean');
const newer = require('gulp-newer');
const autoprefixer = require('gulp-autoprefixer');

gulp.task('serve', function() {
	browserSync.init({
    server: {
      baseDir: "./dev"
    },
    tunnel: true,
  });

  gulp.watch("./dev/sass/*.scss", gulp.series('sass'));
  gulp.watch("./dev/**/*.{html,css,js}").on('change', browserSync.reload);
});

gulp.task('sass', function () {
  return gulp.src('./dev/sass/**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest('./dev/css'))
    .pipe(browserSync.stream());
});

gulp.task('clean', function () {
  return gulp.src('./prod/**/*.{html,css,js}', {read: false})
    .pipe(clean());
});

gulp.task('html', function() {
  return gulp.src('./dev/*.html')
    .pipe(gulp.dest('./prod'));
})

gulp.task('fonts', function() {
  return gulp.src('./dev/font/*.{woff,woff2}')
    .pipe(gulp.dest('./prod/font'));
})

gulp.task('css', function () {
  return gulp.src('./dev/sass/**/*.scss')
    .pipe(sass.sync({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(gulp.dest('./prod/css'));
});

gulp.task('js', function() {
  return gulp.src('./dev/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('./prod/js'));
});

gulp.task('img', function() {
	return gulp.src('./dev/img/**', {since: gulp.lastRun('img')})
    .pipe(newer('./prod/img'))
		.pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
          plugins: [
              {removeViewBox: true},
              {cleanupIDs: false}
          ]
      })
		]))
		.pipe(gulp.dest('./prod/img'));
});

gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('html', 'fonts', 'css', 'js', 'img'))
);
