'use strict';

const install = require('../install/macos');

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
    await install.install({ unattended });

    console.log('Installation completed successfully.');
  },
});
