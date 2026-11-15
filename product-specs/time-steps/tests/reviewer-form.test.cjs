const assert = require('node:assert/strict');
const {test, before, after} = require('node:test');
const {chromium} = require('/home/mehta/neuro-divergent/communication-tool/node_modules/playwright');

const APP_URL = process.env.TIME_STEPS_REVIEW_URL || 'http://localhost:8765/product-specs/time-steps/reviewer-form.html';
let browser;
let page;

before(async () => { browser = await chromium.launch({headless:true}); page = await browser.newPage({viewport:{width:900,height:1000}}); });
after(async () => browser?.close());

test('review form validates, downloads only a fictional bounded response, and clears without saving', async () => {
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto(APP_URL, {waitUntil:'networkidle'});
  await page.getByRole('button', {name:'Download private response'}).click();
  assert.match(await page.locator('#form-status').innerText(), /Complete the required/);

  await page.locator('#reviewer-role').selectOption('accessibility');
  await page.locator('#review-date').fill('2026-09-17');
  await page.locator('#disposition').selectOption('revise');
  await page.locator('#private-confirm').check();
  for (const name of ['understand','control','accessibility','boundaries']) await page.locator(`input[name="${name}"][value="yes"]`).check();
  await page.locator('#strongest-concern').fill('The departure label should remain easy to find.');
  await page.locator('#confusing-part').fill('Nothing in this fictional run.');
  await page.locator('#missing-support').fill('No missing support observed in this engineering review.');
  await page.locator('#privacy-concern').fill('Keep the local-only message visible.');
  await page.locator('#change-trigger').fill('Stop if invalid input still produces a result.');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', {name:'Download private response'}).click();
  const download = await downloadPromise;
  assert.equal(await download.suggestedFilename(), 'time-steps-review-response.json');
  const response = JSON.parse(await download.createReadStream().then(async stream => { let text = ''; for await (const chunk of stream) text += chunk; return text; }));
  assert.equal(response.product, 'time-steps');
  assert.equal(response.fictionalOnly, true);
  assert.equal(response.rawSourceIncluded, false);
  assert.equal(response.observations.control, 'yes');
  assert.match(await page.locator('#form-status').innerText(), /Private response downloaded/);
  await page.getByRole('button', {name:'Clear form'}).click();
  assert.match(await page.locator('#form-status').innerText(), /Form cleared/);
  assert.equal(await page.locator('#strongest-concern').inputValue(), '');
  assert.equal(await page.evaluate(() => localStorage.length), 0);
  assert.equal(requests.every(url => url.startsWith(new URL(APP_URL).origin)), true, requests.join('\n'));
  await page.setViewportSize({width:320,height:900});
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), false);
  await page.getByRole('button', {name:'Download private response'}).focus();
  assert.equal(await page.evaluate(() => Array.from(document.styleSheets).some(sheet => Array.from(sheet.cssRules).some(rule => rule.selectorText?.includes(':focus-visible')))), true);
});
