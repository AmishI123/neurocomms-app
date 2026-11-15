// Runs Helper Jobs on an Android emulator and checks the real app, not a browser:
// it opens, a helper does a job and hears it read aloud, the lead starts the day (the screen stays on),
// the coordinator pins and unpins the app, a file goes to the share sheet, a page prints,
// and the back button stays inside the app. Screenshots and a report go to the output folder.
// Only for a dedicated emulator with made-up data: node scripts/android-journey.mjs --serial=emulator-5554 --out=journey
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const arg = name => process.argv.find(a => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const serial = arg('serial');
const out = resolve(arg('out') || 'journey');
const apk = resolve(arg('apk') || 'android/app/build/outputs/apk/debug/app-debug.apk');
const pkg = 'org.helperjobs.app';
if (!serial) { console.error('Pass --serial=<dedicated emulator>.'); process.exit(1); }
mkdirSync(out, { recursive: true });

const adb = (args, timeout = 30000) => execFileSync('adb', ['-s', serial, ...args], { encoding: 'utf8', timeout, maxBuffer: 64 * 1024 * 1024 });
const sleep = ms => new Promise(done => setTimeout(done, ms));
const shot = name => writeFileSync(join(out, `${name}.png`), execFileSync('adb', ['-s', serial, 'exec-out', 'screencap', '-p'], { maxBuffer: 64 * 1024 * 1024 }));
const top = () => { const s = adb(['shell', 'dumpsys', 'activity', 'activities']); const m = s.match(/(?:mResumedActivity|topResumedActivity)[^\n]*?\{[^ ]+ [^ ]+ ([^/ ]+)\//); return m ? m[1] : ''; };
const results = [];
const check = (name, ok, detail = '', fatal = true) => {
  results.push({ name, ok: Boolean(ok), detail, fatal });
  console.log(`${ok ? 'PASS' : fatal ? 'FAIL' : 'NOTE'} ${name}${detail ? ` · ${detail}` : ''}`);
  // In CI, show each result on the run's summary page.
  if (process.env.GITHUB_ACTIONS) console.log(`::${ok ? 'notice' : fatal ? 'error' : 'warning'}::${ok ? 'PASS' : fatal ? 'FAIL' : 'NOTE'} ${name}${detail ? ` · ${String(detail).replace(/\n/g, ' ').slice(0, 300)}` : ''}`);
};
// Taps a system button (pin confirmation and similar) by its words, using the accessibility tree.
function tapText(words) {
  let xml = '';
  try { adb(['shell', 'uiautomator', 'dump', '/sdcard/ui.xml']); xml = adb(['shell', 'cat', '/sdcard/ui.xml']); } catch (_) {}
  writeFileSync(join(out, 'ui-dump.xml'), xml || '(no dump)');
  for (const word of words) {
    // Android 11 shows "App is pinned … No thanks / Got it"; the words may sit on a button or a label inside it.
    const node = [...xml.matchAll(/<node [^>]*>/g)].map(m => m[0]).find(n => new RegExp(`text="${word}"`, 'i').test(n));
    if (!node) continue;
    const [, x1, y1, x2, y2] = node.match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/).map(Number);
    adb(['shell', 'input', 'tap', String((x1 + x2) >> 1), String((y1 + y2) >> 1)]);
    return word;
  }
  return null;
}

let device;
try {
  if (!existsSync(apk)) throw new Error(`No APK at ${apk}`);
  adb(['install', '-r', apk], 180000);
  adb(['shell', 'pm', 'clear', pkg]);
  adb(['shell', 'am', 'start', '-W', '-n', `${pkg}/.MainActivity`], 60000);
  const { _android } = await import('playwright');
  device = (await _android.devices({ omitDriverInstall: true })).find(d => d.serial() === serial);
  if (!device) throw new Error('The emulator is not available to automation.');
  device.setDefaultTimeout(60000);
  const page = await (await device.webView({ pkg }, { timeout: 60000 })).page();
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.getByRole('button', { name: 'I’m a helper' }).waitFor();
  await sleep(1500);
  shot('01-home');
  const env = await page.evaluate(() => ({ native: HelperJobsNative.isNative, platform: HelperJobsNative.platform, api: document.querySelector('meta[name="helper-jobs-api"]')?.content, ua: navigator.userAgent }));
  check('opens as the Android app', env.native && env.platform === 'android', env.ua);
  check('live link points at the public relay', env.api === 'https://helper-jobs-live.onrender.com', env.api);

  // Read aloud: the device voice engine.
  await page.waitForFunction(() => speechSynthesis.getVoices().length > 0, null, { timeout: 15000 }).catch(() => {});
  const voices = await page.evaluate(() => speechSynthesis.getVoices().map(v => v.lang));
  check('voice engine lists languages', voices.length > 0, voices.join(', '), false);
  await page.getByRole('button', { name: 'I’m a helper' }).click();
  await page.locator('[data-helper="helper-asha"]').click();
  await page.locator('[data-job="cleanup"]').click();
  await page.locator('#task-title').waitFor();
  await sleep(600);
  shot('02-helper-step');
  const spoken = await page.evaluate(() => Promise.race([
    Capacitor.nativePromise('HelperJobsDevice', 'speak', { text: 'Pick up trash. Put it in the bin.', lang: 'en-US', rate: 1 }).then(() => 'finished', e => `error: ${e.message}`),
    new Promise(done => setTimeout(() => done('still speaking after 20 s'), 20000))
  ]));
  check('reads a step aloud with the device voice', voices.length ? spoken === 'finished' : true, voices.length ? spoken : 'no voice installed on this emulator', voices.length > 0);
  await page.locator('[data-action="read"]').click();
  await sleep(800);
  const noVoiceToast = await page.locator('#toast').textContent().catch(() => '');
  check('Read aloud button works', !/not available/i.test(noVoiceToast || ''), noVoiceToast || 'no warning');

  // Back button on a helper screen goes back one screen and never closes the app.
  adb(['shell', 'input', 'keyevent', 'KEYCODE_BACK']);
  await sleep(1200);
  check('back button stays inside the app', top() === pkg, top());

  // The lead starts the day: the screen stays on.
  await page.evaluate(() => { location.href = 'index.html'; });
  await page.getByRole('button', { name: 'I’m the volunteer lead' }).click();
  for (const round of [0, 1]) { for (const d of '5821') await page.locator(`[data-pin="${d}"]`).click(); await page.locator('[data-pin="enter"]').click(); }
  await page.getByRole('button', { name: 'Tick everyone', exact: true }).click();
  await page.getByRole('button', { name: 'Start live board' }).click();
  await sleep(1500);
  shot('03-live-board');
  const windows = adb(['shell', 'dumpsys', 'window', 'windows']);
  check('screen stays on during the outing', /KEEP_SCREEN_ON/.test(windows), '', true);

  // Coordinator: device checks, then pin and unpin.
  await page.getByRole('button', { name: 'Coordinator tools' }).click();
  await page.locator('#coordinator-pin-input').fill('7340'); await page.locator('#coordinator-pin-confirm').fill('7340');
  await page.getByRole('button', { name: 'Open coordinator tools' }).click();
  await page.locator('#device-checks').scrollIntoViewIfNeeded();
  await sleep(800);
  shot('04-this-tablet');
  check('device checks know it is the app', (await page.locator('#device-checks').innerText()).includes('Running as the Android app'));
  await page.getByRole('button', { name: 'Pin Helper Jobs to this screen' }).click();
  await sleep(2500);
  shot('05-pin-confirm');
  let tapped = tapText(['Got it', 'Pin', 'Start', 'OK']);
  if (!tapped) {
    // The pin prompt can be hidden from the accessibility tree; its "Got it" sits low in the middle-right on this tablet.
    const png = execFileSync('adb', ['-s', serial, 'exec-out', 'screencap', '-p'], { maxBuffer: 64 * 1024 * 1024 });
    const w = png.readUInt32BE(16), h = png.readUInt32BE(20); // the screen as it is shown now
    adb(['shell', 'input', 'tap', String(Math.round(w * 0.626)), String(Math.round(h * 0.887))]);
    tapped = 'Got it (by position)';
  }
  await sleep(2500);
  const pinned = await page.evaluate(() => HelperJobsNative.pinState());
  shot('06-pinned');
  check('coordinator can pin the app', pinned.pinned, `confirmation: ${tapped || 'none needed'}`);
  if (pinned.pinned) {
    await page.evaluate(() => HelperJobsNative.unpinApp());
    await sleep(2000);
    check('coordinator can unpin the app', !(await page.evaluate(() => HelperJobsNative.pinState())).pinned);
  }

  // Saving a file opens the share sheet.
  await page.locator('[data-action="summary"]').click();
  await sleep(3000);
  shot('07-share-sheet');
  const sheet = top();
  check('a saved file opens the share sheet', sheet && sheet !== pkg, sheet);
  adb(['shell', 'input', 'keyevent', 'KEYCODE_BACK']);
  await sleep(1500);

  // Printing: job cards open in place, then the print screen.
  await page.locator('a[href="print-cards.html"]').first().click();
  await page.waitForURL(/print-cards\.html/);
  await sleep(1500);
  shot('08-job-cards');
  await page.evaluate(() => window.print());
  await sleep(4000);
  shot('09-print');
  const printer = top();
  check('printing opens the print screen', printer && printer !== pkg, printer);
  adb(['shell', 'input', 'keyevent', 'KEYCODE_BACK']);
  await sleep(2000);
  if (top() !== pkg) { adb(['shell', 'input', 'keyevent', 'KEYCODE_BACK']); await sleep(1500); }
  adb(['shell', 'input', 'keyevent', 'KEYCODE_BACK']);
  await page.waitForURL(/index\.html/, { timeout: 15000 }).catch(() => {});
  check('back from a printed page returns to the app', /index\.html/.test(page.url()) && top() === pkg, page.url());

  // No internet (airplane mode): the app still opens, a helper asks for Help, and the board shows it.
  adb(['shell', 'cmd', 'connectivity', 'airplane-mode', 'enable']);
  await sleep(3000);
  await page.evaluate(() => { location.href = 'index.html'; });
  await page.getByRole('button', { name: 'I’m a helper' }).click();
  await page.locator('[data-helper="helper-asha"]').click();
  await page.locator('[data-job="cleanup"]').click();
  await page.locator('#helper-task [data-action="help"]').click();
  await sleep(800);
  shot('11-help-offline');
  const offlineHelp = await page.evaluate(() => JSON.parse(localStorage.getItem('helper-jobs.state.v1')).helpAlerts.some(a => a.status === 'open' && a.helperId === 'helper-asha'));
  check('Help works with no internet', offlineHelp && await page.locator('#alert-banner').isVisible());
  adb(['shell', 'cmd', 'connectivity', 'airplane-mode', 'disable']);
  await sleep(5000);

  // The live link reaches the public relay (needs the relay deployed with the app's origin allowed).
  await page.evaluate(() => { location.href = 'index.html'; });
  await page.getByRole('button', { name: 'I’m the volunteer lead' }).click();
  for (const d of '5821') await page.locator(`[data-pin="${d}"]`).click(); await page.locator('[data-pin="enter"]').click();
  await page.getByRole('button', { name: 'Start live board' }).click().catch(() => {});
  await page.getByRole('button', { name: 'Lead’s phone' }).click();
  await page.locator('[data-action="phone-link"]').click();
  const paired = await page.locator('#pair-qr svg').waitFor({ timeout: 40000 }).then(() => true, () => false);
  shot('10-pair-phone');
  const url = paired ? await page.locator('#pair-qr').getAttribute('data-url') : '';
  check('pairing code opens the public site', !paired || url.startsWith('https://helper-jobs.onrender.com/lead-phone.html#'), url.slice(0, 60));
  check('live link reaches the public relay', paired, paired ? 'room made' : 'relay not reachable or app origin not allowed yet', false);
  check('no page errors', errors.length === 0, errors.join(' | '));
} catch (error) {
  check('journey finished', false, String(error && error.stack || error));
  try { shot('99-failure'); } catch (_) {}
} finally {
  if (device) await device.close().catch(() => {});
  const failed = results.filter(r => !r.ok && r.fatal);
  writeFileSync(join(out, 'report.json'), JSON.stringify({ finishedAt: new Date().toISOString(), serial, passed: failed.length === 0, results }, null, 1));
  console.log(failed.length ? `android-journey FAILED (${failed.length})` : 'android-journey-ok');
  process.exit(failed.length ? 1 : 0);
}
