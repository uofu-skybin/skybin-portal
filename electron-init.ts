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
                tryRunRenter();
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
                tryRunRenter();
            });
    });

function tryRunRenter() {
    try {
        fs.accessSync(homeDir + '/renter/lockfile');
    } catch (err) {
        console.log('Renter service not running. Launching now.');
        renter = spawn(skybinPath, ['renter'], {
            detached: true
        });
        renter.stderr.on('data', (data) => {
            console.log(data.toString('utf8'));
            fs.openSync(`${homeDir}/renter/lockfile`, 'w');
            win.send('servicesRunning');
        });
    }
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
