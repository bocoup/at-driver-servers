/// <reference path="./types.js" />

'use strict';

const { runScript, renderScript } = require('../helpers/applescript');
const { parseCodePoints } = require('../helpers/parseCodePoints');

const userIntent = /** @type {ATDriverModules.InteractionUserIntent} */ (
  async function (websocket, { name, keys }) {
    if (name !== 'pressKeys') {
      throw new Error('unknown user intent');
    }
    await runScript(renderScript(parseCodePoints(keys)));
    return {};
  }
);

module.exports = /** @type {ATDriverModules.Interaction} */ ({
  'interaction.userIntent': userIntent,
});
