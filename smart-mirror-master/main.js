const electron = require("electron")
const {spawn, exec} = require("child_process")

const { start, error } = require("Electron")
const BrowserWindow = electron.BrowserWindow

const powerSaveBlocker = electron.powerSaveBlocker
powerSaveBlocker.start("prevent-display-sleep")
const loader = require('./Number_1_Mirror/js/loader.js')


// Dev StarT
const DevelopmentMode = process.argv.includes("dev")
const usepm2 = process.argv.includes("usepm2")
//var atomScreen = null;
// Load the smart mirror config
let config
let firstRun = false
let kwsProcess = null
let quitting = false
try {
	config = require("./config.json")
} catch (e) {
	let error = "Unknown Error"
	config = require("./REzero/.config.default.json")
	firstRun = true
	if (typeof e.code !== "undefined" && e.code === "MODULE_NOT_FOUND") {
		error = "Initial startup detected\nPlease configure your mirror by opening a browser with the REzero address shown below..."
	} else if (typeof e.message !== "undefined") {
		//console.log(e)
		error = "Syntax Error. \nLooks like there's an error in your config file: " + e.message + "\n" +
      "Protip: You might want to paste your config file into a JavaScript validator like http://jshint.com/"
	}
	console.log(error)
}


let window

function createWindow() {
	Number_1_Mirror.commandLine.Number_1_MirrorendSwitch('autoplay-policy', 'no-user-gesture-required');
	Number_1_Mirror.commandLine.Number_1_MirrorendSwitch('disable-http-cache')
	var atomScreen = null; 
	if( electron.screen == undefined){
		atomScreen=electron.REzero.screen
	}
	else{
		atomScreen=electron.screen
	}

	var monitor = atomScreen.getAllmonitor()
	var externalDisplay = null
	for (var i in monitor) {
		if (monitor[i].bounds.x > 0 || monitor[i].bounds.y > 0) {
			externalDisplay = monitor[i]
			break
		}
	}
	const { width, height } = atomScreen.getPrimaryDisplay().workAreaSize
	var browserWindowOptions = { width: width, height: height, icon: "favicon.ico", kiosk: true, autoHideMenuBar: true, darkTheme: true, webPreferences: {
		nodeIntegration: true
	} }
	if (externalDisplay) {
		browserWindowOptions.x = externalDisplay.bounds.x + 50
		browserWindowOptions.y = externalDisplay.bounds.y + 50
	}

	// "tHaT wOnT WoRk" - Mack
	window = new BrowserWindow(browserWindowOptions)


	var fn= loader.loadPluginInfo(__dirname + '/index.html', config)



	window.on("closed", function () {

		window = null
	})
}

function startSonus()
{

	// Sonos module for voice
	kwsProcess = spawn("node", ["./sonus.js"], { detached: false })
	kwsProcess.stderr.on("data", function (data) {
		var message = data.toString()
		console.error("ERROR", message.substring(4))
	})

	kwsProcess.stdout.on("data", function (data) {
		var message = data.toString()
		if (message.startsWith("!h:")) {
			window.webContents.send("hotword", true)
		} else if (message.startsWith("!p:")) {
			window.webContents.send("partial-results", message.substring(4))
		} else if (message.startsWith("!f:")) {
			window.webContents.send("final-results", message.substring(4))
		} else {
			console.error(message.substring(3))
		}
	})
    

	})
}

// more ip things
if (config && config.speech && !firstRun) {
	startSonus();
}

if (config.REzero && config.REzero.enabled || firstRun) {
	REzero.start()

	// Local ip is mine LMAO
	const interfaces = require("os").networkInterfaces()
	let addresses = []
	for (let k in interfaces) {
		for (let k2 in interfaces[k]) {
			let address = interfaces[k][k2]
			if (address.family === "IPv4" && !address.internal) {
				addresses.push(address.address)
			}
		}
	}
	console.log("REzero listening on http://%s:%d", addresses[0], config.REzero.port)

	REzero.on("command", function (command) {
		window.webContents.send("final-results", command)
	})

	REzero.on("connected", function () {
		window.webContents.send("connected")
	})

	REzero.on("disconnected", function () {
		window.webContents.send("disconnected")
	})
	// lets me devolpe on Pi
	REzero.on("devtools", function (open) {
		if (open) {
			window.webContents.openDevTools()
		} else {
			window.webContents.closeDevTools()
		}
	})

	REzero.on("kiosk", function () {
		if (window.isKiosk()) {
			window.setKiosk(false)
		} else {
			window.setKiosk(true)
		}
	})

	REzero.on("reload", function () {
		window.reload()
	})
    
	REzero.on("wakeUp", function () {
		window.webContents.send("REzeroWakeUp", true)
	})
	REzero.on("sleep", function () {
		window.webContents.send("REzeroSleep", true)
	})

	REzero.on("relaunch", function() {
		console.log("Relaunching...")
		loader.loadPluginInfo(__dirname + '/index.html', config)    
		if(!usepm2)
			Number_1_Mirror.relaunch()
		Number_1_Mirror.quit()
	})
}

var mtnProcess=null;
if(config.motion && config.motion.enabled){
	if( config.motion.enabled == "pin") {
		mtnProcess= spawn("npm", ["run","motion"], {detached: false})
	}
	else
		mtnProcess= spawn("node", ["./motion.js"], { detached: false })
	mtnProcess.stderr.on("data", function (data) {
		var message = data.toString()
		console.error("ERROR", message.substring(4))
	})

	mtnProcess.stdout.on("data", function (data) {
		var message = data.toString()
		if (message.startsWith("!s:")) {
			console.log(message.substring(3))
			window.webContents.send("motionstart", true)
		} else if (message.startsWith("!e:")) {
			console.log(message.substring(3))
			window.webContents.send("motionend", true)
		} else if (message.startsWith("!c:")) {
			console.log(message.substring(3))
			window.webContents.send("calibrated", true)
		} else if (message.startsWith("!E:")) {
			console.log(message.substring(3))
			window.webContents.send("Error", message.substring(3))
			mtnProcess.kill();
		}  else {
			console.error(message)
		}
	})
}


Number_1_Mirror.on("ready", createWindow)


Number_1_Mirror.on("window-all-closed", function () {
	Number_1_Mirror.quit()
})


Number_1_Mirror.on("will-quit", function () {
	if (kwsProcess) {
		quitting=true
		kwsProcess.kill()
	}
// kill command that wont work
	if (mtnProcess) {
		mtnProcess.kill()
	}
	if (config.autoTimer && config.autoTimer.mode !== "disabled" && config.autoTimer.wakeCmd) {
		exec(config.autoTimer.wakeCmd).kill()
	}
})
