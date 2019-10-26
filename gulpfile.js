//Hi! If you use sass change var below

const styleSyntax = 'scss';
const fontName = 'iconFont'; // name of your iconfont

const { watch, src, series, dest, parallel } = require('gulp');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
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

sass.compiler = require('node-sass');


const supportedBrowsers = [
	'last 3 versions', // http://browserl.ist/?q=last+3+versions
	'ie >= 10', // http://browserl.ist/?q=ie+%3E%3D+10
	'edge >= 12', // http://browserl.ist/?q=edge+%3E%3D+12
	'firefox >= 29', // http://browserl.ist/?q=firefox+%3E%3D+28
	'chrome >= 23', // http://browserl.ist/?q=chrome+%3E%3D+21
	'safari >= 8', // http://browserl.ist/?q=safari+%3E%3D+6.1
	'opera >= 12.1', // http://browserl.ist/?q=opera+%3E%3D+12.1
	'ios >= 7', // http://browserl.ist/?q=ios+%3E%3D+7
	'android >= 4.4', // http://browserl.ist/?q=android+%3E%3D+4.4
	'blackberry >= 10', // http://browserl.ist/?q=blackberry+%3E%3D+10
	'operamobile >= 46', // http://browserl.ist/?q=operamobile+%3E%3D+12.1
	'samsung >= 4', // http://browserl.ist/?q=samsung+%3E%3D+4
];

const autoprefixerConfig = { browsers: supportedBrowsers, cascade: false };
const babelConfig = { targets: { browsers: supportedBrowsers } };

const exportPath = './dist/**/*';

const templates = () =>
	src("./app/templates/**/*.pug")
		.pipe(
			pug({
				pretty: true
			})
		)
		.pipe(dest("./dist/html"));


const styles = (mode) => (done) =>
	src('./app/assets/'+styleSyntax+'/styles.'+styleSyntax+'')
		.pipe(sourcemap.init())
		.pipe(sass())
		.pipe(autoprefixer())
		// .on("error", err => logs.error(err.toString()))
		.pipe(dest("./dist/assets/css"))
		.pipe(rename({ suffix: ".min" }))
		.pipe(cleanCss())
		.pipe(sourcemap.write("./"))
		.pipe(dest("./dist/assets/css"))
		.pipe(browserSync.stream());

const scriptsPacking = () =>
	src("./app/assets/js/**/*.js")
		.pipe(plumber())
		.pipe(gulpWebpack({
			mode: 'production',
			// devtool: 'source-map'
		}, webpack))
		.pipe(dest("./dist/assets/js/"))
		.pipe(browserSync.stream());

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
	watch(["./app/**/*.js", "./app/**/*.scss"], parallel(styles, scriptsPacking));
	watch("./app/templates/**/*.pug", series(templates, reload));
};

const fonts = () =>
	src("./app/assets/fonts/**/*").pipe(dest("./dist/assets/fonts"));

const images = () =>
	src("./app/assets/img/**/*").pipe(dest("./dist/assets/img"));

exports.fonts = parallel(iconFonts);


exports.default = series(
	parallel(templates, styles, fonts, images), serve, scriptsPacking, watchAssets
);



//TODO: webpack
//TODO: gulp-imagemin

//TODO: сделать билд с минификацией в отличии от дефолта/серва
