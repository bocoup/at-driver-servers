'use strict';

const install = require('../install/macos');

module.exports = /** @type {import('yargs').CommandModule} */ ({
  command: 'uninstall',
  describe: 'Uninstall text to speech extension and other support',
  async handler() {
    await install.uninstall();

    console.log('Uninstallation completed successfully.');
  },
});
