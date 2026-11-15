const assert = require('node:assert/strict');
const {test, before, after} = require('node:test');
const {chromium} = require('/home/mehta/neuro-divergent/communication-tool/node_modules/playwright');
const {startStaticServer, closeStaticServer} = require('./static-server.cjs');

const externalUrl = process.env.TIME_STEPS_URL;
let browser;
let server; let appUrl;
before(async () => { const local = await startStaticServer(); server = local.server; appUrl = externalUrl || local.url('/product-specs/time-steps/index.html'); });
after(async () => { await browser?.close(); await closeStaticServer(server); });

test('refuses a calculation that crosses a daylight-saving offset change', async () => {
  browser = await chromium.launch({headless:true});
  const context = await browser.newContext({timezoneId:'America/New_York'});
  const page = await context.newPage({viewport:{width:1280,height:900}});
  await page.goto(appUrl, {waitUntil:'networkidle'});
  await page.locator('#appointment').fill('2026-03-08T04:00');
  await page.locator('#preparation').fill('30');
  await page.locator('#travel').fill('150');
  await page.locator('#spare').fill('0');
  await page.getByRole('button', {name:'Show my time steps'}).click();
  assert.match(await page.locator('#result').innerText(), /daylight-saving time change/i);
  assert.equal(await page.locator('.steps').count(), 0);
  await context.close();
});
