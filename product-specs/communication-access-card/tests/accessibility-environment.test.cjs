const test = require('node:test');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const path = require('node:path');

test('accessibility environment report does not overclaim assistive-technology testing', () => {
  const root = path.resolve(__dirname, '..');
  const report = JSON.parse(execFileSync(process.execPath, ['accessibility-environment.mjs', '--output=/tmp/communication-card-accessibility-environment-test.json'], {cwd: root, encoding:'utf8'}));
  assert.equal(report.browserAccessibilityTree, true);
  assert.equal(report.screenReaderExecution, false);
  assert.equal(report.switchAccessExecution, false);
  assert.equal(report.nativeAndroidAssistiveTechnology, false);
  assert.equal(report.nativeIosAssistiveTechnology, false);
  assert.match(report.interpretation, /not claimed/i);
});
