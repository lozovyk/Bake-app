//Hi! If you use sass change var below

const styleSyntax = 'scss';
const fontName = 'iconFont'; // name of your iconfont

const gulp = require('gulp');
const pump = require('pump');
const del = require('del');
const gulpPug = require('gulp-pug');
const gulpSass = require('gulp-sass');
const gulpZip = require('gulp-zip');


// const logs = require('fancy-log');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
// const uglify = require('gulp-uglify');
const plumber = require("gulp-plumber");
const gulpWebpack = require('webpack-stream');
const webpack = require('webpack');
const iconfont = require('gulp-iconfont');
const cleanCss = require('gulp-clean-css');
const sourcemap = require('gulp-sourcemaps');
const iconfontCss = require('gulp-iconfont-css');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();

gulpSass.compiler = require('node-sass');


// const suppBrowsers = (option) => {
// 	return (option === 'light') ? ['>= 3%'] : supportedBrowsers;
// };
//
//// http://browserl.ist/
// const supportedBrowsers = [
// 	'last 3 versions',
// 	'ie >= 10',
// 	'edge >= 12',
// 	'firefox >= 29',
// 	'chrome >= 23',
// 	'safari >= 8',
// 	'opera >= 12.1',
// 	'ios >= 7',
// 	'android >= 4.4',
// 	'blackberry >= 10',
// 	'operamobile >= 46',
// 	'samsung >= 4',
// ];

const autoprefixerConfig = { browsers: supportedBrowsers, cascade: false };
const babelConfig = { targets: { browsers: supportedBrowsers } };

// Entry point retreive from webpack
const entry = require('./app/webpack/entry');

// Transform Entry point into an Array for defining in gulp file
const entryArray = Object.values(entry);

const exportPath = './dist/**/*';

const srcPath = (file, watch = false) => {
	if (file === 'scss' && watch === false) return './app/assets/assets/scss/styles.scss';
	if (file === 'scss' && watch === true) return './app/assets/scss/**/*.scss';
	if (file === 'js' && watch === false) return entryArray;
	if (file === 'js' && watch === true) return './app/assets/js/**/*.js';
	if (file === 'pug') return './app/templates/**/*.pug';
	if (file === 'img') return './app/assets/img/**/*.{png,jpeg,jpg,svg,gif}';
	console.error('Unsupported file type entered into Gulp-Builder for Source Path');
};

const distPath = (file, serve = false) => {
	if (['css', 'js', 'img'].includes(file)) return `./dist/${file}`;
	if (file === 'pug' && serve === false) return './dist/**/*.html';
	if (file === 'pug' && serve === true) return './dist';
	console.error('Unsupported file type entered into Gulp-Builder for Dist Path');
};

const buildHTML = (mode) => (done) => {
	['development', 'production'].includes(mode) ? pump([
		gulp.src(srcPath('pug')),
				...((mode === 'production') ? [gulpPug({ pretty: true })] : []),
		gulp.dest(distPath('pug', true)),
	], done) : undefined;
};




const cleanHTML = (mode) => () => {
	return ['development', 'production'].includes(mode) ? del([distPath('html')]) : undefined;
};

const cleanExport = (mode) => () => {
	return ['development', 'production'].includes(mode) ? del(['./website.zip']) : undefined;
};









const genericTask = (mode, context = 'building') => {
	let port;
	let modeName;

	if (mode === 'development') {
		port = '3000';
		modeName = 'Development';
	} else if (mode === 'production') {
		port = '8000';
		modeName = './Production';
	} else {
		port = undefined;
		modeName = undefined;
	}

	const allBootingTasks = [
		Object.assign(buildHTML(mode), { displayName: `Booting Markup Task: Build - ${modeName}` }),
	];

	const browserLoadingWatching = (done) => {
		browserSync.init({ port, server: distPath('pug', true) });

		gulp.watch(srcPath('pug'), true)
			.on('all', gulp.series(
				Object.assign(buildHTML(mode), { displayName: `Watching Markup Task: Build - ${modeName}` }),
			), browserSync.reload);
		done();
	};

	const exportingZip = (done) => {
		pump([
			gulp.src(exportPath),
			gulpZip('./website.zip'),
			gulp.dest('./'),
		], done);
	};

	if (context === 'building') {
		return [
			...allBootingTasks,
			Object.assign(browserLoadingWatching, { displayName: `Browser Loading & Watching Task - ${modeName}` }),
		];
	}

	if (context === 'exporting') {
		return [
			cleanExport(mode),
			...allBootingTasks,
			Object.assign(exportingZip, { displayName: `Exporting Zip Task - ${modeName}` }),
		];
	}

	return undefined;
};

	gulp.task('default', gulp.series(...genericTask('production', 'building')));


