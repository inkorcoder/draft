var fs = require('fs');
var mm = require('musicmetadata');

require('./folders');

var folders = {};
var tempFolders = {};
var playlist = [];

// readDir('/mnt/media/Music/Drum and Bass/Low', true);

window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext(),
		audio = document.getElementById('audio');


var frequencies = [];
var filters;


var defaults = {
	currentTrack: {
		artist: '...',
		title: '...',
		src: ''
	}
}

String.prototype.parseTime = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return minutes+':'+seconds;
}
String.prototype.parseTimeFull = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

require('./filters');

var source = context.createMediaElementSource(audio);
var currentFolder = folders[Object.keys(folders)[0]];

var app = new Vue({
	el: '#app',
	data: {
		isMenuOpened: false,
		folders: folders,
		volume: 1,
		gain: 0,
		openedFolderModel: '/mnt/media/Music/Drum and Bass/Low',
		currentTime: 0,
		duration: 0,
		current: {
			folder: currentFolder,
			index: 0
		},
		currentTrack: defaults.currentTrack,
		equalizer: {

		}
	},
	methods: {
		openMenu: function(e){
			this.$data.isMenuOpened = true;
			console.log('isClosest')
		},
		closeMenu: function(e){
			if (!e.target.closest('.menu')){
				this.$data.isMenuOpened = false;
			}
		},
		showPopup: function(id){
			[].forEach.call(document.querySelector('.popup'), function(popup){
				popup.classList.remove('active');
			})
			document.getElementById(id).classList.add('active');
		},
		openFolder: function(path){
			console.log(path)
			readDir(path);
		},
		getCurrentTrack: function(){
			if (folders && folders[Object.keys(folders)[0].toString()] && folders[Object.keys(folders)[0].toString()].files[0]){
				return folders[Object.keys(folders)[0].toString()].files[0];
			} else {
				return defaults.currentTrack;
			}
		},
		playTrack: function(folder, index){
			document.querySelector('.progress .bar').style.width = '0%';
			this.$data.currentTrack = folders[folder].files[index];
			audio.src = this.$data.currentTrack.src;
			this.$data.currentTime = audio.currentTime;
			this.$data.duration = audio.duration;
			this.$data.current.folder = folder;
			this.$data.current.index = index;
			audio.play();
		},
		play: function(){
			if (audio.paused){
				audio.play();
				return;
			}
			audio.src = this.$data.currentTrack.src;
			audio.play();
		},
		pause: function(){
			audio.pause();
		},
		stop: function(){
			audio.pause();
			document.querySelector('.progress .bar').style.width = '0%';
			audio.currentTime = 0;
		},
		next: function(){
			this.$data.current.index++;
			this.playTrack(this.$data.current.folder, this.$data.current.index);
		},
		updateProgressBar: function(){
			var elapsedTime = Math.round(audio.currentTime);
			var fWidth = (elapsedTime / audio.duration) * 100;
			this.$data.currentTime = audio.currentTime;
			this.$data.duration = audio.duration;
			document.querySelector('.progress .bar').style.width = fWidth+'%';
			if (fWidth >= 99) {
				this.next();
			}
		},
		setTime: function(e){
			var rect = document.querySelector('.progress').getBoundingClientRect();
			var pos = e.clientX - rect.left;
			audio.currentTime = audio.duration * (pos / rect.width);
		},
		setVolume: function(e){
			this.$data.volume = (e.target.value / 100);
			audio.volume = Math.min(1, this.$data.volume - this.$data.gain);
		},
		setGain: function(e){
			this.$data.gain = e.target.value / 100;
			audio.volume = Math.min(1, this.$data.volume - this.$data.gain);
		}
	}
})
audio.addEventListener('timeupdate', app.updateProgressBar, false);
document.querySelector('.progress').addEventListener('click', app.setTime, false);


[].forEach.call(document.querySelectorAll('.table .eq-slider:not(#gain)'), function(range, i){
	frequencies.push({
		freq: parseInt(range.getAttribute('data-freq')),
		gain: 1
	});
	range.addEventListener('input', function(e){
		filters[i].gain.value = e.target.value * 10;
		console.log(filters[i].gain.value)
		// equalize(audio);
	});
})
// console.log(frequencies)
equalize(audio);

[].forEach.call(document.querySelectorAll('.popup'), function(popup){
	popup.addEventListener('click', function(e){
		if (!e.target.closest('.inner')){
			popup.classList.remove('active');
		}
	});
});