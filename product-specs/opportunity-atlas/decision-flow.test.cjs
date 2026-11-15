const assert = require('node:assert/strict');
const { test } = require('node:test');
const { chromium } = require('/home/mehta/neuro-divergent/communication-tool/node_modules/playwright');

const URL = 'http://localhost:8765/product-specs/communication-access-card/index.html';

test('the selected communication-card task works from example to reviewed export', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [320, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      await page.goto(URL, { waitUntil: 'networkidle' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle' });

      await page.getByRole('button', { name: 'Try an example' }).click();
      const first = page.locator('[data-field="item-text"]').first();
      const second = page.locator('[data-field="item-text"]').nth(1);
      await first.fill('Please wait for my chosen communication method.');
      await second.locator('xpath=..').locator('[data-field="item-visible"]').uncheck();
      assert.match(await page.locator('#card-preview').innerText(), /Please wait for my chosen communication method/);
      assert.doesNotMatch(await page.locator('#card-preview').innerText(), /Please say my name/);

      await page.getByRole('button', { name: 'Save on this device' }).click();
      await page.reload({ waitUntil: 'networkidle' });
      assert.match(await page.locator('#save-state').innerText(), /Saved (on this device|card loaded from this device)/);
      assert.match(await page.locator('#card-preview').innerText(), /Please wait for my chosen communication method/);

      await page.getByRole('button', { name: 'Export text' }).click();
      assert.equal(await page.locator('#privacy-dialog').isVisible(), true);
      assert.doesNotMatch(await page.locator('#dialog-content').innerText(), /Please say my name/);
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Continue' }).click();
      assert.equal((await downloadPromise).suggestedFilename(), 'communication-access-card.txt');

      page.once('dialog', dialog => dialog.accept());
      await page.getByRole('button', { name: 'Delete saved card' }).click();
      assert.equal(await page.locator('.editor-section').count(), 0);
      await context.close();
    }
  } finally {
    await browser.close();
  }
});
