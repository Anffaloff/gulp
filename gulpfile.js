const { src, dest, watch, parallel, series }  = require('gulp');

let project_folder = "dist";
let source_folder = "#src";

let path = {
  build: {
      html: project_folder + "/",
      css: project_folder + "/css/",
      js: project_folder + "/js/",
      img: project_folder + "/img/",
      fonts: project_folder + "/fonts/",
  },
  src: {
      html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
      css: source_folder + "/scss/style.scss",
      js: source_folder + "/js/script.js",
      img: source_folder + "/img/**/*.{jpg, png, svg, gif, ico, webp}",
      fonts: source_folder + "/fonts/*.ttf",
  },
  watch: {
      html: source_folder + "/**/*.html",
      css: source_folder + "/scss/**/*.scss",
      js: source_folder + "/js/**/*.js",
      img: source_folder + "/img/**/*.{jpg, png, svg, gif, ico, webp}",
  },
  clean: "./" + project_folder + "/"
}

const scss          = require('gulp-sass');
const concat        = require('gulp-concat');
const browserSync   = require('browser-sync').create();
const uglify        = require('gulp-uglify-es').default;
const autoprefixer  = require('gulp-autoprefixer');
const imagemin      = require('gulp-imagemin');
const del           = require('del');

function clean() {
  return del(path.clean)
}

function browsersync() {
  browserSync.init({
    server : {
      baseDir: source_folder
    }
  });
}

function images() {
  return src(path.src.img)
    .pipe(imagemin(
      [
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 75, progressive: true }),
        imagemin.optipng({ optimizationLevel: 5 }),
        imagemin.svgo({
          plugins: [
            { removeViewBox: true },
            { cleanupIDs: false }
          ]
        })
      ]
    ))
    .pipe(dest(path.build.img))
}

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    '#src/js/main.js'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('#src/js'))
    .pipe(browserSync.stream())
}


function styles() {
  return src('#src/scss/style.scss')
      .pipe(scss({outputStyle: 'compressed'}))
      .pipe(concat('style.min.css'))
      .pipe(autoprefixer({
        overrideBrowserslist: ['last 10 version'],
        grid: true
      }))
      .pipe(dest('#src/css'))
      .pipe(browserSync.stream())
}

function build() {
  return src([
    '#src/css/style.min.css',
    '#src/fonts/**/*',
    '#src/js/main.min.js',
    '#src/*.html'
  ], {base: '#src'})
    .pipe(dest('dist'))
}

function watching() {
  watch(['#src/scss/**/*.scss'], styles);
  watch(['#src/js/**/*.js', '!#src/js/main.min.js'], scripts);
  watch(['#src/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.clean = clean;


exports.build = series(clean, images, build);
exports.default = parallel(styles ,scripts ,browsersync, watching);


