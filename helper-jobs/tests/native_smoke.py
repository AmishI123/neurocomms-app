"""The app shell's bridge, checked in a browser that pretends to be the Android app: read aloud goes to the
device voice, printing and saving go to the device, links to share point at the public site, pages open in
place, the back button never leaves the app, the screen stays on during an outing, and the coordinator can
pin the app. The real Android and iPad builds are checked on an emulator and a simulator in CI."""
import os
import subprocess
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PORT = '8808'
BASE = f'http://127.0.0.1:{PORT}'
LIVE = 'https://helper-jobs-live.onrender.com'
env = {**os.environ, 'PORT': PORT, 'HOST': '127.0.0.1', 'TRUST_PROXY': '0', 'ALLOWED_ORIGINS': BASE, 'REQUESTS_PER_MINUTE': '5000'}
server = subprocess.Popen(['node', str(ROOT / 'server' / 'server.mjs')], env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)

FAKE_APP = """
  delete Window.prototype.speechSynthesis; delete window.speechSynthesis; delete window.SpeechSynthesisUtterance;
  window.__calls = [];
  window.Capacitor = {
    isNativePlatform: () => true, getPlatform: () => 'android',
    nativePromise(plugin, method, options) {
      window.__calls.push({ plugin, method, options: options || {} });
      if (method === 'voices') return Promise.resolve({ voices: [{ lang: 'en-US', name: 'English' }, { lang: 'hi-IN', name: 'Hindi' }] });
      if (method === 'pinState') return Promise.resolve({ supported: true, pinned: sessionStorage.getItem('pinned') === '1' });
      if (method === 'pinApp') sessionStorage.setItem('pinned', '1');
      if (method === 'unpinApp') sessionStorage.removeItem('pinned');
      return Promise.resolve({});
    }
  };
"""


def enter_pin(page, digits):
    for digit in digits:
        page.locator(f'[data-pin="{digit}"]').click()
    page.locator('[data-pin="enter"]').click()


def calls(page, method):
    return page.evaluate(f"window.__calls.filter(c => c.method === '{method}')")


try:
    for _ in range(50):
        if '"port"' in server.stdout.readline().decode():
            break
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        errors, opened = [], []
        context = browser.new_context(viewport={'width': 820, 'height': 1180}, reduced_motion='reduce')
        context.add_init_script(FAKE_APP)
        # The app's live link goes to the public relay; in this test it is answered by the local one.
        context.route(f'{LIVE}/**', lambda route: route.fulfill(response=route.fetch(url=route.request.url.replace(LIVE, BASE), headers={**route.request.headers, 'origin': BASE})))
        context.route('https://helper-jobs.onrender.com/**', lambda route: (opened.append(route.request.url), route.fulfill(status=200, body='public site', content_type='text/plain')))
        page = context.new_page()
        page.set_default_timeout(8000)
        page.on('pageerror', lambda exc: errors.append(str(exc)))
        page.on('dialog', lambda dialog: dialog.accept())
        page.goto(BASE + '/?fresh=1', wait_until='networkidle')
        assert page.evaluate("document.documentElement.classList.contains('is-native')")
        assert page.evaluate("document.querySelector('meta[name=\"helper-jobs-api\"]').content") == LIVE
        assert page.evaluate("'speechSynthesis' in window && speechSynthesis.getVoices().length") == 2

        # The lead starts the day: the screen stays on.
        page.get_by_role('button', name='I’m the volunteer lead').click()
        enter_pin(page, '5821'); enter_pin(page, '5821')
        page.wait_for_selector('#lead-setup-outing.active')
        page.get_by_role('button', name='Tick everyone', exact=True).click()
        page.get_by_role('button', name='Start live board').click()
        assert any(c['options'].get('on') for c in calls(page, 'keepAwake')), calls(page, 'keepAwake')

        # Pairing the lead's phone: the code opens the public site, and the room lives on the public relay.
        page.get_by_role('button', name='Lead’s phone').click()
        page.locator('[data-action="phone-link"]').click()
        page.wait_for_selector('#pair-qr svg')
        url = page.locator('#pair-qr').get_attribute('data-url')
        assert url.startswith('https://helper-jobs.onrender.com/lead-phone.html#r='), url
        assert 'a=https%3A%2F%2Fhelper-jobs-live.onrender.com' in url, url
        page.locator('[data-action="pair-back"]').click()

        # Coordinator: the device checks know it is the app, and the app can be pinned and unpinned.
        page.get_by_role('button', name='Coordinator tools').click()
        page.locator('#coordinator-pin-input').fill('7340'); page.locator('#coordinator-pin-confirm').fill('7340')
        page.get_by_role('button', name='Open coordinator tools').click()
        page.wait_for_selector('#coordinator.active')
        assert 'Running as the Android app' in page.locator('#device-checks').inner_text()
        page.get_by_role('button', name='Pin Helper Jobs to this screen').click()
        page.get_by_role('button', name='Unpin Helper Jobs').wait_for()
        assert calls(page, 'pinApp')
        page.get_by_role('button', name='Unpin Helper Jobs').click()
        page.get_by_role('button', name='Pin Helper Jobs to this screen').wait_for()

        # Saving a file goes to the share sheet.
        page.locator('[data-action="summary"]').click()
        page.wait_for_function("window.__calls.some(c => c.method === 'saveFile')")
        saved = calls(page, 'saveFile')[0]['options']
        assert saved['name'].startswith('helper-jobs-summary-') and saved['mime'].startswith('text/csv') and len(saved['data']) > 20, saved

        # A page that opens in a new tab in the browser opens in place; printing goes to the device.
        page.locator('a[href="print-cards.html"]').first.click()
        page.wait_for_url('**/print-cards.html')
        page.wait_for_function("window.__calls !== undefined")
        page.evaluate('window.print()')
        assert page.evaluate("window.__calls.some(c => c.method === 'print')")
        # The back button returns to the app instead of closing it.
        page.evaluate('HelperJobsNative.onBack()')
        page.wait_for_url('**/index.html')

        # A helper hears the step from the device voice.
        page.get_by_role('button', name='I’m a helper').click()
        page.locator('[data-helper="helper-asha"]').click()
        page.locator('[data-job="cleanup"]').click()
        page.locator('[data-action="read"]').click()
        spoken = calls(page, 'speak')
        assert spoken and spoken[-1]['options']['lang'] == 'en-US' and spoken[-1]['options']['text'], spoken
        # Back on a helper screen goes back one screen, not out of the app.
        page.evaluate('HelperJobsNative.onBack()')
        page.wait_for_selector('#helper-jobs.active')

        # The slides are not inside the app: they open on the public site.
        page.evaluate("HelperJobsNative.onBack()")
        page.locator('#home').wait_for(state='attached')
        page.goto(BASE + '/index.html')
        with page.expect_request(lambda req: req.url.startswith('https://helper-jobs.onrender.com/presentation/')):
            page.locator('a.header-link[href="presentation/"]').click()

        # The plain website is unchanged: no app bridge, and pairing codes use the site's own address.
        web = browser.new_context(viewport={'width': 820, 'height': 1180}).new_page()
        web.goto(BASE + '/', wait_until='networkidle')
        assert web.evaluate('HelperJobsNative.isNative') is False
        assert not web.evaluate("document.querySelector('meta[name=\"helper-jobs-api\"]')")
        assert not errors, errors
        browser.close()
    print('native-bridge-ok')
finally:
    server.terminate()
