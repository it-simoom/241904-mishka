"use strict";

var gulp = require("gulp");
var less = require("gulp-less");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();

var condense = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");

var cln = require("del");

var run = require("run-sequence");

gulp.task( "style", function(){
  gulp.src("less/style.less")
  .pipe( plumber() )
  .pipe( less() )
  .pipe( postcss([
    autoprefixer()
  ]))
  .pipe( gulp.dest("build/css") )
  .pipe( condense() )
  .pipe( rename("style.min.css"))
  .pipe( gulp.dest("build/css") )

  .pipe( server.stream() );
})

gulp.task( "serve", function(){  /* "serve", ["style"] */
  server.init({
    server: "build/",
    notify: false,
    open: true,
    corse: true,
    ui: false
  });

  gulp.watch("less/**/*.less", ["style"]);
  gulp.watch("*.html", ["html"]); /* .on(change, server.reload) */
})

gulp.task("images", function(){
  return gulp.src("img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("img"));
})

gulp.task("webp", function(){
  gulp.src("img/**/*.{png,jpg}")
  .pipe( webp({quality: 90}) )
  .pipe( gulp.dest("img") );
});

gulp.task("sprite", function(){
  return gulp.src("img/**/*.svg")
  .pipe( svgstore({
    inlineSvg: true
  }))
  .pipe(rename("sprite.svg"))
  .pipe( gulp.dest("build/img"));
})

gulp.task("html", function(){
  return gulp.src("*.html")
  .pipe( posthtml([
    include()
  ]) )
  .pipe(gulp.dest("build"));
})

gulp.task("copy", function(){
  return gulp.src(
    [
    "fonts/**/*.{woff,woff2}",
    "img/**",
    "js/**"
    ],
      { base: "." }
  )
  .pipe( gulp.dest("build") );
})

gulp.task("clean", function(){
  return cln("build")
})


  gulp.task("build", function(done){
    run(
      "clean",
      "copy",
      "style",
      "sprite",
      "html",
      done
    );
  })
