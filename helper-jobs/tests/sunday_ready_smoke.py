"""Before the first Sunday: a native speaker fixes the wording from their own phone (also while offline),
the outing keeps working when the internet drops (and Help reaches the lead's phone when it is back),
the screen-on check, and the "put it on the home screen" card on a tablet's first visit."""
import os
import subprocess
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PORT = '8811'
BASE = f'http://127.0.0.1:{PORT}'
env = {**os.environ, 'PORT': PORT, 'HOST': '127.0.0.1', 'TRUST_PROXY': '0', 'ALLOWED_ORIGINS': BASE, 'REQUESTS_PER_MINUTE': '5000'}
server = subprocess.Popen(['node', str(ROOT / 'server' / 'server.mjs')], env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
FIXES = "JSON.parse(localStorage.getItem('helper-jobs.wording.v1') || '{}')"
IPAD = 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'


def enter_pin(page, digits):
    for digit in digits:
        page.locator(f'[data-pin="{digit}"]').click()
    page.locator('[data-pin="enter"]').click()


try:
    for _ in range(50):
        if '"port"' in server.stdout.readline().decode():
            break
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        errors = []
        tablet_context = browser.new_context(viewport={'width': 820, 'height': 1180}, reduced_motion='reduce')
        tablet = tablet_context.new_page()
        tablet.set_default_timeout(10000)
        tablet.on('pageerror', lambda exc: errors.append(f'tablet: {exc}'))
        tablet.on('dialog', lambda dialog: dialog.accept())
        tablet.goto(BASE + '/?fresh=1', wait_until='networkidle')
        # A desktop browser does not get the home-screen card.
        assert tablet.locator('#install-card').is_hidden()

        tablet.get_by_role('button', name='I’m the volunteer lead').click()
        enter_pin(tablet, '5821'); enter_pin(tablet, '5821')
        tablet.wait_for_selector('#lead-setup-outing.active')
        tablet.get_by_role('button', name='Tick everyone', exact=True).click()
        tablet.get_by_role('button', name='Start live board').click()
        tablet.get_by_role('button', name='Make assignment').click()
        tablet.select_option('#assignment-helper', 'helper-asha'); tablet.select_option('#assignment-kid', 'kid-eli')
        tablet.select_option('#assignment-job', 'snack'); tablet.select_option('#assignment-volunteer', 'vol-jordan')
        tablet.get_by_role('button', name='Save assignment').click()

        # 1. Wording from a native speaker's own phone.
        tablet.get_by_role('button', name='Coordinator tools').click()
        tablet.locator('#coordinator-pin-input').fill('7340'); tablet.locator('#coordinator-pin-confirm').fill('7340')
        tablet.get_by_role('button', name='Open coordinator tools').click()
        tablet.wait_for_selector('#coordinator.active')
        assert 'The screen stays on while an outing is live' in tablet.locator('#device-checks').inner_text()
        tablet.get_by_role('button', name='Send it to someone’s phone').click()
        tablet.get_by_role('button', name='Make a wording link').click()
        tablet.wait_for_selector('#pair-qr svg')
        url = tablet.locator('#pair-qr').get_attribute('data-url')
        assert '/wording.html#r=' in url, url
        reviewer_context = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
        reviewer = reviewer_context.new_page()
        reviewer.set_default_timeout(10000)
        reviewer.on('pageerror', lambda exc: errors.append(f'reviewer: {exc}'))
        reviewer.goto(url)
        reviewer.wait_for_function("document.querySelector('#review-status').textContent.startsWith('Connected')")
        assert 'k=' not in reviewer.url and reviewer.locator('#review-banner').is_visible()
        assert 'Asha' not in reviewer.content() and 'Eli' not in reviewer.content(), 'no people on the wording link'
        row = reviewer.locator('[data-line="Take a break"]')
        row.locator('[data-edit]').fill('थोड़ा आराम कर लो')
        row.locator('[data-edit]').blur()
        row.locator('[data-ok]').check()
        tablet.wait_for_function(f"({FIXES}).hi && ({FIXES}).hi['Take a break'] && ({FIXES}).hi['Take a break'].ok", timeout=15000)
        assert tablet.evaluate("HelperJobsI18n.t('Take a break', 'hi')") == 'थोड़ा आराम कर लो'
        # Offline on the phone: the fix waits, then arrives.
        reviewer_context.set_offline(True)
        row2 = reviewer.locator('[data-line="I’m ready"]')
        row2.locator('[data-ok]').check()
        reviewer.wait_for_function("document.querySelector('#review-status').textContent.includes('will send')")
        reviewer_context.set_offline(False)
        reviewer.evaluate("window.dispatchEvent(new Event('online'))")
        tablet.wait_for_function(f"({FIXES}).hi && ({FIXES}).hi['I’m ready'] && ({FIXES}).hi['I’m ready'].ok", timeout=20000)
        tablet.locator('#lead-phone-pair [data-action="pair-back"]').click()

        # 2. The outing keeps going without internet.
        tablet.locator('#coordinator [data-action="lead-board"]').first.click()
        tablet.get_by_role('button', name='Lead’s phone').click()
        tablet.get_by_role('button', name='Make a pairing code').click()
        tablet.wait_for_selector('#pair-qr svg')
        phone = browser.new_context(viewport={'width': 390, 'height': 844}).new_page()
        phone.set_default_timeout(10000)
        phone.on('pageerror', lambda exc: errors.append(f'phone: {exc}'))
        phone.goto(tablet.locator('#pair-qr').get_attribute('data-url'))
        phone.wait_for_selector('#phone-helpers article')
        # The app is saved on the tablet by its service worker (it takes over after the first reload).
        tablet.evaluate('navigator.serviceWorker.ready')
        if not tablet.evaluate('Boolean(navigator.serviceWorker.controller)'):
            tablet.reload(wait_until='networkidle')
        tablet.wait_for_function('Boolean(navigator.serviceWorker.controller)', timeout=15000)
        tablet_context.set_offline(True)
        tablet.reload()
        tablet.get_by_role('button', name='I’m a helper').wait_for()
        tablet.get_by_role('button', name='I’m a helper').click()
        tablet.locator('[data-helper="helper-asha"]').click()
        tablet.locator('[data-job="snack"]').click()
        tablet.locator('#helper-task [data-action="help"]').click()
        assert tablet.evaluate("JSON.parse(localStorage.getItem('helper-jobs.state.v1')).helpAlerts.some(a => a.status === 'open' && a.helperId === 'helper-asha')")
        assert tablet.locator('#alert-banner').is_visible(), 'Help shows on the tablet without internet'
        assert phone.locator('.phone-alert').count() == 0
        tablet_context.set_offline(False)
        tablet.evaluate("window.dispatchEvent(new Event('online'))")
        started = time.time()
        phone.wait_for_selector('.phone-alert', timeout=20000)
        print(f'help sent after the internet came back, in {time.time() - started:.1f}s')

        # 3. First visit on an iPad in Safari: the card shows the iPad steps, and "Not now" sticks.
        ipad_context = browser.new_context(viewport={'width': 820, 'height': 1180}, user_agent=IPAD, has_touch=True, is_mobile=True)
        ipad = ipad_context.new_page()
        ipad.on('pageerror', lambda exc: errors.append(f'ipad: {exc}'))
        ipad.goto(BASE + '/?fresh=1', wait_until='networkidle')
        card = ipad.locator('#install-card')
        assert card.is_visible() and 'Add to Home Screen' in card.inner_text(), card.inner_text()
        ipad.get_by_role('button', name='Not now').click()
        assert card.is_hidden()
        ipad.reload()
        assert ipad.locator('#install-card').is_hidden()
        assert not errors, errors
        browser.close()
    print('sunday-ready-ok')
finally:
    server.terminate()
