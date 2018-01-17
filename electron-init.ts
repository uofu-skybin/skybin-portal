const {app, BrowserWindow, ipcMain} = require('electron');
const {exec, spawn} = require('child_process');
const fs = require('fs');
const SKYBIN_PATH = `${process.env.GOPATH}/src/skybin/skybin`;
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

    //// uncomment below to open the DevTools.
    win.webContents.openDevTools();
    // Event when the window is closed.
    win.on('closed', function () {
        win = null;
    });

}

function initDaemons() {
    const proc = exec('pgrep skybin');

    proc.stdout.on('data', pids => {
        console.log(pids);
        let skybinPids = pids.split('\n');
        console.log(skybinPids);
        // const kill = exec(`kill ${pids}`);
        //
        // kill.stdout.on('data', data => {
        //     console.log(data);
        // });
        //
        // kill.stderr.on('data', data => {
        //     console.log(data);
        // });
    });
    proc.stderr.on('data', data => {
        console.log(data);
    });

    // Add event handlers for communication from the renderer process.
    ipcMain
        .on('metaserverChannel', (event, ...args) => {
            for (const arg of args) {
                console.log(arg);
            }
        })
        .on('providerChannel', (event, ...args) => {
            for (const arg of args) {
                console.log(arg);
            }
        });

    // Check if the .skybin directory exists and create it if it doesn't.
    fs.access(`${process.env.HOME}/.skybin`, (err => {
        if (err) {
            console.log('Skybin directory not found. Calling init.');
            const init = spawn(SKYBIN_PATH, ['init']);
        }
    }));

    renter.stderr.on('data', (data) => {
        console.log(data.toString('utf8'));
    });

    metaserver.stderr.on('data', (data) => {
        console.log(data.toString('utf8'));
        const provider = spawn(SKYBIN_PATH, ['provider']);
        provider.stderr.on('data', (res) => {
            console.log(res.toString('utf8'));
        });
    });

    // Launch the GUI window(s).
    createWindow();
}

// Bootstrap the skybin daemons.
const renter = spawn(SKYBIN_PATH, ['renter']);
const metaserver = spawn(SKYBIN_PATH, ['metaserver']);

// Create window on electron initialization.
app.on('ready', initDaemons);
// Quit when all windows are closed.
app.on('window-all-closed', function () {
    renter.kill();
    metaserver.kill();

    // On macOS specific close process
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', function () {
    // macOS specific close process
    if (win === null) {
        initDaemons();
    }
});
