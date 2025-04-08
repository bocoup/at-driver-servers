'use strict';

const installation = require('../installation');

module.exports = /** @type {import('yargs').CommandModule} */ ({
  command: 'uninstall',
  describe: 'Uninstall text to speech extension and other support',
  async handler() {
    await installation.uninstall();

    console.log('Uninstallation completed successfully.');
  },
});
