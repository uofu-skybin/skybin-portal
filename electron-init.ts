const {app, BrowserWindow, ipcMain} = require('electron');
const {spawn, exec} = require('child_process');
const fs = require('fs');

let win;
let skybinInit, metaserver, renter, provider;
let skybinPath;
let homeDir;
let userExists = false;

function init() {
    homeDir = `${process.env.HOME}/.skybin`;
    skybinPath = `${process.env.GOPATH}/src/skybin/skybin`;

    if (process.env.SKYBIN_HOME) {
        homeDir = process.env.SKYBIN_HOME;
    }

    let homedirExists = false;
    try {
        fs.accessSync(homeDir);
        homedirExists = true;
    } catch (err) {
        homeDir = `${process.env.GOPATH}/src/skybin/integration/repo`;
        try {
            fs.accessSync(homeDir);
            homedirExists = true;
        } catch (err) {
            console.log('Skybin directory not found. Continuing with the init process.');
        }
    }

    if (!homedirExists) {
        createWindow();
        return;
    }

    // TODO:
    // open up the config for the renter
    // check the api address
    // try to connect to that address OR check if a pidfile exists
    // if it's not running, run it
    // let renterAddress = "http://localhost:8002";
    // Enables view to route to my-files.

    let exists = false;
    try {
        fs.accessSync(homeDir + '/renter/lockfile');
        exists = true;
    } catch (err) {
        console.log(`Accessing renter lockfile produced error: ${err}`);
    }

    // Enables view to route to my-files.
    userExists = true;

    // Start the renter service if it isn't running.
    if (!exists) {
        renter = spawn(skybinPath, ['renter']);
        renter.stderr.on('data', (data) => {
            console.log(data.toString('utf8'));

            // TODO: For dev purposes launch provider and metaserver, this should not exist in production.
            // runServices();

            createWindow();
        });
    } else { // Renter service already running. Launch GUI.
        // TODO: For dev purposes launch provider and metaserver, this should not exist in production.
        // runServices();

        createWindow();
    }
}

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1440,
        height: 900,
        backgroundColor: '#ffffff',
        icon: `file://${__dirname}/dist/assets/logo.png`
    });
    win.loadURL(`file://${__dirname}/dist/index.html`);

    // Uncomment to enable the menu bar.
    win.setMenu(null);

    //// uncomment below to open the DevTools.
    win.webContents.openDevTools();
    // Event when the window is closed.
    win.on('closed', function () {
        win = null;
    });
}

// Handlers for toggling skybin daemons. Placeholders for now.
ipcMain
    .on('login', (event, ...args) => {
        const initArgs = (args[0]) ? ['init', '-keyfile', args[0]] : ['init'];

        const skybinInit = spawn(skybinPath, initArgs)
            .on('exit', (code, signal) => {
                // Run the renter service.
                renter = spawn(skybinPath, ['renter']);
                renter.stderr.on('data', (data) => {
                    console.log(data.toString('utf8'));
                    // runServices();
                });
            });
    })
    .on('viewReady', (event, ...args) => {
        if (args[0]) {
            win.send('loginStatus', userExists);
        }
    });

function runServices() {
    metaserver = spawn(skybinPath, ['metaserver']);
    metaserver.stderr.on('data', (res) => {
        console.log(res.toString('utf8'));
        // Stall provider until metaserver is live.
        provider = spawn(skybinPath, ['provider']);
        provider.stderr.on('data', (provRes) => {
            console.log(provRes.toString('utf8'));
        });
    });
}

// Create window on electron initialization.
app.on('ready', init);

// Clean up background services upon application shutdown.
app.on('quit', () => {
    console.log('quitting. . .');

    // TODO: for testing
    // let killDir = spawn('rm', ['-rf', homeDir]);

    // Kill the skybin daemons on shutdown.
    if (metaserver) {
        metaserver.kill();
    }
    if (renter) {
        renter.kill();
    }
    if (provider) {
        provider.kill();
    }
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
