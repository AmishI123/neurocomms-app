const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { chromium } = require('/home/mehta/neuro-divergent/communication-tool/node_modules/playwright');

const APP_URL = process.env.COMMUNICATION_CARD_URL || 'http://localhost:8765/product-specs/communication-access-card/index.html';
let browser;
let page;

before(async () => {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined });
  page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await page.goto(APP_URL, { waitUntil: 'networkidle' });
});

after(async () => { await browser?.close(); });

test('loads without external resources and has accessible landmarks', async () => {
  assert.equal(await page.title(), 'My communication-access card');
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('main').count(), 1);
  assert.equal(await page.locator('input, textarea, select').evaluateAll(els => els.every(el => el.labels?.length || el.getAttribute('aria-label'))), true);
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(requests.some(url => !url.startsWith(new globalThis.URL(APP_URL).origin)), false);
});

test('example creates editable sections and preview content', async () => {
  await page.getByRole('button', { name: 'Try an example' }).click();
  assert.equal(await page.locator('.editor-section').count(), 5);
  assert.match(await page.locator('#card-preview').innerText(), /Please communicate directly with me/);
  assert.match(await page.locator('#card-preview').innerText(), /Please give me extra time/);
  const first = page.locator('[data-field="item-text"]').first();
  await first.fill('Please wait for my chosen communication method.');
  assert.match(await page.locator('#card-preview').innerText(), /Please wait for my chosen communication method/);
});

test('hidden statements disappear from preview and exported text', async () => {
  const statement = page.locator('.statement').first();
  await statement.locator('[data-field="item-visible"]').uncheck();
  assert.doesNotMatch(await page.locator('#card-preview').innerText(), /Please speak directly to me/);
  await page.getByRole('button', { name: 'Export text' }).click();
  assert.equal(await page.locator('#privacy-dialog').isVisible(), true);
  assert.doesNotMatch(await page.locator('#dialog-content').innerText(), /Please speak directly to me/);
  await page.getByRole('button', { name: 'Cancel' }).click();
});

test('visible card can be exported as text and HTML after an explicit review', async () => {
  await page.getByRole('button', { name: 'Export text' }).click();
  const textDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Continue' }).click();
  const textDownload = await textDownloadPromise;
  assert.equal(textDownload.suggestedFilename(), 'communication-access-card.txt');
  await page.getByRole('button', { name: 'Export HTML' }).click();
  const htmlDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Continue' }).click();
  const htmlDownload = await htmlDownloadPromise;
  assert.equal(htmlDownload.suggestedFilename(), 'communication-access-card.html');
});

test('local save survives reload and clear removes the saved card', async () => {
  await page.getByRole('button', { name: 'Save on this device' }).click();
  assert.match(await page.locator('#save-state').innerText(), /Saved on this device/);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('.editor-section').count(), 5);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Delete saved card' }).click();
  assert.equal(await page.locator('.editor-section').count(), 0);
});

test('keyboard focus and narrow layout remain usable', async () => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.getByRole('button', { name: 'Start blank' }).click();
  await page.getByRole('button', { name: '+ Add a section' }).click();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  assert.equal(overflow, false);
  await page.getByRole('button', { name: 'Save on this device' }).focus();
  const focusStyle = await page.evaluate(() => Array.from(document.styleSheets).some(sheet => {
    try { return Array.from(sheet.cssRules).some(rule => rule.selectorText?.includes(':focus-visible')); } catch { return false; }
  }));
  assert.equal(focusStyle, true);
});
