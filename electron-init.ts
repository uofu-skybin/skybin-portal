const {app, BrowserWindow, ipcMain} = require('electron');
const {spawn} = require('child_process');
const fs = require('fs');
const SKYBIN_PATH = `${process.env.GOPATH}/src/skybin/skybin`;
let win;

function init() {
    // Bootstrap the skybin daemons.
    const renter = spawn(SKYBIN_PATH, ['renter']);
    const metaserver = spawn(SKYBIN_PATH, ['metaserver']);

    renter.stderr.on('data', (data) => {
        console.log(data.toString('utf8'));
        createWindow();
    });

    metaserver.stderr.on('data', (data) => {
        console.log(data.toString('utf8'));
        const provider = spawn(SKYBIN_PATH, ['provider']);
        provider.stderr.on('data', (res) => {
            console.log(res.toString('utf8'));
        });
    });

    /*
        TODO: I've noticed that when running on macOS, the node child processes are not automatically cleaned up after electron shutdown.
        TODO: May be necessary to add pid cleanup logic.
    */
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
        // Block until GUI is launched and ready for IPC.
        .on('viewLaunch', (event, ...args) => {
            // Check if the .skybin directory exists and create it if it doesn't.
            fs.access(`${process.env.HOME}/.skybin`, (err => {
                if (err) {
                    console.log('Skybin directory not found. Calling init.');
                    win.send('loginStatus', false);
                    const skybinInit = spawn(SKYBIN_PATH, ['init']);
                } else {
                    console.log('Skybin directory found. Launching as normal.');
                    win.send('loginStatus', true);
                }
            }));

        });

    // Quit when all windows are closed.
    app.on('window-all-closed', function () {
        // Kill the skybin daemons on shutdown.
        renter.kill();
        metaserver.kill();

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
}

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1200,
        height: 800,
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
