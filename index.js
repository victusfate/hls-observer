var fs = require('fs')
	, util = require('util')
	, events = require('events')
	, request = require('request')
	, validUrl = require('valid-url')
	, chokidar = require('chokidar')

var log = console.log.bind(console);


function Watcher(file, interval){
	if (isNaN(interval)) {
		this.__interval = 2000;
	}else{
		this.__interval = interval;
	};
	this.file = file;
	this.previousSize = 0;
}

util.inherits(Watcher, events.EventEmitter);

//previous and current size of the file being watched
Watcher.prototype.__read = function(psize, csize) {
	var self = this;
	var offset = psize;
	var length = csize - psize;
	var buffer = new Buffer(length);
	var filesArray = new Array();

	function readDescriptor(fd) {
		fs.read(fd,buffer,0,offset,length,function(err, bytesRead, buffer){
			if (err) throw err;
			var string = buffer.toString();
			var lines = string.split('\n');
			for (var line in lines) {
				var regExp = new RegExp("^[^#].+\.ts$",'i');
				if(regExp.test(lines[line])){
					filesArray.push(lines[line]);
				}
			};

			// update previous file size
			this.previousSize = csize;

			//Close file descriptor after read its content
			fs.closeSync(fd);
			self.emit("change",filesArray);

		}.bind(this));		
	}.bind(this)
	
	function reader() {
		if validUrl(self.file) {
			request(self.file).pipe(fs.open, 'r', function(err, fd) {
				if (err) throw err;
				readDescriptor(fd);
			}.bind(this)
		}
		else {
			fs.open(self.file, 'r', function(err, fd){
				if (err) throw err;
				readDescriptor(fd);			
			}.bind(this));
		}		
	}
}.bind(this)

Watcher.prototype.listenFile = function() {
	//curr, prev: fs.Stat Objects with inode info.
	this.watcher = chokidar.watch(this.file, {
		//  It is typically necessary to set this to true to successfully watch files over a network,
		usePolling : true,
		persistent : true
	});

	this.watcher.on('change', function(path, stats) {
		if (stats && stats.size !== this.previousSize) {
			this.__read(this.previousSize, stats.size);
		}
	}.bind(this);
}.bind(this);

Watcher.prototype.stop = function(){
	this.watcher.unwatch(this.file,"utf8");
}.bind(this);

module.exports = Watcher;
