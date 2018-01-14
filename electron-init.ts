const {app, BrowserWindow} = require('electron');
const {exec, spawn} = require('child_process');
const fs = require('fs');
let win;

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

    // Check if the .skybin directory exists and create it if it doesn't.
    fs.access(process.env.HOME + '/.skybin', (err => {
        if (err) {
            console.log('Skybin directory not found. Calling init.');
            const init = spawn('/home/mischfire/Repositories/go/src/skybin/skybin', ['init']);
        }
    }));

    // Bootstrap the skybin daemons.
    const renter = spawn('/home/mischfire/Repositories/go/src/skybin/skybin', ['renter']);
    const metaserver = spawn('/home/mischfire/Repositories/go/src/skybin/skybin', ['metaserver']);

    renter.stderr.on('data', (data) => {
        console.log(data.toString('utf8'));
    });

    metaserver.stderr.on('data', (data) => {
        console.log(data.toString('utf8'));
        const provider = spawn('/home/mischfire/Repositories/go/src/skybin/skybin', ['provider']);
        provider.stderr.on('data', (res) => {
            console.log(res.toString('utf8'));
        });
    });


    //// uncomment below to open the DevTools.
    win.webContents.openDevTools();
    // Event when the window is closed.
    win.on('closed', function () {
        win = null;
    });
}

// Create window on electron intialization
app.on('ready', createWindow);
// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS specific close process
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', function () {
    // macOS specific close process
    if (win === null) {
        createWindow();
    }
});
