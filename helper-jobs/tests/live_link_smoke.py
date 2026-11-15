"""Two devices end to end: the outing tablet pairs with the lead's phone through the live link server.
Help on the tablet reaches the phone, and "I'm here" on the phone closes it on the tablet."""
import json
import os
import subprocess
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PORT = '8796'
BASE = f'http://127.0.0.1:{PORT}'
env = {**os.environ, 'PORT': PORT, 'HOST': '127.0.0.1', 'TRUST_PROXY': '0', 'ALLOWED_ORIGINS': BASE}
server = subprocess.Popen(['node', str(ROOT / 'server' / 'server.mjs')], env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)


def enter_pin(page, digits):
    for digit in digits:
        page.locator(f'[data-pin="{digit}"]').click()
    page.locator('[data-pin="enter"]').click()


try:
    for _ in range(50):
        line = server.stdout.readline().decode()
        if '"port"' in line:
            break
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        errors = []
        tablet = browser.new_context(viewport={'width': 820, 'height': 1180}, reduced_motion='reduce').new_page()
        tablet.set_default_timeout(8000)
        tablet.on('pageerror', lambda exc: errors.append(f'tablet: {exc}'))
        tablet.goto(BASE + '/', wait_until='networkidle')

        # The lead sets up the outing and matches Asha with Eli.
        tablet.get_by_role('button', name='I’m the volunteer lead').click()
        enter_pin(tablet, '5821')
        enter_pin(tablet, '5821')
        tablet.wait_for_selector('#lead-setup-outing.active')
        tablet.locator('input[name="helper-present"][value="helper-asha"]').check()
        tablet.locator('input[name="kid-present"][value="kid-eli"]').check()
        tablet.get_by_role('button', name='Start live board').click()
        tablet.get_by_role('button', name='Make assignment').click()
        tablet.select_option('#assignment-helper', 'helper-asha')
        tablet.select_option('#assignment-kid', 'kid-eli')
        tablet.select_option('#assignment-job', 'snack')
        tablet.select_option('#assignment-volunteer', 'vol-jordan')
        tablet.get_by_role('button', name='Save assignment').click()

        # Pair the lead's phone.
        tablet.get_by_role('button', name='Lead’s phone').click()
        tablet.get_by_role('button', name='Make a pairing code').click()
        tablet.wait_for_selector('#pair-qr svg')
        url = tablet.locator('#pair-qr').get_attribute('data-url')
        assert '#r=' in url and '&k=' in url, url

        phone = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce').new_page()
        phone.set_default_timeout(8000)
        phone.on('pageerror', lambda exc: errors.append(f'phone: {exc}'))
        phone.goto(url)
        phone.wait_for_selector('#phone-helpers article')
        assert 'k=' not in phone.url, 'the key is removed from the address bar'
        assert 'Asha' in phone.locator('#phone-helpers').inner_text()
        assert 'peanut' not in phone.content() and 'Ask before touching' not in phone.content(), 'no kid tips or allergies on the phone'

        # Help on the tablet reaches the phone quickly.
        tablet.locator('#lead-phone-pair [data-action="pair-back"]').click()
        tablet.locator('#lead-board [data-action="home"]').click()
        tablet.get_by_role('button', name='I’m a helper').click()
        tablet.locator('[data-helper="helper-asha"]').click()
        tablet.locator('[data-job="snack"]').click()
        started = time.time()
        tablet.locator('#helper-task [data-action="help"]').click()
        phone.wait_for_selector('.phone-alert', timeout=5000)
        took = time.time() - started
        assert took < 5, f'alert took {took:.1f}s'

        # "I'm here" on the phone closes it on the tablet.
        phone.locator('.phone-ack').click()
        tablet.wait_for_function("JSON.parse(localStorage.getItem('helper-jobs.state.v1')).helpAlerts.every(a => a.status !== 'open')", timeout=5000)
        phone.wait_for_selector('.phone-calm', timeout=5000)
        assert not errors, errors
        print(f'live-link-ok alert in {took:.2f}s')
        browser.close()
finally:
    server.terminate()
    server.wait(timeout=5)
