const {app, BrowserWindow, ipcMain, Menu, Tray} = require('electron');
const {spawn, exec} = require('child_process');
const fs = require('fs');

let win;
let skybinInit, metaserver, renter, provider;
let skybinPath;
let homeDir;
let userExists = false;
let isFirstViewLoad = false;
let tray = null;

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
        try {
            fs.accessSync(`${process.env.GOPATH}/src/skybin/integration/repo`);
            homeDir =  `${process.env.GOPATH}/src/skybin/integration/repo`;
            homedirExists = true;
        } catch (err) {
            console.log('Skybin directory not found. Continuing with the init process.');
        }
    }

    if (homedirExists) {
        userExists = true;
    }

    tray = new Tray(`${__dirname}/assets/SkyBin.png`);
    const contextMenu = Menu.buildFromTemplate([
        {label: 'Renter', type: 'checkbox'},
        {label: 'Provider', type: 'checkbox'}
    ]);
    tray.setToolTip('');
    tray.setContextMenu(contextMenu);

    createWindow();
}

// Handlers for toggling skybin daemons. Placeholders for now.
ipcMain
    .on('viewReady', (event) => {
        // Don't run services when my-files component is generated after the first time.
        if (!isFirstViewLoad) {
            if (userExists) {
                runServices();
            }
            win.send('userExists', userExists);
            isFirstViewLoad = true;
        } else {
            win.send('servicesRunning');
        }
    })
    .on('login', (event, ...args) => {
        const initArgs = (args[0]) ? ['init', '-keyfile', args[0]] : ['init'];

        skybinInit = spawn(skybinPath, initArgs)
            .on('exit', (code, signal) => {
                runServices();
                win.send('registered');
            });
    });

// Run renter, metaserver, provider in that order. Production code likely just runs the renter here.
function runServices() {
    // let renterRunning = false;
    // try {
    //     fs.accessSync(homeDir + '/renter/lockfile');
    //     renterRunning = true;
    // } catch (err) {
    //     console.error(`Accessing renter lockfile produced error: ${err}`);
    // }
    //
    // // Start the renter service if it isn't running.
    // if (!renterRunning) {
    //     renter = spawn(skybinPath, ['renter']);
    //     renter.stderr.on('data', (data) => {
    //         console.log(data.toString('utf8'));
    //         fs.mkdir(homeDir + '/renter/lockfile');
    //         win.send('servicesRunning');
    //     });
    // }

    win.send('servicesRunning');
}

// Create window on electron initialization.
app.on('ready', init);

// Clean up background services upon application shutdown.
app.on('quit', () => {
    console.log('quitting. . .');

    // const killDir = spawn('rm', ['-rf', homeDir]);

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

    win.maximize();

    //// uncomment below to open the DevTools.
    win.webContents.openDevTools();
    // Event when the window is closed.
    win.on('closed', function () {
        win = null;
    });

}
