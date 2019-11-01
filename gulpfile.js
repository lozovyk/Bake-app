const gulp = require('gulp');
const pump = require('pump');
const del = require('del');
const vinylNamed = require('vinyl-named');
const gulpPug = require('gulp-pug');
const gulpSass = require('gulp-sass');
const gulpZip = require('gulp-zip');
const gulpImagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const gulpSourcemaps = require('gulp-sourcemaps');
const gulpPostcss = require('gulp-postcss');
const gulpBabel = require('gulp-babel');
const webpackStream = require('webpack-stream');
const through2 = require('through2');
const gulpUglify = require('gulp-uglify');
const webpack = require('webpack');
const autoprefixer = require('gulp-autoprefixer');
const postcssUncss = require('postcss-uncss');
const browserSync = require('browser-sync').create();

gulpSass.compiler = require('node-sass');

//CSS and JS Supported

const supportedBrowsersBigList = [
	'last 3 versions',
	'ie >= 10',
	'edge >= 12',
	'firefox >= 29',
	'chrome >= 23',
	'safari >= 8',
	'opera >= 12.1',
	'ios >= 7',
	'android >= 4.4',
	'blackberry >= 10',
	'operamobile >= 46',
	'samsung >= 4',
];

const suppBrowsers = (mode) => {
	return ['development', 'production'].includes(mode) ? ['>= 3%'] : supportedBrowsersBigList;
};

const autoprefixerConfig = {browsers: suppBrowsers(), cascade: false};
const babelConfig = {targets: {browsers: suppBrowsers}};

// Entry point retreive from webpack
const entry = require('./app/webpack/entry');

// Transform Entry point into an Array for defining in gulp file
const entryArray = Object.values(entry);

const exportPath = './dist/';

const srcPath = (file, watch = false) => {
	if (file === 'scss' && watch === false) return './app/assets/scss/styles.scss';
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

// BUILDING TASKS

// Build HTML Tasks

const buildHTML = (mode) => (done) => {
	['development', 'production'].includes(mode) ? pump([
		gulp.src(srcPath('pug')),
		...((mode === 'production') ? [gulpPug({pretty: true})] : []),
		gulp.dest(distPath('pug', true)),
	], done) : undefined;
};

// Build Images Task
const buildImages = (mode) => (done) => {
	['development', 'production'].includes(mode) ? pump([
		gulp.src(srcPath('img')),
		gulpImagemin([
			gulpImagemin.gifsicle(),
			gulpImagemin.jpegtran(),
			gulpImagemin.optipng(),
			gulpImagemin.svgo(),
			imageminPngquant(),
			imageminJpegRecompress(),
		]),
		gulp.dest(distPath('img')),
		browserSync.stream(),
	], done) : undefined;
};

// Build Styles Task
const buildStyles = (mode) => (done) => {
	let outputStyle;
	if (mode === 'development') outputStyle = 'nested';
	else if (mode === 'production') outputStyle = 'compressed';
	else outputStyle = undefined;

	// const postcssPlugins = [
	// 	autoprefixer(autoprefixerConfig),
	// 	postcssUncss({html: [distPath('pug')]}),
	// ];

	['development', 'production'].includes(mode) ? pump([
		gulp.src(srcPath('scss')),
		gulpSourcemaps.init({loadMaps: true}),
		gulpSass({outputStyle}),
		// gulpPostcss(postcssPlugins),
		gulpSourcemaps.write('./'),
		gulp.dest(distPath('css')),
		browserSync.stream(),
	], done) : undefined;
};

// Build Scripts Task
const buildScripts = (mode) => (done) => {
	let streamMode;
	if (mode === 'development') streamMode = require('./app/webpack/config.development.js');
	else if (mode === 'production') streamMode = require('./app/webpack/config.production.js');
	else streamMode = undefined;

	['development', 'production'].includes(mode) ? pump([
		gulp.src(srcPath('js'), { allowEmpty: true }),
		vinylNamed(),
		webpackStream(streamMode, webpack),
		gulpSourcemaps.init({loadMaps: true}),
		through2.obj(function (file, enc, cb) {
			const isSourceMap = /\.map$/.test(file.path);
			if (!isSourceMap) this.push(file);
			cb();
		}),
		gulpBabel({presets: [['env', babelConfig]]}),
		...((mode === 'production') ? [gulpUglify()] : []),
		gulpSourcemaps.write('./'),
		gulp.dest(distPath('js')),
		browserSync.stream(),
	], done) : undefined;
};

// Clean HTML Task
const cleanHTML = (mode) => () => {
	return ['development', 'production'].includes(mode) ? del([distPath('pug')]) : undefined;
};

// Clean Images Task
const cleanImages = (mode) => () => {
	return ['development', 'production'].includes(mode) ? del([distPath('img')]) : undefined;
};

// Clean Styles Task
const cleanStyles = (mode) => () => {
	return ['development', 'production'].includes(mode) ? del([distPath('css')]) : undefined;
};

// Clean Scripts Task
const cleanScripts = (mode) => () => {
	return ['development', 'production'].includes(mode) ? del([distPath('js')]) : undefined;
};

// Clean the zip file
const cleanExport = (mode) => () => {
	return ['development', 'production'].includes(mode) ? del(['./website.zip']) : undefined;
};

/**
 * Generic Task for all Main Gulp Build/Export Tasks
 */

// Generic Task
const genericTask = (mode, context = 'building') => {
	let port;
	let modeName;

	if (mode === 'development') {
		port = '3000';
		modeName = 'Development';
	} else if (mode === 'production') {
		port = '8080';
		modeName = 'Production';
	} else {
		port = undefined;
		modeName = undefined;
	}

	// Combine all booting tasks into one array!
	const allBootingTasks = [
		Object.assign(cleanHTML(mode), {displayName: `Booting HTML Task: Clean - ${modeName}`}),
		Object.assign(buildHTML(mode), {displayName: `Booting HTML Task: Build - ${modeName}`}),
		Object.assign(cleanImages(mode), {displayName: `Booting Images Task: Clean - ${modeName}`}),
		Object.assign(buildImages(mode), {displayName: `Booting Images Task: Build - ${modeName}`}),
		Object.assign(cleanStyles(mode), {displayName: `Booting Styles Task: Clean - ${modeName}`}),
		Object.assign(buildStyles(mode), {displayName: `Booting Styles Task: Build - ${modeName}`}),
		Object.assign(cleanScripts(mode), {displayName: `Booting Scripts Task: Clean - ${modeName}`}),
		Object.assign(buildScripts(mode), {displayName: `Booting Scripts Task: Build - ${modeName}`}),
	];

	// Browser Loading & Watching
	const browserLoadingWatching = (done) => {
		browserSync.init({port, server: distPath('pug', true)});

		// Watch - PUG
		gulp.watch(srcPath('pug'), true)
			.on('all', gulp.series(
				// Object.assign(cleanHTML(mode), { displayName: `Watching Markup Task: Clean - ${modeName}` }),
				Object.assign(buildHTML(mode), {displayName: `Watching HTML Task: Build - ${modeName}`}),
			), browserSync.reload);
		done();

		// Watch - Images
		gulp.watch(srcPath('img', true))
			.on('all', gulp.series(
				Object.assign(cleanImages(mode), {displayName: `Watching Images Task: Clean - ${modeName}`}),
				Object.assign(buildImages(mode), {displayName: `Watching Images Task: Build - ${modeName}`}),
			), browserSync.reload);

		// Watch - Styles
		gulp.watch(srcPath('scss', true))
			.on('all', gulp.series(
				Object.assign(cleanStyles(mode), {displayName: `Watching Styles Task: Clean - ${modeName}`}),
				Object.assign(buildStyles(mode), {displayName: `Watching Styles Task: Build - ${modeName}`}),
			), browserSync.reload);

		// Watch - Scripts
		gulp.watch(srcPath('js', true))
			.on('all', gulp.series(
				Object.assign(cleanScripts(mode), {displayName: `Watching Scripts Task: Clean - ${modeName}`}),
				Object.assign(buildScripts(mode), {displayName: `Watching Scripts Task: Build - ${modeName}`}),
			), browserSync.reload);
	};

	// Exporting Zip
	const exportingZip = (done) => {
		pump([
			gulp.src(exportPath),
			gulpZip('./website.zip'),
			gulp.dest('./'),
		], done);
	};

	// Returning Tasks based on Building Context
	if (context === 'building') {
		return [
			...allBootingTasks,
			Object.assign(browserLoadingWatching, {displayName: `Browser Loading & Watching Task - ${modeName}`}),
		];
	}

	// Returning Tasks based on Exporting Context
	if (context === 'exporting') {
		return [
			cleanExport(mode),
			...allBootingTasks,
			Object.assign(exportingZip, {displayName: `Exporting Zip Task - ${modeName}`}),
		];
	}

	// No Side-Effects Please
	return undefined;
};


// Dev (`npm run dev` or `yarn run dev`) => Development
gulp.task('default', gulp.series(...genericTask('development', 'building')));

// Default (`npm start` or `yarn start`) => Production
gulp.task('prod', gulp.series(...genericTask('production', 'building')));

// Export (`npm run export` or `yarn run export`)
gulp.task('export', gulp.series(...genericTask('production', 'exporting')));



