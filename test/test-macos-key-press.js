/**
 * Integration tests for maOS key press simulation
 *
 * The application code uses a poorly-documented and inconsistent AppleScript
 * API to simulate key presses. The series of tests defined in this file give
 * the maintainers some confidence that the changes they make have the intended
 * effect and do not regress existing functionality.
 *
 * The tests operate by opening a web browser, navigating to a page designed to
 * log key presses, simulating key presses, and comparing the events logged by
 * the browser with the expected sequence.
 *
 * ## Testing Deficiency #1
 *
 * Browsers typically reserve "Control + Tab" to switch between UI tabs. Since
 * only one UI tab is available in the test environment, this causes the
 * document to "miss" the "keydown" event for the "tab" key but not the
 * corresponding "keyup" event.
 *
 * ## Testing Deficiency #2
 *
 * As of macOS 13.6.9, the "Mission Control" application consumes "Control +
 * ArrowLeft" (and all other "Control"/arrow-key combinations). Although the
 * application could be halted in service of these tests, such automation would
 * be prohibitively disruptive for local development.
 */
'use strict';
const assert = require('assert');

const { Builder } = require('selenium-webdriver');

const { renderScript, runScript } = require('../lib/helpers/applescript');
const { KeyCodeCommandKind } = require('../lib/helpers/keyCodeCommand');

// Allow for longer delays when starting the browsing session when executing
// these tests in resource-constrained continuous-integration environments.
const WEBDRIVER_SESSION_TIMEOUT = process.env.CI ? 20 * 1000 : 10 * 1000;
const documentHTML = `<!DOCTYPE html>
<html lang="en">
  <body>
    <pre id="log"></pre>
    <script>
      function capture(event) {
        document.querySelector('#log').innerText += event.type + ':' + event.key + '\\n';
        // Prevent "tab" key from navigating focus outside of the document
        event.preventDefault();
      }
      document.body.addEventListener('keyup', capture);
      document.body.addEventListener('keydown', capture);
    </script>
  </body>
</html>`;
const documentURL = `data:text/html;base64,${btoa(documentHTML)}`;

const readLog = async driver => {
  const raw = await driver.executeScript('return document.querySelector("#log").innerText');
  return raw.trim().split('\n');
};

const keyTestDriverRef = (getDriver, title, keyCodes, modifiers, expected) => {
  test(title, async function () {
    const driver = getDriver();

    await driver.navigate().to(documentURL);

    await runScript(renderScript({ kind: KeyCodeCommandKind, keyCodes, modifiers }));

    // It is possible for the document-query operation (provided by `readLog`)
    // to complete before the browser has finished interpreting key presses
    // initiated by `runScript`. Press the "x" key and use its presence in the
    // log as a signal to verify that the prior sequence has been fully
    // recognized by the browser.
    await runScript(renderScript({ kind: KeyCodeCommandKind, keyCodes: ['x'], modifiers: [] }));

    let log;
    for (log = []; !isDone(log); log = await readLog(driver)) {}

    // Remove the "x" key events as they do not reflect the intended sequence.
    const actual = log.slice(0, log.length - 2);

    assert.deepEqual(actual, expected);
  });
};

const isDone = log => {
  return log[log.length - 2] === 'keydown:x' && log[log.length - 1] === 'keyup:x';
};

suite('macOS key press simulation', () => {
  let driver;
  const keyTest = keyTestDriverRef.bind(null, () => driver);

  suiteSetup(async function () {
    this.timeout(WEBDRIVER_SESSION_TIMEOUT);
    driver = await new Builder().forBrowser('firefox').build();
  });

  suiteTeardown(async () => {
    await driver.quit();
  });

  keyTest('control', [], ['control'], ['keydown:Control', 'keyup:Control']);
  keyTest('option', [], ['option'], ['keydown:Alt', 'keyup:Alt']);
  keyTest('shift', [], ['shift'], ['keydown:Shift', 'keyup:Shift']);

  keyTest(
    'control + option',
    [],
    ['control', 'option'],
    ['keydown:Control', 'keydown:Alt', 'keyup:Alt', 'keyup:Control'],
  );
  keyTest(
    'control + shift',
    [],
    ['control', 'shift'],
    ['keydown:Control', 'keydown:Shift', 'keyup:Shift', 'keyup:Control'],
  );
  keyTest(
    'option + shift',
    [],
    ['option', 'shift'],
    ['keydown:Alt', 'keydown:Shift', 'keyup:Shift', 'keyup:Alt'],
  );

  keyTest(
    'control + option + shift',
    [],
    ['control', 'option', 'shift'],
    [
      'keydown:Control',
      'keydown:Alt',
      'keydown:Shift',
      'keyup:Shift',
      'keyup:Alt',
      'keyup:Control',
    ],
  );

  keyTest('single letter ("a")', ['a'], [], ['keydown:a', 'keyup:a']);

  keyTest(
    'single letter ("a") + control',
    ['a'],
    ['control'],
    ['keydown:Control', 'keydown:a', 'keyup:a', 'keyup:Control'],
  );
  keyTest(
    'single letter ("a") + option',
    ['a'],
    ['option'],
    ['keydown:Alt', 'keydown:å', 'keyup:å', 'keyup:Alt'],
  );
  keyTest(
    'single letter ("a") + shift',
    ['a'],
    ['shift'],
    ['keydown:Shift', 'keydown:A', 'keyup:A', 'keyup:Shift'],
  );

  keyTest(
    'single letter ("a") + control + option',
    ['a'],
    ['control', 'option'],
    ['keydown:Control', 'keydown:Alt', 'keydown:å', 'keyup:å', 'keyup:Alt', 'keyup:Control'],
  );
  keyTest(
    'single letter ("a") + control + shift',
    ['a'],
    ['control', 'shift'],
    ['keydown:Control', 'keydown:Shift', 'keydown:A', 'keyup:A', 'keyup:Shift', 'keyup:Control'],
  );
  keyTest(
    'single letter ("a") + option + shift',
    ['a'],
    ['option', 'shift'],
    ['keydown:Alt', 'keydown:Shift', 'keydown:Å', 'keyup:Å', 'keyup:Shift', 'keyup:Alt'],
  );

  keyTest(
    'single letter ("a") + control + option + shift',
    ['a'],
    ['control', 'option', 'shift'],
    [
      'keydown:Control',
      'keydown:Alt',
      'keydown:Shift',
      'keydown:Å',
      'keyup:Å',
      'keyup:Shift',
      'keyup:Alt',
      'keyup:Control',
    ],
  );

  keyTest('tab', ['tab'], [], ['keydown:Tab', 'keyup:Tab']);

  keyTest(
    'tab + control (see test source code for "Testing Deficiency #1")',
    ['tab'],
    ['control'],
    ['keydown:Control', 'keyup:Tab', 'keyup:Control'],
  );
  keyTest(
    'tab + option',
    ['tab'],
    ['option'],
    ['keydown:Alt', 'keydown:Tab', 'keyup:Tab', 'keyup:Alt'],
  );
  keyTest(
    'tab + shift',
    ['tab'],
    ['shift'],
    ['keydown:Shift', 'keydown:Tab', 'keyup:Tab', 'keyup:Shift'],
  );

  keyTest(
    'tab + control + option',
    ['tab'],
    ['control', 'option'],
    ['keydown:Control', 'keydown:Alt', 'keydown:Tab', 'keyup:Tab', 'keyup:Alt', 'keyup:Control'],
  );
  keyTest(
    'tab + control + shift (see test source code for "Testing Deficiency #1")',
    ['tab'],
    ['control', 'shift'],
    ['keydown:Control', 'keydown:Shift', 'keyup:Tab', 'keyup:Shift', 'keyup:Control'],
  );
  keyTest(
    'tab + option + shift',
    ['tab'],
    ['option', 'shift'],
    ['keydown:Alt', 'keydown:Shift', 'keydown:Tab', 'keyup:Tab', 'keyup:Shift', 'keyup:Alt'],
  );

  keyTest(
    'tab + control + option + shift',
    ['tab'],
    ['control', 'option', 'shift'],
    [
      'keydown:Control',
      'keydown:Alt',
      'keydown:Shift',
      'keydown:Tab',
      'keyup:Tab',
      'keyup:Shift',
      'keyup:Alt',
      'keyup:Control',
    ],
  );

  keyTest('arrow (left arrow)', ['arrowLeft'], [], ['keydown:ArrowLeft', 'keyup:ArrowLeft']);

  keyTest(
    'arrow (left arrow) + control (see test source code for "Testing Deficiency #2")',
    ['arrowLeft'],
    ['control'],
    ['keydown:Control', 'keyup:Control'],
  );
  keyTest(
    'arrow (left arrow) + option',
    ['arrowLeft'],
    ['option'],
    ['keydown:Alt', 'keydown:ArrowLeft', 'keyup:ArrowLeft', 'keyup:Alt'],
  );
  keyTest(
    'arrow (left arrow) + shift',
    ['arrowLeft'],
    ['shift'],
    ['keydown:Shift', 'keydown:ArrowLeft', 'keyup:ArrowLeft', 'keyup:Shift'],
  );

  keyTest(
    'arrow (left arrow) + control + option',
    ['arrowLeft'],
    ['control', 'option'],
    [
      'keydown:Control',
      'keydown:Alt',
      'keydown:ArrowLeft',
      'keyup:ArrowLeft',
      'keyup:Alt',
      'keyup:Control',
    ],
  );
  keyTest(
    'arrow (left arrow) + control + shift',
    ['arrowLeft'],
    ['control', 'shift'],
    [
      'keydown:Control',
      'keydown:Shift',
      'keydown:ArrowLeft',
      'keyup:ArrowLeft',
      'keyup:Shift',
      'keyup:Control',
    ],
  );
  keyTest(
    'arrow (left arrow) + option + shift',
    ['arrowLeft'],
    ['option', 'shift'],
    [
      'keydown:Alt',
      'keydown:Shift',
      'keydown:ArrowLeft',
      'keyup:ArrowLeft',
      'keyup:Shift',
      'keyup:Alt',
    ],
  );

  keyTest(
    'arrow (left arrow) + control + option + shift',
    ['arrowLeft'],
    ['control', 'option', 'shift'],
    [
      'keydown:Control',
      'keydown:Alt',
      'keydown:Shift',
      'keydown:ArrowLeft',
      'keyup:ArrowLeft',
      'keyup:Shift',
      'keyup:Alt',
      'keyup:Control',
    ],
  );
});
