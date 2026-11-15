"""Ready for a real Sunday: feedback, helper-only mode, the setup guide, the wording check,
and the tablet asking the live link to wake the lead's phone when Help is pressed."""
import json
import os
import subprocess
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PORT = '8798'
BASE = f'http://127.0.0.1:{PORT}'
env = {**os.environ, 'PORT': PORT, 'HOST': '127.0.0.1', 'TRUST_PROXY': '0', 'ALLOWED_ORIGINS': BASE, 'REQUESTS_PER_MINUTE': '5000'}
server = subprocess.Popen(['node', str(ROOT / 'server' / 'server.mjs')], env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
STATE = "JSON.parse(localStorage.getItem('helper-jobs.state.v1'))"


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
        context = browser.new_context(viewport={'width': 1024, 'height': 1300}, reduced_motion='reduce', accept_downloads=True)
        page = context.new_page()
        page.set_default_timeout(8000)
        page.on('pageerror', lambda exc: errors.append(str(exc)))
        page.on('dialog', lambda dialog: dialog.accept())
        page.clock.install()
        page.goto(BASE + '/?fresh=1', wait_until='networkidle')

        page.get_by_role('button', name='I’m the volunteer lead').click()
        enter_pin(page, '5821'); enter_pin(page, '5821')
        page.wait_for_selector('#lead-setup-outing.active')
        page.locator('input[name="helper-present"][value="helper-asha"]').check()
        page.locator('input[name="kid-present"][value="kid-eli"]').check()
        page.get_by_role('button', name='Start live board').click()

        # Pair a phone; Help then asks the live link to wake it.
        page.get_by_role('button', name='Lead’s phone').click()
        page.locator('[data-action="phone-link"]').click()
        page.wait_for_selector('#pair-qr svg')
        phone = browser.new_context(viewport={'width': 390, 'height': 844}).new_page()
        phone.on('pageerror', lambda exc: errors.append(f'phone: {exc}'))
        phone.goto(page.locator('#pair-qr').get_attribute('data-url'))
        phone.wait_for_selector('#phone-helpers article')
        assert phone.locator('#wake-box').is_visible() and phone.locator('#wake-on').is_visible()
        wakes = []
        page.on('request', lambda req: wakes.append(req.url) if req.url.endswith('/notify') else None)
        page.locator('[data-action="pair-back"]').click()
        page.locator('#lead-board [data-action="home"]').click()
        page.get_by_role('button', name='I’m a helper').click()
        page.locator('[data-helper="helper-asha"]').click()
        page.locator('#helper-jobs [data-action="help"]').click()
        page.wait_for_function('() => true')
        phone.wait_for_selector('.phone-alert', timeout=6000)
        page.clock.run_for(1000)
        assert wakes, 'Help asked the live link to wake the phone'
        page.locator('#helper-jobs [data-action="home"]').last.click()

        # Volunteer feedback from the board, and the lead's at wrap-up.
        page.get_by_role('button', name='I’m the volunteer lead').click()
        enter_pin(page, '5821')
        page.get_by_role('button', name='Start live board').click()
        page.get_by_role('button', name='Volunteer feedback').click()
        form = page.locator('#feedback-box form')
        form.locator('label.mood-choice:has(input[name="day"][value="happy"])').click()
        form.locator('textarea[name="harder"]').fill('Sun on the screen at the park')
        form.get_by_role('button', name='Save feedback').click()
        assert page.evaluate(f'{STATE}.feedback.length') == 1
        page.locator('#feedback [data-action="lead-board"]').click()
        page.locator('#lead-board-list .alert-ack').click()
        page.get_by_role('button', name='Skip').click()
        page.get_by_role('button', name='Wrap up outing').click()
        page.locator('[data-headcount="kid-eli"][data-value="back"]').click()
        page.locator('#wrap-feedback label.mood-choice:has(input[name="tool"][value="okay"])').click()
        page.locator('#wrap-feedback textarea[name="easier"]').fill('Everyone knew their job')
        page.locator('#finish-outing').click()
        assert page.locator('#home.active').count() == 1
        fb = page.evaluate(f'{STATE}.feedback')
        assert [item['role'] for item in fb] == ['volunteer', 'lead'], fb

        # Coordinator: sees feedback, downloads it, turns on helper-only mode.
        page.get_by_role('button', name='I’m the volunteer lead').click()
        enter_pin(page, '5821')
        page.get_by_role('button', name='Start live board').click()
        page.get_by_role('button', name='Coordinator tools').click()
        page.locator('#coordinator-pin-input').fill('7340'); page.locator('#coordinator-pin-confirm').fill('7340')
        page.get_by_role('button', name='Open coordinator tools').click()
        assert 'Everyone knew their job' in page.locator('#coordinator-notes').inner_text()
        with page.expect_download() as info:
            page.get_by_role('button', name='Download feedback').click()
        assert 'Sun on the screen' in Path(info.value.path()).read_text()
        page.locator('#device-form input[name="helperOnly"]').check()
        page.locator('#device-form').get_by_role('button', name='Save').click()
        page.locator('#coordinator [data-action="lead-board"]').first.click()
        page.locator('#lead-board [data-action="home"]').click()
        assert page.locator('#home [data-action="lead-entry"]').is_hidden(), 'no lead button in helper-only mode'
        assert page.locator('header .header-link').is_hidden()
        assert page.locator('.lead-hint').is_visible()
        # Holding the "h." for 2 seconds opens the lead PIN.
        brand = page.locator('header .brand')
        brand.dispatch_event('pointerdown')
        page.clock.run_for(2100)
        assert page.locator('#lead-pin.active').count() == 1
        page.locator('#lead-pin [data-action="home"]').click()

        # Left on the job list for 2 minutes, it goes back to "Who are you today?".
        page.get_by_role('button', name='I’m a helper').click()
        page.locator('[data-helper="helper-asha"]').click()
        page.clock.run_for(150_000)
        assert page.locator('#helper-who.active').count() == 1

        # Wording check: a fix for Hindi is used by the app on this tablet.
        words = context.new_page()
        words.on('pageerror', lambda exc: errors.append(f'wording: {exc}'))
        words.goto(BASE + '/wording.html')
        row = words.locator('.wording-row[data-line="Pick a job"]')
        row.locator('textarea').fill('अपना काम चुनो')
        row.locator('textarea').dispatch_event('change')
        row.locator('input[data-ok]').check()
        assert words.locator('#progress-count').inner_text().startswith('1 of')
        with words.expect_download() as info:
            words.get_by_role('button', name='Download my changes').click()
        saved = json.loads(Path(info.value.path()).read_text())
        assert saved['language'] == 'hi' and saved['lines'][0]['after'] == 'अपना काम चुनो'
        page.reload(wait_until='networkidle')
        page.evaluate("(() => { const s = JSON.parse(localStorage.getItem('helper-jobs.state.v1')); s.helpers.find(h => h.id === 'helper-ravi').language = 'hi'; s.outing.presentHelpers.push('helper-ravi'); localStorage.setItem('helper-jobs.state.v1', JSON.stringify(s)); })()")
        page.reload(wait_until='networkidle')
        page.get_by_role('button', name='I’m a helper').click()
        page.locator('[data-helper="helper-ravi"]').click()
        assert page.locator('#jobs-title').inner_text() == 'अपना काम चुनो'

        guide = context.new_page()
        guide.goto(BASE + '/tablet-setup.html')
        assert guide.locator('.tick-list li').count() >= 7 and guide.locator('.setup-art svg').count() == 1
        assert not errors, errors
        print('ready-ok')
        browser.close()
finally:
    server.terminate()
    server.wait(timeout=5)
