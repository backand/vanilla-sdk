import gulp from 'gulp'
import clean from 'gulp-clean'
import browserify from 'browserify'
import source from 'vinyl-source-stream'
import gutil from 'gulp-util'
import babelify from 'babelify'
import buffer from 'vinyl-buffer'
import uglify from 'gulp-uglify'
import sourcemaps from 'gulp-sourcemaps'
import rename from 'gulp-rename'
import header from 'gulp-header'
import shell from 'gulp-shell'

const paths = {
    src:  { js: './src/index.js' },
    dest: { js: './dist' }
};
const pkg = require('./package.json');
const banner = ['/*********************************************************',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @copyright Copyright (c) 2017 <%= pkg.author %> https://www.backand.com/',
  ' * @license <%= pkg.license %> (http://www.opensource.org/licenses/mit-license.php)',
  ' * @Compiled At: ' + new Date().toLocaleDateString(),
  '  *********************************************************/',
  ''].join('\n');

gulp.task('clean', function () {
  return gulp.src(paths.dest.js)
    .pipe(clean({force: true}));
});

gulp.task('ts', ['clean'], ()=> {
  return gulp.src('./src/index.d.ts')
    .pipe(rename('backand.d.ts'))
    .pipe(gulp.dest(paths.dest.js))
});

gulp.task('build', ['ts'], ()=> {
  return browserify({ entries: paths.src.js, standalone: 'backand', debug: false })
  	.transform("babelify")
    .bundle()
    .pipe(source('backand.js'))
    .pipe(buffer())
    .pipe(header(banner, { pkg : pkg } ))
    .pipe(gulp.dest(paths.dest.js))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename('backand.min.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.dest.js))
});

gulp.task('watch', ()=> {
  gulp.watch('./src/**/*', ['build']);
});

gulp.task('default', ['build']);
