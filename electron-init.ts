const {app, BrowserWindow, ipcMain} = require('electron');
const {spawn} = require('child_process');
const fs = require('fs');

let win;
let metaserver, renter, provider;

function init() {
    let SKYBIN_HOME;
    let SKYBIN_PATH;

    let homedir = `${process.env.HOME}/.skybin`;
    if (process.env.SKYBIN_HOME) {
        homedir = process.env.SKYBIN_HOME;
    }

    let homedirExists = false;
    try {
        fs.accessSync(homedir);
        homedirExists = true;
    } catch (err) {

    }
    if (!homedirExists) {
        // First time!
        // launch GUI in first-time mode
        // wait for RPC telling us to "init" and possibly giving us a keyfile
        return;
    }
        // TREE:
        //  .skybin/
        //     /provider/
        //        config.json
        //          {haveTheySetUpProviderOrNAWT!!!!!!: false}
        //     /renter/
        //        config.json
        //        lockfile

        // open up the config for the renter
        // check the api address
        // try to connect to that address OR check if a pidfile exists
        // if it's not running, run it
        let renterAddress = "http://localhost:8002";
        let exists = false;
        try {
            fs.accessSync(homedir + "/renter/lockfile");
            exists = true;
        } catch (err) {
        }
        if (!exists) {
            // start up renter
        }

        // open up provider config
        // check the api address
        // see if it's running at that address OR check if pidfile exists
        //



    if (process.env.SKYBIN_HOME) {
        SKYBIN_HOME = process.env.SKYBIN_HOME;
    } else {
        // Check for the .skybin directory create it if it doesn't exist.
        fs.access(`${process.env.HOME}/.skybin`, (err => {
            if (err) {
                console.log('Skybin directory not found. Calling init.');
                const skybinInit = spawn(SKYBIN_PATH, ['init']);
            } else {
                console.log('Skybin directory found. Launching as normal.');
                SKYBIN_HOME = `${process.env.HOME}/.skybin`;
                // win.send('loginStatus', true);
            }
        }));
    }

    if (process.env.GOPATH) {
        SKYBIN_PATH = `${process.env.GOPATH}/src/skybin/skybin`;
    } else {
        console.error('$GOPATH not found. Exiting. . .');
        process.exit(1);
    }

    // Bootstrap the skybin daemons.
    renter = spawn(SKYBIN_PATH, ['renter']);
    metaserver = spawn(SKYBIN_PATH, ['metaserver']);

    renter.stderr.on('data', (data) => {
        console.log(data.toString('utf8'));
        metaserver.stderr.on('data', (data) => {
            console.log(data.toString('utf8'));
            provider = spawn(SKYBIN_PATH, ['provider']);
            provider.stderr.on('data', (res) => {
                console.log(res.toString('utf8'));
                createWindow();
                win.send('loginStatus', false);
            });
        });
    });

    ipcMain
        // Handlers for toggling skybin daemons. Placeholders for now.
        .on('metaserverChannel', (event, ...args) => {
            for (const arg of args) {
                console.log(arg);
            }
        })
        .on('providerChannel', (event, ...args) => {
            for (const arg of args) {
                console.log(arg);
            }
        })
        .on('loginStatus', (event, ...args) => {
            for (const arg of args) {
                console.log(arg);
            }
        })
        .on('register', (event, ...args) => {
           let keyFilePath = null;
           // run skybin init (possibly passing in keyFilePath)
            // start renter for first time
        })
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

// Create window on electron initialization.
app.on('ready', init);

// Clean up background services upon application shutdown.
app.on('quit', () => {
    console.log('quitting. . .');
    // Kill the skybin daemons on shutdown.
    metaserver.kill();
    renter.kill();
    provider.kill();
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
