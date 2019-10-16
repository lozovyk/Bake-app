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
const iconfontCss = require('gulp-iconfont-css');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const sassVar = "scss"; // Change for sass if you use it

sass.compiler = require('node-sass');

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




const fontName = 'iconFont';

const iconFonts = () =>
	src("./app/assets/img/icons/iconfont/**/*.svg")
		.pipe(iconfontCss({
			fontName: fontName,
			path: './app/assets/scss/base/mixins/_iconfont.scss',
			targetPath: './../../assets/scss/common/_icons.scss',
			fontPath: './../fonts/'
		})
		)
		.pipe(
			iconfont({
				fontName: fontName,
				prependUnicode: true,
				formats: ["ttf", "eot", "woff", "woff2", "svg"],
				normalize: true,
				fontWeight: "300",
				fontHeight: 100,
				fixedWidth: false,
				centerHorizontally: false
			})
		)
		.pipe(dest("./app/assets/fonts/"));

const serve = done => {
	browserSync.init({
		server: "./dist",
		startPath: "./html"
	});
	done();
};

const reload = done =>{
	browserSync.reload();
	done();
};

const watchAssets = () => {
	watch(["./app/**/*.js", "./app/**/*.scss"], parallel(styles, scripts));
	watch("./app/templates/**/*.pug", series(templates, reload));
};

const fonts = () =>
	src("./app/assets/fonts/**/*").pipe(dest("./dist/assets/fonts"));

const images = () =>
	src("./app/assets/img/**/*").pipe(dest("./dist/assets/img"));


exports.build = parallel(templates, styles, scripts, fonts, images);

exports.fonts = parallel(iconFonts);

exports.default = series(
	parallel(templates, styles, scripts, fonts, images), serve, watchAssets
);




//TODO: iconfont, css
//TODO: webpack
//TODO: gulp-imagemin

//TODO: сделать билд с минификацией в отличии от дефолта/серва
