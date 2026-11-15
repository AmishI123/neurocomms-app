const assert = require('node:assert/strict');
const {test, before, after} = require('node:test');
const {chromium} = require('/home/mehta/neuro-divergent/communication-tool/node_modules/playwright');

const APP_URL = process.env.COMMUNICATION_CARD_URL || 'http://localhost:8765/product-specs/communication-access-card/index.html';
let browser;
let page;

before(async () => {
  browser = await chromium.launch({headless:true, executablePath: process.env.CHROMIUM_PATH || undefined});
  page = await browser.newPage({viewport:{width:390, height:900}});
  await page.goto(APP_URL, {waitUntil:'networkidle'});
});
after(async () => browser?.close());

function accessibleControlAudit() {
  return [...document.querySelectorAll('button, input, textarea, select')].map(element => ({
    tag: element.tagName.toLowerCase(),
    id: element.id,
    name: element.getAttribute('aria-label') || element.getAttribute('aria-labelledby') || element.labels?.[0]?.textContent?.trim() || element.textContent?.trim() || ''
  }));
}

test('all initial and dynamic controls have accessible names', async () => {
  const initial = await page.evaluate(accessibleControlAudit);
  assert.ok(initial.length > 0);
  assert.equal(initial.every(control => control.name.length > 0), true, JSON.stringify(initial.filter(control => !control.name.length)));
  await page.getByRole('button', {name:'Try an example'}).click();
  const dynamic = await page.evaluate(accessibleControlAudit);
  assert.equal(dynamic.every(control => control.name.length > 0), true, JSON.stringify(dynamic.filter(control => !control.name.length)));
});

test('sharing dialog exposes its title and description to assistive technology', async () => {
  await page.getByRole('button', {name:'Export text'}).click();
  const dialog = page.locator('[role="dialog"]');
  assert.equal(await dialog.getAttribute('aria-labelledby'), 'dialog-title');
  assert.equal(await dialog.getAttribute('aria-describedby'), 'dialog-copy');
  assert.equal(await page.locator('#dialog-title').innerText(), 'This is what will leave this browser');
  assert.equal(await page.locator('#dialog-copy').count(), 1);
  await page.getByRole('button', {name:'Cancel'}).click();
});

test('status messages are available to assistive technology', async () => {
  assert.equal(await page.locator('#save-state').getAttribute('aria-live'), 'polite');
  assert.equal(await page.locator('#toast').getAttribute('aria-live'), 'polite');
  assert.equal(await page.locator('#toast').getAttribute('aria-atomic'), 'true');
});
