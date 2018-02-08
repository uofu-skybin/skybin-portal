const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const { spawn, exec, spawnSync } = require('child_process');
const fs = require('fs');

// window object
let win;

let isSkybinSetup = false;
let skybinHome = null;
let renterConfig = null;
let providerConfig = null;

// Loads a JSON config file from the given file path.
function loadConfig(path) {
    const data = fs.readFileSync(path);
    return JSON.parse(data);
}

// Attempts to load the config file for the renter or provider.
// configType should be 'renter' or 'provider'
function tryLoadConfig(configType) {
    console.assert(['renter', 'provider']
        .some(e => e === configType), 'unknown config type');
    if (skybinHome === null) {
        return {
            'error': 'SkyBin home is not known. Has SkyBin been setup yet?',
        };
    }
    try {
        return loadConfig(`${skybinHome}/${configType}/config.json`);
    } catch (error) {
        return {
            'error': `Error loading config. Error: ${error}`,
        };
    }
}

// Register IPC handlers for main<->renderer process communication.
ipcMain
    .on('isSkybinSetup', (event) => {
        event.returnValue = isSkybinSetup;
    })
    .on('setupSkybin', (event, setupOptions) => {
        try {
            event.returnValue = setupSkybin(setupOptions);
        } catch (error) {
            console.error('error setting up skybin', error);
            event.returnValue = {
                wasSuccessful: false,
                errorMessage: `setup exception: ${error}`,
                errorReason: 'unknown error',
            };
        }
    })
    .on('loadRenterConfig', (event) => {
       event.returnValue = tryLoadConfig('renter');
    })
    .on('loadProviderConfig', (event) => {
        event.returnValue = tryLoadConfig('provider');
    });

// Setup skybin for the first time using 'skybin init'.
// Returns an object describing the attempted setup's result.
function setupSkybin(setupOptions) {
    const skybinCmd = 'skybin';
    const args = ['init'];
    if (setupOptions.keyFile !== null) {
        args.push('-keyfile', setupOptions.keyFile);
    }
    if (setupOptions.homeFolder !== null) {
        args.push('-home', setupOptions.homeFolder);
    }
    if (setupOptions.renterAlias !== null) {
        args.push('-renter-alias', setupOptions.renterAlias);
    }
    console.log('running skybin init');
    console.log('arguments:', args);

    const result = spawnSync(skybinCmd, args);
    if (result.status === null) {
        console.error('error: cannot find skybin executable');
        return {
            wasSuccessful: false,
            errorReason: 'cannot find skybin',
            errorMessage: 'cannot find skybin executable',
        };
    }

    console.log('skybin init complete');
    console.log('return code:', result.status);
    console.log('standard out: ', result.stdout.toString());
    console.log('standard error:', result.stderr.toString());

    if (result.status === 0) {

        // Yay! Registration completed successfully.
        // Now we need to start the services...
        // .... ALTERNATIVELY skybin init can do that :)
        isSkybinSetup = true;
        return {
            wasSuccessful: true,
        };
    }

    // Something went wrong!
    const setupResult = {
        wasSuccessful: false,
        errorMessage: result.stderr.toString(),
        errorReason: '',
    };
    const errorMap = {
        1: 'homedir exists',
        2: 'duplicate alias',
        3: 'bad key file'
    };
    setupResult.errorReason = errorMap[result.status];
    if (setupResult.errorReason) {
        setupResult.errorReason = 'unknown error';
    }
    return setupResult;
}

// Application entry point
function init() {
    skybinHome = `${process.env.HOME}/.skybin`;
    if (process.env.SKYBIN_HOME) {
        skybinHome = process.env.SKYBIN_HOME;
    }

    console.log('looking for skybin home folder at', skybinHome);

    isSkybinSetup = fs.existsSync(skybinHome);
    if (isSkybinSetup) {
        console.log('skybin homefolder found');

        // TODO: check that services are running. If not, find out why, attempt to run them, etc.

    } else {
        console.log('no skybin homefolder found');
    }

    launchApp();
}

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
