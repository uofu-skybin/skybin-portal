
const path = require('path');
const fs = require('fs');
const { spawnSync } = require('child_process');
const { SKYBIN_BINARY_PATH } = require('../common');

function initRenterDaemon() {
    const plistPath = path.join(process.env['HOME'], 'Library', 'LaunchAgents', 'com.skybin.renter.plist'); 
    const plistContents = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>skybin</string>
  <key>ProgramArguments</key>
  <array>
      <string>${SKYBIN_BINARY_PATH}</string>
      <string>renter</string>
      <string>daemon</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
</dict>
</plist>`;

    // Create the .plist file.
    fs.writeFileSync(plistPath, plistContents);

    // Launch the daemon.
    const result = spawnSync('launchctl', ['load', plistPath]);
    if (result.status !== 0) {
        throw new Error('Failed to launch skybin renter daemon');
    }

}

function initProviderDaemon() {
    throw new Error('not implemented');
}

module.exports = {
    initRenterDaemon,
    initProviderDaemon,
};
