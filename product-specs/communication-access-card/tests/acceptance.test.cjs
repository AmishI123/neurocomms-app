const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const { chromium } = require('/home/mehta/neuro-divergent/communication-tool/node_modules/playwright');

const APP_URL = process.env.COMMUNICATION_CARD_URL || 'http://localhost:8765/product-specs/communication-access-card/index.html';

async function newPage(width = 1280) {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined });
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  const page = await context.newPage();
  await page.goto(APP_URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  return { browser, context, page };
}

test('print and HTML export contain only the selected card', async () => {
  const { browser, context, page } = await newPage();
  try {
    await page.getByRole('button', { name: 'Try an example' }).click();
    await page.locator('[data-field="item-visible"]').nth(1).uncheck();
    assert.doesNotMatch(await page.locator('#card-preview').innerText(), /Please say my name/);
    await page.emulateMedia({ media: 'print' });
    const printState = await page.evaluate(() => ({
      editor: getComputedStyle(document.querySelector('.editor-column')).display,
      preview: getComputedStyle(document.querySelector('.card-preview')).display,
      controls: getComputedStyle(document.querySelector('.preview-actions')).display,
      hiddenText: document.querySelector('#card-preview').innerText.includes('Please say my name')
    }));
    assert.equal(printState.editor, 'none');
    assert.notEqual(printState.preview, 'none');
    assert.equal(printState.controls, 'none');
    assert.equal(printState.hiddenText, false);
    await page.emulateMedia({ media: 'screen' });
    await page.getByRole('button', { name: 'Export HTML' }).click();
    const dialogText = await page.locator('#dialog-content').innerText();
    assert.doesNotMatch(dialogText, /Please say my name/);
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Continue' }).click();
    const download = await downloadPromise;
    const exported = fs.readFileSync(await download.path(), 'utf8');
    assert.match(exported, /Please communicate directly with me/);
    assert.match(exported, /Please speak directly to me/);
    assert.doesNotMatch(exported, /Please say my name/);
  } finally {
    await context.close();
    await browser.close();
  }
});

test('malformed local data fails safely and core use stays offline', async () => {
  const requests = [];
  const { browser, context, page } = await newPage(390);
  try {
    page.on('request', request => requests.push(request.url()));
    await page.evaluate(() => localStorage.setItem('communication-access-card.v1', '{not-json'));
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('#sections .empty-editor').count(), 1);
    assert.match(await page.locator('#save-state').innerText(), /could not be read/);
    assert.equal(requests.some(url => !url.startsWith(new globalThis.URL(APP_URL).origin)), false);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Start blank' }).click();
    assert.equal(await page.locator('#sections .empty-editor').count(), 1);
  } finally {
    await context.close();
    await browser.close();
  }
});

test('sharing review supports a controlled clipboard fallback', async () => {
  const { browser, context, page } = await newPage();
  try {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__copiedCard = text; } } });
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Try an example' }).click();
    await page.locator('[data-field="item-visible"]').nth(1).uncheck();
    await page.getByRole('button', { name: 'Share or copy text' }).click();
    assert.equal(await page.locator('#privacy-dialog').isVisible(), true);
    await page.getByRole('button', { name: 'Continue' }).click();
    const copied = await page.evaluate(() => window.__copiedCard || '');
    assert.match(copied, /Please speak directly to me/);
    assert.doesNotMatch(copied, /Please say my name/);
  } finally {
    await context.close();
    await browser.close();
  }
});

test('privacy dialog has a name, Escape closes it, and focus returns', async () => {
  const { browser, context, page } = await newPage();
  try {
    await page.getByRole('button', { name: 'Try an example' }).click();
    const trigger = page.getByRole('button', { name: 'Export text' });
    await trigger.click();
    assert.equal(await page.locator('[role="dialog"]').getAttribute('aria-labelledby'), 'dialog-title');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#privacy-dialog').isVisible(), false);
    assert.equal(await page.evaluate(() => document.activeElement.id), 'export-text');
  } finally {
    await context.close();
    await browser.close();
  }
});
