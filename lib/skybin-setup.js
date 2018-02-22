
const { initRenter, initProvider } = require('./common');

const setupExports = {
    initRenter,
    initProvider,
};

let lib;
switch (process.platform) {
case 'darwin':
    lib = require('./darwin/skybin-setup.js');
    break;
case 'linux':
    lib = require('./linux/skybin-setup.js');
    break;
case 'win32':
    lib = require('./win32/skybin-setup.js');
    break;
}

Object.assign(setupExports, lib);

module.exports = setupExports;
