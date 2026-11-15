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

test('accessibility tree exposes the editor and preview structure', async () => {
  const snapshot = await page.locator('main').ariaSnapshot();
  for (const text of ['heading "Make a communication-access card"', 'region "Write what helps"', 'textbox "Card title"', 'button "Try an example"', 'button "+ Add a section"', 'complementary "What others will see"', 'combobox "Size"', 'button "Share or copy text"']) assert.match(snapshot, new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  await page.getByRole('button', {name:'Try an example'}).click();
  const populated = await page.locator('main').ariaSnapshot();
  assert.match(populated, /heading "Please communicate directly with me"|textbox "Statement text"|button "Delete statement"/);
});

test('accessibility tree exposes the sharing dialog relationship', async () => {
  await page.getByRole('button', {name:'Export text'}).click();
  const snapshot = await page.locator('[role="dialog"]').ariaSnapshot();
  assert.match(snapshot, /dialog/);
  assert.match(snapshot, /heading "This is what will leave this browser"/);
  assert.match(snapshot, /Review the visible card content below/);
  assert.match(snapshot, /button "Cancel"/);
  assert.match(snapshot, /button "Continue"/);
  await page.getByRole('button', {name:'Cancel'}).click();
});
