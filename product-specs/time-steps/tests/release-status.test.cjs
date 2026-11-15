const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('release status page is plain-language and keeps all open gates visible', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'release-status.html'), 'utf8');
  assert.match(html, /controlled technical preview/);
  assert.match(html, /unsigned/);
  assert.match(html, /Xcode and CocoaPods/);
  assert.match(html, /No participant/);
  assert.match(html, /time-steps:release-candidate/);
  assert.match(html, /fictional-only/);
  assert.match(html, /24 explicit files/);
  assert.doesNotMatch(html, /fetch\(|XMLHttpRequest|navigator\.sendBeacon/);
});
