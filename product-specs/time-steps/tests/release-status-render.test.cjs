const assert = require('node:assert/strict');
const {test, before, after} = require('node:test');
const {chromium} = require('/home/mehta/neuro-divergent/communication-tool/node_modules/playwright');
const {startStaticServer, closeStaticServer} = require('./static-server.cjs');

const externalUrl = process.env.TIME_STEPS_STATUS_URL;
let browser;
let page;
let server;
let appUrl;

before(async () => {
  const local = await startStaticServer();
  server = local.server;
  appUrl = externalUrl || local.url('/product-specs/time-steps/release-status.html');
  browser = await chromium.launch({headless: true});
  page = await browser.newPage({viewport: {width: 1280, height: 1000}});
});

after(async () => { await browser?.close(); await closeStaticServer(server); });

test('release status renders as a readable, self-contained handoff', async () => {
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto(appUrl, {waitUntil: 'networkidle'});

  assert.equal(await page.title(), 'Time Steps · release status');
  const text = await page.locator('main').innerText();
  assert.match(text, /What is ready, and what is not/);
  assert.match(text, /keep this as a controlled technical preview/i);
  assert.match(text, /Do not claim/);
  assert.match(text, /One safe review path/);
  assert.match(text, /Refresh the advisory judge/);
  assert.match(text, /time-steps:judge-freshness/);
  assert.match(text, /do not edit the report by hand/);
  assert.match(text, /fictional task/);
  assert.match(text, /Keep the downloaded response outside this repository/);
  assert.ok(await page.locator('a[href="index.html"]').count() >= 1);
  assert.ok(await page.locator('a[href="decision-report.html"]').count() >= 1);
  assert.ok(await page.locator('a[href="reviewer-guide.md"]').count() >= 1);
  assert.ok(await page.locator('a[href="reviewer-form.html"]').count() >= 1);
  assert.ok(await page.locator('a[href="native-platform-handoff.md"]').count() >= 1);
  assert.ok(await page.locator('a[href="../../artifacts/time-steps/time-steps-technical-preview.tar.gz"]').count() >= 1);

  await page.setViewportSize({width: 320, height: 900});
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), false);
  assert.equal(await page.locator('h1').isVisible(), true);
  assert.equal(requests.every(url => url.startsWith(new URL(appUrl).origin)), true, requests.join('\n'));
});
