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
const sourcemap = require('gulp-sourcemap');
const iconfontCSS = require('gulp-iconfont-css');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();

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


const serve = done => {
	browserSync.init({
		server: "./dist",
		startPath: "./html"
	})
};

exports.build = parallel(templates);
exports.default = series(
	parallel(templates), serve
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
