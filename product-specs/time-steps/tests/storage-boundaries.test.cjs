const assert = require('node:assert/strict');
const {test, before, after} = require('node:test');
const {chromium} = require('/home/mehta/neuro-divergent/communication-tool/node_modules/playwright');
const {startStaticServer, closeStaticServer} = require('./static-server.cjs');

const externalUrl = process.env.TIME_STEPS_URL;
let browser;
let server; let appUrl;
before(async () => { const local = await startStaticServer(); server = local.server; appUrl = externalUrl || local.url('/product-specs/time-steps/index.html'); });
after(async () => { await browser?.close(); await closeStaticServer(server); });

test('rejects malformed saved data and keeps a canceled delete', async () => {
  browser = await chromium.launch({headless:true});
  const page = await browser.newPage({viewport:{width:1280,height:900}});
  await page.goto(appUrl, {waitUntil:'networkidle'});
  await page.evaluate(() => localStorage.setItem('show-me-time-steps.v1', JSON.stringify({appointment:42, preparation:'not-minutes'})));
  await page.reload({waitUntil:'networkidle'});
  assert.match(await page.locator('#save-status').innerText(), /could not be read/i);
  assert.equal(await page.locator('#appointment').inputValue(), '');

  await page.getByRole('button', {name:'Try an example'}).click();
  await page.getByRole('button', {name:'Save on this device'}).click();
  const saved = await page.evaluate(() => localStorage.getItem('show-me-time-steps.v1'));
  page.once('dialog', dialog => dialog.dismiss());
  await page.getByRole('button', {name:'Delete saved calculation'}).click();
  assert.equal(await page.evaluate(() => localStorage.getItem('show-me-time-steps.v1')), saved);
});
