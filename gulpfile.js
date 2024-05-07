// ESM import statements
import gulp from 'gulp';
import csso from 'gulp-csso';
import uglify from 'gulp-uglify';
import concat from 'gulp-concat';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import plumber from 'gulp-plumber';
import cp from 'child_process';
import imagemin from 'gulp-imagemin';
import browserSync from 'browser-sync';

const sass = gulpSass(dartSass);
const bs = browserSync.create();

const jekyllCommand = (/^win/.test(process.platform)) ? 'jekyll.bat' : 'jekyll';

function jekyllBuild(done) {
  cp.spawn(jekyllCommand, ['build'], { stdio: 'inherit' })
    .on('close', done);
}

function jekyllRebuild(done) {
  bs.reload();
  done();
}

function syncBrowser(done) {
  bs.init({
    server: {
      baseDir: '_site'
    }
  });
  done();
}

function compileSass() {
  return gulp.src('src/styles/**/*.scss')
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(csso())
    .pipe(gulp.dest('assets/css/'));
}

function compileFonts() {
  return gulp.src('src/fonts/**/*.{ttf,woff,woff2,eot,svg}', {encoding: false})
    .pipe(plumber())
    .pipe(gulp.dest('assets/css/fonts/'));
}

function minifyImages() {
  return gulp.src('src/img/**/*.{jpg,png,gif,svg}', {encoding: false})
    .pipe(imagemin())
    .pipe(gulp.dest('assets/img/'));
}

function compileJS() {
  return gulp.src('src/js/**/*.js')
    .pipe(plumber())
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('assets/js/'));
}

function watchFiles() {
  gulp.watch('src/styles/**/*.scss', gulp.series(compileSass, jekyllRebuild));
  gulp.watch('src/js/**/*.js', gulp.series(compileJS, jekyllRebuild));
  gulp.watch('src/fonts/**/*.{ttf,woff,woff2,eot,svg}', gulp.series(compileFonts));
  gulp.watch('src/img/**/*.{jpg,png,gif,svg}', gulp.series(minifyImages));
  gulp.watch(['*html', '_includes/*html', '_layouts/*.html'], gulp.series(jekyllRebuild));
}

const defaultTask = gulp.series(compileJS, compileSass, compileFonts, minifyImages, jekyllBuild, syncBrowser, watchFiles);

export default defaultTask;
