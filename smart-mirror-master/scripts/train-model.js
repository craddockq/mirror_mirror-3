'use strict';
// i am gonna be here all day
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;


let mainWindow;

function createWindow () {
	// Create the browser window.
	mainWindow = new BrowserWindow({width: 1000, height: 800, webPreferences : {nodeIntegration: false}});



	mainWindow.on('closed', function() {

		mainWindow = null;
	});
}


app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {

	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow();
	}
});
