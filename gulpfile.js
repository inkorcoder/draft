var PATH = '',
		OPTIONS = {
			serverHost: 'localhost',
			serverPort: 1111,
			serverLivereload: true,
			coffeeWraping: true,
			notices: true
		};

var gulp = require('gulp'),
		connect = require('gulp-connect'),
		coffee = require('gulp-coffee'),
		clean = require('gulp-clean'),
		sass = require('gulp-sass'),
		colors = require('colors'),
		fileinclude = require('gulp-include'),
		cssmin = require('gulp-cssmin'),
		rename = require('gulp-rename'),
		filelist = require('gulp-filelist'),
		using = require('gulp-using'),
		map = require('map-stream'),
		plumber = require('gulp-plumber'),
		autoprefixer = require('gulp-autoprefixer'),
		jsmin = require('gulp-jsmin'),
		newer = require('gulp-newer'),

		exec = require("child_process").exec;

var execute = function(command, callback){
	exec(command, function(error, stdout, stderr){
		if (callback){
			callback(stdout);
		}
	});
};

execute("notify-send 'Gulp.js' 'Система сборки успешно запущена.' -i dialog-apply");

var logSASS = function(err) {
	var mess = err.message.replace(/(\n|\r|Current dir:)/gim, '');
	if (OPTIONS.notices === true) {
		execute("notify-send 'SASS' '" + mess + "' -i dialog-no", function() {});
	}
	return console.log("\n\r"+
		colors.grey("[ ")+(colors.red('ERROR!'))+colors.grey(" ]")+" SASS\r\n"+
		(colors.red(mess))+"\r\n"
	);
};

var logCoffeeScript = function(err) {
	var mess = err.message.replace(/(\n|\r|Current dir:)/gim, '');
	if (OPTIONS.notices === true) {
		execute("notify-send 'Coffeescript' '" + err.message + "\r\n → " + (err.stack.substr(0, err.stack.indexOf('error:'))) + "'  -i dialog-no", function() {});
	}
	return console.log("\n\r"+
		colors.grey("[ ")+(colors.red('ERROR!'))+colors.grey(" ]")+" CoffeeScript\r\n"+
		colors.red(mess)+colors.red(err.stack)+"\n\r"
	);
};

gulp.task('SASS', function(){
	var src = gulp.src(PATH+'scss/*.scss');
	src
		.pipe(plumber({
			errorHandler: function(err){
				logSASS(err);
			}
		}))
		.pipe(sass())
		.pipe(autoprefixer({
			cascade: false,
			browsers: [
				'Chrome > 30', 'Firefox > 20', 'iOS > 5', 'Opera > 12',
				'Explorer > 8', 'Edge > 10']
		}))
		.pipe(gulp.dest(PATH+'css/full'))
		.pipe(cssmin())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(PATH+'css'))
		.pipe(connect.reload());
});

gulp.task('HTML-include', function(){
	var src = gulp.src(PATH+'html/*.html');
	src
		.pipe(plumber())
		.pipe(fileinclude())
		.pipe(gulp.dest(PATH))
		// .pipe(connect.reload());
});

gulp.task('Watch-task', function(){
	gulp.watch(PATH+'scss/**/*.scss', 					['SASS']);
	gulp.watch(PATH+'html/**/*html', 						['HTML-include']);
});

gulp.task('default', [
	'Watch-task',
	'SASS',
	'HTML-include'
]);