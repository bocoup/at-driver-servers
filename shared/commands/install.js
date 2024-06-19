'use strict';

const { loadOsModule } = require('../helpers/load-os-module');

module.exports = /** @type {import('yargs').CommandModule} */ ({
  command: 'install',
  describe: 'Install text to speech extension and other support',
  builder(yargs) {
    return yargs.option('unattended', {
      desc: 'Fail if installation requires human intervention',
      boolean: true,
    });
  },
  async handler({ unattended }) {
    const installDelegate = loadOsModule('install', {
      darwin: () => require('../install/macos'),
      win32: () => require('../install/win32'),
    });
    await installDelegate.install({ unattended });
  },
});
