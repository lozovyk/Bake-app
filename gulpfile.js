const { watch, src, series, dest, parallel } = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const logs = require('fancy-log');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const iconfont = require('gulp-iconfont');
const cleanCss = require('gulp-clean-css');
const sourcemap = require('gulp-sourcemaps');
const iconfontCSS = require('gulp-iconfont-css');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const sassVar = "scss"; // Change for sass if you use it

sass.compiler = require('node-sass');

const fontName = 'iconFont';


const templates = () =>
	src("./app/templates/**/*.pug")
		.pipe(
			pug({
				pretty: true
			})
		)
		.pipe(dest("./dist/html"));

const styles = () =>
	src("./app/assets/scss/styles.scss")
		.pipe(sourcemap.init())
		.pipe(sass())
		.pipe(autoprefixer())
		//log
		.pipe(dest("./dist/assets/css"))
		.pipe(rename({suffix: ".min"}))
		.pipe(cleanCss())
		.pipe(sourcemap.write("./"))
		.pipe(dest("./dist/assets/css"))
		.pipe(browserSync.stream());

const scripts = () =>
	src([
		"./app/assets/js/index.js",
		"./app/assets/js/components/**/*.js",
		"./app/assets/js/libs/**/*.js"
	])
		.pipe(sourcemap.init())
		.pipe(concat("index.js"))
		.pipe(babel())
		.pipe(dest("./dist/assets/js"))
		.pipe(uglify())
		.pipe(rename({suffix: ".min"}))
		.pipe(sourcemap.write("./"))
		.pipe(dest("./dist/assets/js"))
		.pipe(browserSync.stream());


const serve = done => {
	browserSync.init({
		server: "./dist",
		startPath: "./html"
	});
	done();
};

// exports.iconfont = iconfonts;
exports.build = parallel(templates, styles, scripts);
exports.default = series(
	parallel(templates, styles,scripts), serve
);





//TODO: babel
//TODO: uglify
//TODO: clean-css
//TODO: webpack
//TODO: fancy-log
//TODO: node-sass
//TODO: rename
//TODO: concat
//TODO: autoprefixer
//TODO: Sourcemap
//TODO: browser-sync
//TODO: iconfont, css
