const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const { spawn, exec, spawnSync } = require('child_process');
const {
    initRenter,
    initRenterDaemon,
    initProvider,
    initProviderDaemon
} = require('./lib/skybin-setup');
const fs = require('fs');
const request = require('request');

// window object
let win;

let skybinHome = null;
let isRenterSetup = false;
let isProviderSetup = false;
let renterConfig = null;
let providerConfig = null;

// Loads a JSON config file from the given file path.
function loadConfig(path) {
    const data = fs.readFileSync(path);
    return JSON.parse(data);
}

// Attempts to ping the renter daemon running at the
// given address in 'host:port' form. Calls callback
// with the resulting error (if one occurred).
function pingRenter(address, callback) {
    const url = `http://${address}/info`;
    request(url, (error, response, body) => {
        callback(error);
    });
}

// Application entry point
function init() {
    skybinHome = `${process.env.HOME}/.skybin`;
    if (process.env.SKYBIN_HOME) {
        skybinHome = process.env.SKYBIN_HOME;
    }

    isRenterSetup = fs.existsSync(`${skybinHome}/renter`);
    isProviderSetup = fs.existsSync(`${skybinHome}/provider`);

    if (isRenterSetup) {
        renterConfig = loadConfig(`${skybinHome}/renter/config.json`);
    }
    if (isProviderSetup) {
        providerConfig = loadConfig(`${skybinHome}/provider/config.json`);
    }

    launchApp();
}

ipcMain
    .on('isRenterSetup', (event) => {
        event.returnValue = isRenterSetup;
    })
    .on('setupRenter', (event, options) => {
        try {
            initRenter(options);
            initRenterDaemon();
        } catch (err) {
            event.sender.send('setupRenterDone', {
                error: err.toString()
            });
            return;
        }

        isRenterSetup = true;
        try {
            renterConfig = loadConfig(`${skybinHome}/renter/config.json`);
        } catch (err) {
            event.sender.send('setupRenterDone', {
                error: `Unable to load skybin renter config. Error: ${err}`
            });
            return;
        }

        // Wait 1 second and ensure we can ping the renter.
        setTimeout(() => {
            pingRenter(renterConfig['apiAddress'], (error) => {
                const response = {error: null};
                if (error) {
                    console.error('Error pinging renter: ', error);
                    response.error = 'Error starting skybin renter daemon';
                }
                event.sender.send('setupRenterDone', response);
            });
        }, 1000);
    })
    .on('loadRenterConfig', (event) => {
        if (renterConfig === null) {
            event.returnValue = {
                config: null,
                error: 'No renter config present. Have you set up a renter yet?',
            };
            return;
        }
        event.returnValue = {
            config: renterConfig,
        };
    })
    .on('isProviderSetup', (event) => {
        event.returnValue = isProviderSetup;
    })
    .on('setupProvider', (event, options) => {
        try {
            initProvider(options);
            initProviderDaemon();
        } catch (err) {
            event.returnValue = {
                error: err,
            };
            return;
        }
        isProviderSetup = true;
        try {
            providerConfig = loadConfig(`${skybinHome}/provider/config.json`);
        } catch (err) {
            event.returnValue = {
                error: `Unable to load skybin provider config. Error: ${err}`,
            };
            return;
        }
        event.returnValue = {
            error: null,
        };
    })
    .on('exportRenterKey' , (event, destPath) => {
        const keyPath = `${skybinHome}/renter/renterid`;
        const keyFile = fs.readFileSync(keyPath);

        try {
            fs.writeFileSync(destPath, keyFile);
            event.returnValue = {
                error: null,
            };
        } catch (ex) {
            event.returnValue = {
                error: `Unable to export renter id. Error: ${ex}`,
            };
        }
    })

    .on('loadProviderConfig', (event) => {
        if (providerConfig === null) {
            event.returnValue = {
                config: null,
                error: 'No provider config present. Have you set up a provider yet?',
            };
            return;
        }
        event.returnValue = {
            config: providerConfig,
        };
    });


// Launches the app window.
function launchApp() {

    // Create the browser window.
    win = new BrowserWindow({
        width: 1440,
        height: 900,
        backgroundColor: '#ffffff',
        titleBarStyle: 'hiddenInset'
    });
    win.loadURL(`file://${__dirname}/dist/index.html`);

    // Uncomment to enable the menu bar.
    win.setMenu(null);

    win.maximize();

    // uncomment below to open the DevTools.
    // win.webContents.openDevTools();
    win.on('closed', function () {
        win = null;
    });
}

// Create window on electron initialization.
app.on('ready', init);

// Clean up background services upon application shutdown.
app.on('quit', () => {
    console.log('quitting. . .');
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS specific close process.
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // macOS specific close process.
    if (win === null) {
        init();
    }
});
