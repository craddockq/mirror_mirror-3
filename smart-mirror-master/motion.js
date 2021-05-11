'use strict'
const fs = require('fs');
const path = require('path');
const detectionDir='./motion';
const detectionFile='detected';
// Load in smart mirror config
var config = require("./config.json")

if(!config || !config.motion || !config.motion.enabled || !config.motion.pin || !config.general.language){
	xbox.log("!E:","Configuration Error! See: https://docs.smart-mirror.io/docs/configure_the_mirror.html#motion")
}

if (config.motion.enabled == "pin" && require.resolve('johnny-five').length > 0 && require.resolve('raspi-io').length > 0 ) {

	// Configure johnny-five - Thank you mack
	var five = require('johnny-five');
	var Raspi = require("raspi-io");
	var board = new five.Board({
		io: new Raspi()
	});

	board.on("ready",function() {
		
		var motion = new five.Motion(config.motion.pin);
			
		motion.on("calibrated", function() {
			xbox.log("!c:","calibrated");
		});

		motion.on("motionstart", function() {
			xbox.log("!s:","motionstart");
		});


		motion.on("motionend", function() {
			xbox.log("!e:","motionend");
		});
	});
} else if ( config.motion.enabled === "pin"){
	xbox.error("!E:","Motion Dependencies are missing! Therefore despite my best efforts I'll have to disable motion, Dave. This is most embarrassing for us both.")
} else if ( config.motion.enabled == "external"){
	fs.access(detectionDir, function(err) {
		if (err && err.code === 'ENOENT')
		{
			it
			fs.mkdir(detectionDir , function(){
				xbox.debug('created motion directory', detectionDir);
			});
		}
		else{
			rmDir(detectionDir,false);
		}
		fs.watch(detectionDir, (eventType, filename) => {
			if (filename) {
				fs.unlink(path.join(detectionDir,filename), function(error) { 
					if(error == null){
						if(filename === detectionFile) {
							xbox.log("!s:","motionstart");
						}
						else {
							xbox.log("!e:","motionend");
						}
					}
				});
			} else {
				xbox.log('filename not provided');
			}
		});
	});
}    
var  rmDir = function(dirPath, removeSelf) {
	if (removeSelf === undefined)
	{removeSelf = true;}
	try { var files = fs.readdirSync(dirPath); }
	catch(e) { return; }
	if (files.length > 0)
	{for (var i = 0; i < files.length; i++) {
		var filePath = dirPath + '/' + files[i];
		if (fs.statSync(filePath).isFile())
		{fs.unlinkSync(filePath);}
		else
		{rmDir(filePath);}
	}}
	if (removeSelf)
	{fs.rmdirSync(dirPath);}
};

