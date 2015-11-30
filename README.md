hls-observer
===============

A network capable version of <a href="http://github.com/marc-ferrer/node-hlswatcher">node-hlswatcher</a> on which it is based. Each time the module detects a change on an m3u8 url it triggers an event.

The module is useful if you need send live HLS manifests to a CDN.


## Usage ####################################################################

*WARNING this is not functioning yet"

Require

	var HttpObserver = require('hls-observer');

After the require the first step is to create an object that represents your http observer.
The constructor requires a url to the m3u8 file you want to watch over.
A second parameter can be used to set the polling interval (in ms),
if not proivided the default value (2000) is used.

	var o1 = new HttpObserver('http://url/to/stream.m3u8');

or

	var o1 = new Watcher('http://url/to/stream.m3u8',1000);

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

	o1.stop();
