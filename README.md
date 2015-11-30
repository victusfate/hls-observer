hls-observer
===============

A network capable version of <a href="http://github.com/marc-ferrer/node-hlswatcher">node-hlswatcher</a> on which it is based. Each time the module have detects a change on the m3u8 file it triggers an event.

The module is specially useful if you need to transcode a live video and send it to
a CDN.

## Install ##################################################################

Easiest install is via npm:

    $ npm install hls-observer


## Usage ####################################################################

Require

	var HttpObserver = require('hls-observer');

After the require the first step is to create an object that represents your http observer.
the constructor requires a path to the m3u8 file you want to watch over.
A second parameter can be used to set the polling interval (in ms) used for checking the file,
if not provided or not a number the default value (2000) is used.

	var o1 = new HttpObserver('http://PATH/to/stream.m3u8');

or

	var o1 = new Watcher('PATH/to/file.m3u8',1000);

Once you have the object you need to call the method listenFile()

	o1.listenFile();

When the module detects a change on the file it triggers an event "change" and returns
an array containing the names of the ts files that have been created since the last time.
Note that just the last created files are send, not all the ts files including the last ones,
if you need to remember all of them you should store them in your own program.

	o1.on("change", function(data){
		//do things with ts files stored on data.
	});

//Remember to stop the listener at the end.

	w1.stop();
