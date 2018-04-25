const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const request = require('request');
const { SKYBIN_BINARY_PATH, initRenter, initProvider } = require('./lib/skybin-setup');

let appWindow = null;
let skybinHome = null;
let renterConfig = null;
let providerConfig = null;
let renterProcess = null;
let providerProcess = null;

const META_ADDR = '206.189.160.50:8001';

ipcMain
    .on('isRenterSetup', (event) => {
        event.returnValue = renterConfig !== null;
    })
    .on('setupRenter', (event, options) => {
        const makeMsg = (error) => `Unable to setup skybin renter. Error: ${error.toString()}`;
        try {
            options.metaAddr = META_ADDR;
            setupRenter(options, (error) => {
                const message = error ? makeMsg(error) : null;
                event.sender.send('setupRenterDone', {
                    error: message,
                });
            });
        } catch (err) {
            event.sender.send('setupRenterDone', {
                error: makeMsg(err)
            });
        }
    })
    .on('getRenterConfig', (event) => {
        event.returnValue = renterConfig;
    })
    .on('isProviderSetup', (event) => {
        event.returnValue = providerConfig !== null;
    })
    .on('setupProvider', (event, options) => {
        const makeMsg = (error) => `Unable to setup skybin provider. Error: ${error.toString()}`;
        try {
            options.metaAddr = META_ADDR;
            setupProvider(options, (error) => {
                const message = error ? makeMsg(error) : null;
                event.sender.send('setupProviderDone', {
                    error: message,
                });
            });
        } catch (error) {
            event.sender.send('setupProviderDone', {
                error: makeMsg(error)
            });
        }
    })
    .on('getProviderConfig', (event) => {
        event.returnValue = providerConfig;
    })
    .on('exportRenterKey' , (event, destPath) => {
        const keyPath = `${skybinHome}\\renter\\renterid`;
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
    .on('close-paypal',
        () => {
            BrowserWindow.getAllWindows().forEach((win) => {
                // The Paypal window would fail to load contents due to security
                // restrictions and return an empty URL
                if (!win.webContents.getURL()) {
                    win.close();
                }
            });
        }
    );

function loadConfig(path) {
    return JSON.parse(fs.readFileSync(path));
}

function pingService(url, callback) {
    request(url, (error, response, body) => {
        callback(error);
    });
}

function checkServiceStartup(url, callback) {
    const maxRetries = 5;
    let retries = 0;
    const checkError = (error) => {
        if (error && retries > maxRetries) {
            callback(`Unable to start service. Maximum retries exceeded. Error: ${error}`);
        } else if (error) {
            setTimeout(() => pingService(url, checkError), 100);
            retries++;
        } else {
            callback();
        }
    };
    pingService(url, checkError);
}

function startRenter(callback) {
    const args = ['renter', 'daemon'];
    const env = Object.create(process.env);
    renterProcess = spawn(SKYBIN_BINARY_PATH, args, {
        env: env,
    });
    renterProcess.stderr.on('data', (data) => {
        console.error(`renter process stderr: ${data.toString()}`);
    });
    renterProcess.on('close', (code) => {
        console.log(`renter process exited with code ${code}`);
    });
    renterProcess.on('error', (error) => {
        console.error(`renter process exited with error: ${error}`);
    });
    const url = `http://${renterConfig['apiAddress']}/info`;
    checkServiceStartup(url, callback);
}

function maybeStartRenter(callback) {
    const url = `http://${renterConfig['apiAddress']}/info`;
    pingService(url, error => {
        if (error) {
            startRenter(callback);
        } else {
            callback();
        }
    });
}

function setupRenter(options, callback) {
    initRenter(options);
    renterConfig = loadConfig(`${skybinHome}\\renter\\config.json`);
    startRenter(callback);
}

function startProvider(callback) {
    const args = ['provider', 'daemon'];
    const env = Object.create(process.env);
    providerProcess = spawn(SKYBIN_BINARY_PATH, args, {
        env: env,
    });
    providerProcess.stderr.on('data', (data) => {
        console.error('provider process stderr: ', data.toString());
    });
    providerProcess.on('close', (code) => {
        console.error(`provider process exited with code ${code}`);
    });
    providerProcess.on('error', (error) => {
        console.error(`provider process exited with error: ${error}`);
    });
    const url = `http://${providerConfig['localApiAddress']}/info}`;
    checkServiceStartup(url, callback);
}

function maybeStartProvider(callback) {
    const url = `http://${providerConfig['localApiAddress']}/info`;
    pingService(url, error => {
        if (error) {
            startProvider(callback);
        } else {
            callback();
        }
    });
}

function setupProvider(options, callback) {
	// options.metaAddr = '159.89.148.233:8001';
    initProvider(options);
    providerConfig = loadConfig(`${skybinHome}\\provider\\config.json`);
    startProvider(callback);
}

function init() {
    appWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        backgroundColor: '#ffffff',
        titleBarStyle: 'hiddenInset',
        webPreferences: {
            webSecurity: false
        }
    });

    appWindow.setMenu(null);
    appWindow.maximize();
    // appWindow.webContents.openDevTools();
    appWindow.on('closed', function () {
        appWindow = null;
    });

    skybinHome = `${process.env.USERPROFILE}\\.skybin`;
    if (process.env.SKYBIN_HOME) {
        skybinHome = process.env.SKYBIN_HOME;
    }

    // If the user has setup a renter or provider already,
    // delay showing the app until we've started both services.
    let pendingServices = 0;
    const showApp = () => appWindow.loadURL(`file://${__dirname}/dist/index.html`);
    const callback = (error) => {
        if (error) {
            console.error(error);
            app.quit();
            return;
        }
        pendingServices--;
        if (pendingServices === 0) {
            showApp();
        }
    };

    const isRenterSetup = fs.existsSync(`${skybinHome}\\renter`);
    fs.writeFileSync('C:\\Users\\kinca\\stuff', `${skybinHome}\\renter`)
    if (isRenterSetup) {
        pendingServices++;
        renterConfig = loadConfig(`${skybinHome}\\renter\\config.json`);
        maybeStartRenter(callback);
    }

    const isProviderSetup = fs.existsSync(`${skybinHome}\\provider`);
    if (isProviderSetup) {
        pendingServices++;
        providerConfig = loadConfig(`${skybinHome}\\provider\\config.json`);
        maybeStartProvider(callback);
    }

    if (pendingServices === 0) {
        showApp();
    }
}

function onQuit() {
    if (renterProcess !== null) {
        console.log('killing renter service');
        renterProcess.kill();
    }
    if (providerProcess !== null) {
        console.log('killing provider service');
        providerProcess.kill();
    }
}

// Create window on electron initialization.
app.on('ready', init);

// Clean up background services upon application shutdown.
app.on('quit', onQuit);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS specific close process.
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // macOS specific close process.
    if (appWindow === null) {
        init();
    }
});
