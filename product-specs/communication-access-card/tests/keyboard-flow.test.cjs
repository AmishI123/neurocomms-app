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

test('keyboard can create, edit, hide, review, and close a card', async () => {
  await page.getByRole('button', {name:'Start blank'}).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', {name:'+ Add a section'}).focus();
  await page.keyboard.press('Enter');
  const section = page.locator('.editor-section').last();
  await section.getByRole('button', {name:'+ Add a statement to this section'}).focus();
  await page.keyboard.press('Enter');
  const text = section.locator('[data-field="item-text"]').last();
  await text.focus();
  await page.keyboard.type('Please give me time to answer.');
  const checkbox = section.locator('[data-field="item-visible"]').last();
  await checkbox.focus();
  await page.keyboard.press('Space');
  assert.equal(await checkbox.isChecked(), false);
  await page.getByRole('button', {name:'Export text'}).focus();
  await page.keyboard.press('Enter');
  const dialog = page.locator('[role="dialog"]');
  assert.equal(await dialog.isVisible(), true);
  assert.doesNotMatch(await page.locator('#dialog-content').innerText(), /Please give me time to answer/);
  await page.keyboard.press('Escape');
  assert.equal(await dialog.isVisible(), false);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'export-text');
});

test('keyboard focus remains visible on the main actions', async () => {
  const ids = [];
  for (let i = 0; i < 8; i += 1) {
    await page.keyboard.press('Tab');
    ids.push(await page.evaluate(() => document.activeElement?.id || document.activeElement?.getAttribute('aria-label') || document.activeElement?.tagName));
  }
  assert.equal(ids.some(Boolean), true);
  const focusVisibleRule = await page.evaluate(() => Array.from(document.styleSheets).some(sheet => {
    try { return Array.from(sheet.cssRules).some(rule => rule.selectorText?.includes(':focus-visible')); } catch { return false; }
  }));
  assert.equal(focusVisibleRule, true);
});

test('sharing review keeps keyboard focus inside the dialog', async () => {
  await page.getByRole('button', {name:'Export text'}).click();
  const dialog = page.locator('[role="dialog"]');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'close-dialog');
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.evaluate(() => document.activeElement.id), 'dialog-confirm');
  await page.keyboard.press('Escape');
  assert.equal(await dialog.isVisible(), false);
});
