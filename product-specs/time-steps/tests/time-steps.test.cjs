const assert = require('node:assert/strict');
const {test, before, after} = require('node:test');
const {chromium} = require('/home/mehta/neuro-divergent/communication-tool/node_modules/playwright');
const {startStaticServer, closeStaticServer} = require('./static-server.cjs');
const externalUrl = process.env.TIME_STEPS_URL;
let browser; let page;
let server; let appUrl;
before(async () => { const local = await startStaticServer(); server = local.server; appUrl = externalUrl || local.url('/product-specs/time-steps/index.html'); browser = await chromium.launch({headless:true}); page = await browser.newPage({viewport:{width:1280,height:900}}); await page.goto(appUrl, {waitUntil:'networkidle'}); await page.evaluate(() => localStorage.clear()); await page.reload({waitUntil:'networkidle'}); });
after(async () => { await browser?.close(); await closeStaticServer(server); });

test('loads with labelled controls and no external resources', async () => {
  assert.equal(await page.title(), 'Show me the time steps');
  const controls = await page.locator('input,select,button').evaluateAll(elements => elements.map(element => ({id:element.id, name:element.getAttribute('aria-label') || element.labels?.[0]?.innerText || element.innerText.trim()})));
  assert.equal(controls.every(control => control.name), true, JSON.stringify(controls));
  const requests = []; page.on('request', request => requests.push(request.url())); await page.reload({waitUntil:'networkidle'}); assert.equal(requests.every(url => url.startsWith(new URL(appUrl).origin)), true);
});

test('calculates visible steps and updates when an assumption changes', async () => {
  await page.getByRole('button', {name:'Try an example'}).click();
  assert.match(await page.locator('#result').innerText(), /09:00|9:00/); assert.match(await page.locator('#result').innerText(), /09:20|9:20/); assert.match(await page.locator('#result').innerText(), /10:00/);
  await page.locator('#travel').fill('45');
  assert.match(await page.locator('#result').innerText(), /09:05|9:05/);
});

test('shows a specific warning when an edited assumption becomes invalid', async () => {
  await page.getByRole('button', {name:'Try an example'}).click();
  await page.locator('#travel').fill('-1');
  assert.match(await page.locator('#result').innerText(), /between 0 and 1440|whole number/);
  assert.doesNotMatch(await page.locator('#result').innerText(), /Enter the appointment and minutes/);
});

test('renders a label as text instead of interpreting markup', async () => {
  await page.getByRole('button', {name:'Try an example'}).click();
  await page.locator('#label').fill('<img src=x onerror=alert(1)>');
  await page.getByRole('button', {name:'Show my time steps'}).click();
  assert.match(await page.locator('#result').innerText(), /<img src=x onerror=alert\(1\)>/);
  assert.equal(await page.locator('#result img').count(), 0);
});

test('rejects missing and unsafe values without inventing a result', async () => {
  await page.evaluate(() => localStorage.clear());
  await page.reload({waitUntil:'networkidle'});
  await page.getByRole('button', {name:'Show my time steps'}).click(); assert.match(await page.locator('#result').innerText(), /Choose an appointment/);
  await page.getByRole('button', {name:'Try an example'}).click(); await page.locator('#travel').fill('-1'); await page.getByRole('button', {name:'Show my time steps'}).click(); assert.match(await page.locator('#result').innerText(), /between 0 and 1440|whole number/);
});

test('shows the previous date when calculation crosses midnight and saves locally', async () => {
  await page.locator('#appointment').fill('2026-09-18T00:10'); await page.locator('#preparation').fill('20'); await page.locator('#travel').fill('30'); await page.locator('#spare').fill('10'); await page.getByRole('button', {name:'Show my time steps'}).click();
  assert.match(await page.locator('#result').innerText(), /Sep 17|17/); await page.getByRole('button', {name:'Save on this device'}).click(); assert.match(await page.locator('#save-status').innerText(), /Saved on this device/); await page.reload({waitUntil:'networkidle'}); assert.equal(await page.locator('#appointment').inputValue(), '2026-09-18T00:10');
});

test('delete clears the local calculation', async () => { page.once('dialog', dialog => dialog.accept()); await page.getByRole('button', {name:'Delete saved calculation'}).click(); assert.match(await page.locator('#save-status').innerText(), /deleted/); assert.equal(await page.evaluate(() => localStorage.length), 0); });

test('narrow layout keeps focus visible and print shows only the result', async () => {
  await page.setViewportSize({width:320, height:900});
  await page.getByRole('button', {name:'Try an example'}).click();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1), false);
  await page.getByRole('button', {name:'Show my time steps'}).focus();
  assert.equal(await page.evaluate(() => Array.from(document.styleSheets).some(sheet => Array.from(sheet.cssRules).some(rule => rule.selectorText?.includes(':focus-visible')))), true);
  await page.emulateMedia({media:'print'});
  assert.equal(await page.locator('.layout > .panel').first().evaluate(element => getComputedStyle(element).display), 'none');
  assert.notEqual(await page.locator('.result-panel').evaluate(element => getComputedStyle(element).display), 'none');
  await page.emulateMedia({media:'screen'});
});
