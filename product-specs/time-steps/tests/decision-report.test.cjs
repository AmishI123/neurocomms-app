const assert = require('node:assert/strict');
const {test, before, after} = require('node:test');
const {chromium} = require('/home/mehta/neuro-divergent/communication-tool/node_modules/playwright');

const APP_URL = process.env.TIME_STEPS_REPORT_URL || 'http://localhost:8765/product-specs/time-steps/decision-report.html';
let browser;
let page;

before(async () => { browser = await chromium.launch({headless:true}); page = await browser.newPage({viewport:{width:1280,height:1000}}); });
after(async () => browser?.close());

test('decision report renders at desktop and narrow widths without external requests', async () => {
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto(APP_URL, {waitUntil:'networkidle'});
  assert.equal(await page.title(), 'Time Steps · decision report');
  assert.match(await page.locator('main').innerText(), /Keep the product as a controlled prototype/);
  assert.match(await page.locator('main').innerText(), /What we cannot claim/);
  assert.ok(await page.locator('a[href="reviewer-guide.md"]').count() >= 1);
  assert.ok(await page.locator('a[href="reviewer-form.html"]').count() >= 1);
  await page.setViewportSize({width:320,height:900});
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), false);
  assert.equal(requests.every(url => url.startsWith(new URL(APP_URL).origin)), true, requests.join('\n'));
});
