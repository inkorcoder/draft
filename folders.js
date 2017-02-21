window.getFolder = function(path){
	var _folders = path.split('/');
	return _folders[_folders.length-2];
}

function parseTime(time) {
    var sec_num = time; // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return minutes+':'+seconds;
}

window.parseArtist = function(path){
	var _folders = path.split('/');
	var file = _folders[_folders.length-1];
	return (file.match(/\-/gim) ? file.split('-')[0] : 'no artist');
}

window.parseTitle = function(path){
	var _folders = path.split('/');
	var file = _folders[_folders.length-1];
	return (file.match(/\-/gim) ? file.split('-')[1].replace(/\.(mp3|mp4|ogg)/gim, '') : 'no title');
}


window.walk = function(dir, cb) {
		var results = []
		var list = fs.readdirSync(dir)
		var isFinal = true;
		list.forEach(function(file, i) {
				file = dir + '/' + file
				var stat = fs.statSync(file)
				if (stat && stat.isDirectory()) {
					isFinal = false;
					results = results.concat(walk(file, cb))
				} else {
					if (file.indexOf('.mp3')>=0){
						results.push(file);
						isFinal = true;
						if (!folders[getFolder(file)]){
							folders[getFolder(file)] = {
								name: getFolder(file),
								files: []
							};
						}
						if (!tempFolders[getFolder(file)]){
							tempFolders[getFolder(file)] = {
								name: getFolder(file),
								files: []
							};
						}
						mm(fs.createReadStream(file), function (err, metadata) {
							var base64data = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
							if (metadata.picture && metadata.picture[0] && metadata.picture[0].data){
								base64data = 'data:image/'+metadata.picture[0].format+';base64,'+metadata.picture[0].data.toString('base64')
							}

							folders[getFolder(file)].files.push({
								artist: metadata.artist[0],
								title: metadata.title,
								src: file,
								image: base64data,
								time: metadata.duration,
								size: stat["size"]
							})

							tempFolders[getFolder(file)].files.push({
								artist: metadata.artist[0],
								title: metadata.title,
								src: file,
								image: base64data,
								time: metadata.duration,
								size: stat["size"]
							})
							if (cb && i == list.length-1){
								cb(results, tempFolders);
							}

						});
					}
				}
		})
		return results;
}
// id3({ file: file, type: id3.OPEN_LOCAL }, function(err, tags) {
// 	folders[getFolder(file)].files.push({
// 		artist: tags.v2.artist || tags.v1.artist || parseArtist(file),
// 		title: tags.v2.title || tags.v1.title || parseTitle(file),
// 		src: file,
// 	})
// 	if (i == 0)
// 		console.log(String.fromCharCode.apply(null, new Uint16Array(new DataView(tags.v2.image.data))))
// 	tempFolders[getFolder(file)].files.push({
// 		artist: tags.v2.artist || tags.v1.artist || parseArtist(file),
// 		title: tags.v2.title || tags.v1.title || parseTitle(file),
// 		src: file,
// 	})
// 	if (cb && i == list.length-1){
// 		cb(results, tempFolders);
// 	}
// });

function getUserHome() {
	return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

window.readDir = function(path, isInit){
	if (isInit){
		try {
			folders = JSON.parse(fs.readFileSync('folders.json'));
			console.log('folders is exists')
		} catch(e) {
			walk(path, function(res, _folders){
				fs.writeFile('folders.json', JSON.stringify(_folders), function(){
					console.log('saved new folders')
				})
			})
		}
	} else {
		walk(path, function(res, _folders){
			fs.writeFile('folders.json', JSON.stringify(_folders), function(){
				console.log('saved new folders')
			})
		})
	}
};