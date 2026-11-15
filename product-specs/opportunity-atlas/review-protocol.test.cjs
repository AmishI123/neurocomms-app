const assert = require('node:assert/strict');
const fs = require('node:fs');
const { test } = require('node:test');
const { chromium } = require('/home/mehta/neuro-divergent/communication-tool/node_modules/playwright');

const root = '/home/mehta/neuro-divergent/product-specs/opportunity-atlas';

test('review protocol is prepared without inventing sessions', () => {
  const protocol = JSON.parse(fs.readFileSync(`${root}/review-protocol.json`, 'utf8'));
  const html = fs.readFileSync(`${root}/review-protocol.html`, 'utf8');
  assert.equal(protocol.status, 'prepared-not-run');
  assert.equal(protocol.sessionsCompleted, 0);
  assert.equal(protocol.conditions.length, 2);
  assert.equal(protocol.results.length, 0);
  assert.match(html, /Prepared, not run/);
  assert.match(html, /Current method: paper or ordinary notes/);
  assert.match(html, /Communication-access card/);
  assert.match(html, /The person can say no, pause, change the task, or stop/);
  assert.match(html, /no decision about usefulness can be made/);
});

test('review protocol renders without overflow at phone and desktop widths', async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [320, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const failures = [];
      page.on('response', response => { if (response.status() >= 400) failures.push(response.status()); });
      await page.goto('http://localhost:8765/product-specs/opportunity-atlas/review-protocol.html', { waitUntil: 'networkidle' });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      assert.equal(failures.length, 0);
      await page.close();
    }
  } finally {
    await browser.close();
  }
});
