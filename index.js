var fs 				= require('fs');
var util 			= require('util');
var events 		= require('events');
var request 	= require('request');
var validUrl 	= require('valid-url');
var urlParser = require('url');

var log = console.log.bind(console);


function HttpWatcher(url, interval){
	if (!validUrl.isUri(url)) {
		throw Error("supports network file watching only");
		return;
	}

	if (isNaN(interval)) {
		this.__interval = 2000;
	}
	else{
		this.__interval = interval;
	}
	this.url = url;
	log('set this.url',this.url);
	this.previousSize = 0;
	this.previousEtag = '';
	this.intervalID = null;
}

util.inherits(HttpWatcher, events.EventEmitter);

//previous and current size of the file being watched
HttpWatcher.prototype.__read = function(psize, csize) {
	var position = psize;
	var length = csize - psize;
	var buffer = new Buffer(length);
	var filesArray = new Array();

	var readDescriptor = function(fd) {
		log("inside readDescriptor");
		fs.read(fd,buffer,0,length,position,function(err, bytesRead, buffer){
			if (err) throw err;
			var string = buffer.toString();
			var lines = string.split('\n');
			for (var iline in lines) {
				var line = lines[iline];
				var regExp = new RegExp("^[^#].+\.ts$",'i');
				if(regExp.test(line)) {
					filesArray.push(line);
				}
			}

			// update previous file size
			this.previousSize = csize;

			//Close file descriptor after read its content
			fs.closeSync(fd);
			this.emit("change",filesArray);

		}.bind(this));		
	}.bind(this);
	
	request(this.url).pipe(fs.open, 'r', function(err, fd) {
		if (err) throw err;
		log("valid Url is true, inside request with path")
		readDescriptor(fd);
	}.bind(this));

}

HttpWatcher.prototype.listenFile = function() {
	log('inside listenFile url?',this.url);
	//curr, prev: fs.Stat Objects with inode info.
	this.intervalID = setInterval(function(){
		// var urlObj = urlParser.parse(this.url);
		// var options = { method: 'HEAD', host: urlObj.hostname, port: urlObj.port, path: urlObj.path };
		// var req = http.request(options, function(res) {
		// var options = { url: this.url, method: 'HEAD'};
		// request(options, function(err,res,body) {
		// request({ url: this.url, method: 'HEAD'}, function(err,res,body) {
		request.head(this.url, function(err,res,body) {
			var etag = res.headers['etag'];
			if (etag !== this.previousEtag) {
				this.previousEtag = etag; 
				log({ err: err, etagChanged: true}); 
			}
			log({ err: err, res: res, length: res.headers['content-length'], body: body}); // JSON.stringify(res.headers));
	  });
	}.bind(this), this.__interval);

	// this.watcher.on('all', function(event, path, stats) {
	// 	log({ message: "watcher all event happened", event:event, path:path, stats: stats});
	// 	if (stats && stats.size !== this.previousSize) {
	// 		this.__read(this.previousSize, stats.size);
	// 	}
	// }.bind(this));
}

HttpWatcher.prototype.stop = function(){
	if (this.intervalID) {
		clearInterval(this.intervalID);
	}
}

module.exports = HttpWatcher;
