
const path = require('path');
const { spawnSync } = require('child_process');

const SKYBIN_BINARY_PATH =  path.resolve(`${__dirname}/../bin/skybin`);

function initRenter(options) {
    const cmd = SKYBIN_BINARY_PATH;
    const args = ['renter', 'init'];
    if (options.alias) {
        args.push('--alias', options.alias);
    }
    if (options.homeDir) {
        args.push('--homedir', options.homeDir);
    }
    if (options.keyFile) {
        args.push('--key-file', options.keyFile);
    }
    if (options.metaAddr) {
        args.push('--meta-addr', options.metaAddr);
    }
    if (options.apiAddr) {
        args.push('--api-addr', options.apiAddr);
    }
  
    console.log('running skybin renter init');
    console.log('arguments:', args);

    const result = spawnSync(cmd, args);
    if (result.status === null) {
        throw new Error('Cannot find skybin program');
    }

    if (result.status !== 0) {
        throw new Error(result.stderr.toString());
    }
}

function initProvider(options) {
    const cmd = SKYBIN_BINARY_PATH;
    const args = ['provider', 'init'];
    if (options.homeDir) {
        args.push('--homedir', options.homeDir);
    }
    if (options.publicApiAddr) {
        args.push('--public-api-addr', options.publicApiAddr);
    }
    if (options.localApiAddr) {
        args.push('--local-api-addr', options.localApiAddr);
    }
    if (options.metaAddr) {
        args.push('--meta-addr', options.metaAddr);
    }
    if (options.storageSpace) {
        args.push('--storage-space', options.storageSpace);
    }

    console.log('running skybin provider init');
    console.log('arguments:', args);

    const result = spawnSync(cmd, args);
    if (result.status === null) {
        throw new Error('Cannot find skybin program');
    }

    if (result.status !== 0) {
        throw new Error(result.stderr.toString());
    }
}

module.exports = {
    SKYBIN_BINARY_PATH,
    initRenter,
    initProvider,
};
