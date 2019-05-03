/* eslint-disable no-undef */
'use strict';

const gulp = require(`gulp`);
const sass = require(`gulp-sass`);
const plumber = require(`gulp-plumber`);
const postcss = require(`gulp-postcss`);
const sourcemap = require(`gulp-sourcemaps`);
const posthtml = require(`gulp-posthtml`);
const autoprefixer = require(`autoprefixer`);
const htmlmin = require(`gulp-htmlmin`);
const minify = require(`gulp-csso`);
const rename = require(`gulp-rename`);
const imagemin = require(`gulp-imagemin`);
const include = require(`posthtml-include`);
const del = require(`del`);
const uglify = require(`gulp-uglify`);
const server = require(`browser-sync`).create();

gulp.task(`style`, () =>
  gulp.src(`source/sass/style.scss`)
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(minify())
    .pipe(rename(`style.min.css`))
    .pipe(gulp.dest(`docs/css`))
    .pipe(rename(`style.css`))
    .pipe(sourcemap.write(`.`))
    .pipe(gulp.dest(`docs/css`))
    .pipe(server.stream())
);

gulp.task(`gulp-uglify`, () =>
  gulp.src(`source/js/script.js`)
    .pipe(uglify())
    .pipe(rename(`script.min.js`))
    .pipe(gulp.dest(`docs/js`))
);

gulp.task(`images`, () =>
  gulp.src([`source/img/**/*.{png,jpg,svg}`, `!source/img/sprite.svg`])
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest(`docs/img`))
);

gulp.task(`html`, () =>
  gulp.src(`source/*html`)
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest(`docs`))
);

gulp.task(`minify`, () =>
  gulp.src(`source/*.html`)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(`docs`))
);

gulp.task(`serve`, () => {
  server.init({
    server: `docs/`,
    notify: false,
    open: false,
    cors: true,
    ui: false
  });

  gulp.watch(`source/sass/**/*.{scss,sass}`, gulp.series(`style`));
  gulp.watch(`source/*.html`, gulp.series(`html`));
  gulp.watch(`source/*.html`).on(`change`, server.reload);
});

gulp.task(`copy`, () =>
  gulp.src([
    `source/fonts/**/*.{woff,woff2}`,
    `source/img/**`,
    `source/js/**`
  ], {
    base: `source`
  })
    .pipe(gulp.dest(`docs`))
);

gulp.task(`clean`, () => del(`docs`));

gulp.task(`build`, gulp.series(`clean`, `copy`, `style`, `gulp-uglify`, `images`, `html`));
