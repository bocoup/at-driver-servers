'use strict';

const assert = require('assert');

const {
  applescript,
  execScript,
  renderScript,
  retryOnTimeout,
  runScript,
  APPLESCRIPT_TIMEOUT_ERROR,
} = require('../../lib/helpers/applescript.js');
const { parseCodePoints } = require('../../lib/helpers/parseCodePoints.js');
const { keyCodeCommand } = require('../../lib/helpers/keyCodeCommand.js');
const IS_MACOS = require('os').platform() === 'darwin';

suite('helpers/applescript', () => {
  suiteSetup(function () {
    if (!IS_MACOS) {
      this.skip();
      return;
    }
  });

  suite('parseCodePoints', () => {
    test('space', () => {
      assert.deepEqual(parseCodePoints([' ']), keyCodeCommand(['space'], []));
    });

    test('option-a', () => {
      assert.deepEqual(parseCodePoints(['\ue00a', 'a']), keyCodeCommand(['a'], ['option']));
    });

    test('command-option-shift-b', () => {
      assert.deepEqual(
        parseCodePoints(['\ue03d', '\ue00a', '\ue008', 'b']),
        keyCodeCommand(['b'], ['command', 'option', 'shift']),
      );
    });

    test('throws on null', () => {
      assert.throws(() => parseCodePoints(['\ue000']), /unknown key/);
    });

    test('throws on invalid code', () => {
      assert.throws(() => parseCodePoints(['df daf% ?']), /Invalid key code/);
    });
  });

  suite('renderScript', () => {
    test('space', () => {
      assert.deepEqual(
        renderScript(keyCodeCommand(['space'], [])),
        applescript(
          'with timeout of 5 seconds\n' +
            '    tell application "System Events"\n' +
            '        key down 49\n' +
            '        \n' +
            '        key up 49\n' +
            '        delay 0.25\n' +
            '    end tell\n' +
            'end timeout',
        ),
      );
    });

    test('option-a', () => {
      assert.deepEqual(
        renderScript(keyCodeCommand(['a'], ['option'])),
        applescript(
          'with timeout of 5 seconds\n' +
            '    tell application "System Events"\n' +
            '        key down 58\n' +
            '        key down 0\n' +
            '        \n' +
            '        key up 0\n' +
            '        delay 0.25\n' +
            '        key up 58\n' +
            '        delay 0.25\n' +
            '    end tell\n' +
            'end timeout',
        ),
      );
    });

    test('command-option-shift-b', () => {
      assert.deepEqual(
        renderScript(keyCodeCommand(['b'], ['command', 'option', 'shift'])),
        applescript(
          'with timeout of 5 seconds\n' +
            '    tell application "System Events"\n' +
            '        key down 55\n' +
            '        key down 58\n' +
            '        key down shift\n' +
            '        delay 0.05\n' +
            '        key down 11\n' +
            '        \n' +
            '        key up 11\n' +
            '        delay 0.25\n' +
            '        key up shift\n' +
            '        delay 0.25\n' +
            '        key up 58\n' +
            '        delay 0.25\n' +
            '        key up 55\n' +
            '        delay 0.25\n' +
            '    end tell\n' +
            'end timeout',
        ),
      );
    });
  });

  test('execScript', async () => {
    assert.equal(await execScript(applescript('return "hello"')), 'hello\n');
  });

  suite('retryOnTimeout', () => {
    test('retries on time out', async () => {
      let i = 0;
      assert.equal(
        await retryOnTimeout(async () => {
          if (i++ === 0) {
            await new Promise(resolve => setTimeout(resolve, 1));
            throw new Error(APPLESCRIPT_TIMEOUT_ERROR);
          }
          return 'retried';
        }),
        'retried',
      );
      assert.equal(i, 2);
    });

    test('rethrows unexpected error', async () => {
      await assert.rejects(async () => {
        await retryOnTimeout(async () => {
          throw new Error('Not a time out');
        });
      }, /Not a time out/);
    });

    test('rethrows timeout after too many retries', async () => {
      await assert.rejects(async () => {
        await retryOnTimeout(async () => {
          throw new Error(APPLESCRIPT_TIMEOUT_ERROR);
        });
      }, new RegExp(APPLESCRIPT_TIMEOUT_ERROR));
    });
  });

  test('runScript', async () =>
    assert.equal(await runScript(applescript('return "hello"')), 'hello\n'));
});
