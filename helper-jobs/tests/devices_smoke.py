"""Five devices through the live link server: the main tablet, a second helper tablet, the lead's phone,
a family page and the coordinator's laptop backup."""
import json
import os
import subprocess
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PORT = '8797'
BASE = f'http://127.0.0.1:{PORT}'
env = {**os.environ, 'PORT': PORT, 'HOST': '127.0.0.1', 'TRUST_PROXY': '0', 'ALLOWED_ORIGINS': BASE, 'REQUESTS_PER_MINUTE': '5000'}
server = subprocess.Popen(['node', str(ROOT / 'server' / 'server.mjs')], env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
MAIN = "JSON.parse(localStorage.getItem('helper-jobs.state.v1'))"


def enter_pin(page, digits):
    for digit in digits:
        page.locator(f'[data-pin="{digit}"]').click()
    page.locator('[data-pin="enter"]').click()


def device(browser, errors, name, width=820, height=1180):
    page = browser.new_context(viewport={'width': width, 'height': height}, reduced_motion='reduce', accept_downloads=True).new_page()
    page.set_default_timeout(8000)
    page.on('pageerror', lambda exc: errors.append(f'{name}: {exc}'))
    page.on('dialog', lambda dialog: dialog.accept())
    return page


def pair(tablet, button):
    tablet.get_by_role('button', name=button).click()
    tablet.locator('[data-action="phone-link"]').click()
    tablet.wait_for_selector('#pair-qr svg')
    return tablet.locator('#pair-qr').get_attribute('data-url')


try:
    for _ in range(50):
        if '"port"' in server.stdout.readline().decode():
            break
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        errors = []
        main = device(browser, errors, 'main')
        main.goto(BASE + '/', wait_until='networkidle')
        main.get_by_role('button', name='I’m the volunteer lead').click()
        enter_pin(main, '5821'); enter_pin(main, '5821')
        main.wait_for_selector('#lead-setup-outing.active')
        main.locator('input[name="helper-present"][value="helper-asha"]').check()
        main.locator('input[name="helper-present"][value="helper-ravi"]').check()
        main.locator('input[name="kid-present"][value="kid-eli"]').check()
        main.get_by_role('button', name='Start live board').click()

        # A second helper tablet joins and shows today's helpers, but no lead tools.
        join = pair(main, 'More tablets')
        assert 'index.html#r=' in join, join
        second = device(browser, errors, 'second')
        second.goto(join)
        second.wait_for_function("document.querySelector('#mirror-state').textContent === 'Live'")
        assert 'k=' not in second.url
        assert second.locator('[data-action="lead-entry"]').first.is_hidden()
        second.get_by_role('button', name='I’m a helper').click()
        second.wait_for_selector('[data-helper="helper-ravi"]')
        assert second.locator('[data-helper]').count() == 2
        stored = second.evaluate("localStorage.getItem('helper-jobs.mirror-state.v1')")
        assert 'peanut' not in stored and 'parentConsent' not in stored and 'Noor' not in stored, 'no allergy, consent or other kids on the second tablet'

        # The lead's phone makes a match and marks Mina as here.
        main.locator('#lead-phone-pair [data-action="pair-back"]').click()
        phone_url = pair(main, 'Lead’s phone')
        phone = device(browser, errors, 'phone', 390, 844)
        phone.goto(phone_url)
        phone.wait_for_selector('#phone-helpers article')
        phone.locator('#phone-match-box summary').click()
        phone.select_option('#pm-helper', 'helper-ravi')
        phone.select_option('#pm-kid', 'kid-eli')
        phone.select_option('#pm-job', 'snack')
        phone.select_option('#pm-volunteer', 'vol-kai')
        phone.get_by_role('button', name='Save match').click()
        main.wait_for_function(f"{MAIN}.assignments.some(a => a.helperId === 'helper-ravi' && a.kidId === 'kid-eli' && a.madeOn === 'phone')")
        phone.wait_for_function("document.querySelector('#toast').textContent.includes('Match saved')")
        # A match the tablet refuses comes back with the reason.
        phone.select_option('#pm-helper', 'helper-asha'); phone.select_option('#pm-job', 'buddy')
        phone.get_by_role('button', name='Save match').click()
        phone.wait_for_function("document.querySelector('#toast').textContent.includes('not unlocked')")
        phone.locator('#phone-here-box summary').click()
        phone.locator('input[data-here-kind="helper"][value="helper-mina"]').check()
        main.wait_for_function(f"{MAIN}.outing.presentHelpers.includes('helper-mina')")

        # Ravi works on the second tablet: the match arrives, Help reaches the main board and the phone.
        second.wait_for_function("JSON.parse(localStorage.getItem('helper-jobs.mirror-state.v1')).assignments.some(a => a.helperId === 'helper-ravi')")
        second.locator('[data-action="home"]').first.click()
        second.get_by_role('button', name='I’m a helper').click()
        second.locator('[data-helper="helper-ravi"]').click()
        second.locator('[data-job="snack"]').click()
        assert 'Eli' in second.locator('.kid-card').inner_text()
        main.wait_for_function(f"{MAIN}.assignments.find(a => a.helperId === 'helper-ravi').startedAt")
        started = time.time()
        second.locator('#helper-task [data-action="help"]').click()
        main.wait_for_function(f"{MAIN}.helpAlerts.some(a => a.helperId === 'helper-ravi' && a.status === 'open')", timeout=5000)
        phone.wait_for_selector('.phone-alert', timeout=5000)
        took = time.time() - started
        phone.locator('.phone-ack').click()
        phone.locator('#phone-note-text').fill('Ravi was unsure about the napkins.')
        phone.get_by_role('button', name='Save note').click()
        main.wait_for_function(f"{MAIN}.helpAlerts.some(a => a.note === 'Ravi was unsure about the napkins.')")
        for _ in range(7):
            if second.locator('#helper-done.active').count():
                break
            second.locator('[data-action="next"]').click()
        stars = main.evaluate(f"{MAIN}.helpers.find(h => h.id === 'helper-ravi').stars")
        second.get_by_role('button', name='Happy').click()
        second.get_by_role('button', name='Okay').click()
        main.wait_for_function(f"{MAIN}.assignments.find(a => a.helperId === 'helper-ravi').smiley === 'okay'")
        assert main.evaluate(f"{MAIN}.helpers.find(h => h.id === 'helper-ravi').stars") == stars + 1, 'one star, even from another tablet'
        assert main.evaluate(f"{MAIN}.assignments.find(a => a.helperId === 'helper-ravi').status") == 'complete'

        # Family page for Asha, only after the coordinator records a family yes.
        main.locator('#lead-phone-pair [data-action="pair-back"]').click()
        main.get_by_role('button', name='Coordinator tools').click()
        main.locator('#coordinator-pin-input').fill('7340'); main.locator('#coordinator-pin-confirm').fill('7340')
        main.get_by_role('button', name='Open coordinator tools').click()
        assert main.locator('[data-family="helper-asha"]').is_disabled()
        main.locator('[data-helper-form="helper-asha"] input[name="familyConsent"]').check()
        main.locator('[data-helper-form="helper-asha"]').get_by_role('button', name='Save helper record').click()
        main.locator('[data-family="helper-asha"]').click()
        main.locator('[data-action="phone-link"]').click()
        main.wait_for_selector('#pair-qr svg')
        family_url = main.locator('#pair-qr').get_attribute('data-url')
        family = device(browser, errors, 'family', 390, 844)
        family.goto(family_url)
        family.wait_for_function("document.querySelector('#family-name').textContent === 'Asha'")
        text = family.content()
        for secret in ['Eli', 'Noor', 'Ravi', 'Mina', 'peanut', 'napkins']:
            assert secret not in text, secret
        # The family can read the page in Hindi or Spanish.
        family.locator('[data-lang="hi"]').click()
        assert 'लेवल' in family.locator('#family-meta').text_content()
        assert family.locator('html').get_attribute('lang') == 'hi'
        if os.environ.get('SHOTS'): family.screenshot(path=os.environ['SHOTS'] + '/family-hi.png', full_page=True)
        family.locator('[data-lang="es"]').click()
        assert 'Ayudante' in family.locator('#family-meta').text_content()
        family.locator('[data-lang="en"]').click()

        # Laptop backup: a locked copy arrives and downloads, locked with the coordinator's words.
        main.locator('#lead-phone-pair [data-action="pair-back"]').click()
        main.get_by_role('button', name='Set up the laptop backup').click()
        main.locator('[data-action="phone-link"]').click()
        main.wait_for_selector('#pair-qr svg')
        laptop = device(browser, errors, 'laptop', 1280, 900)
        laptop.goto(main.locator('#pair-qr').get_attribute('data-url'))
        laptop.wait_for_function("document.querySelector('#backup-title').textContent.startsWith('Newest copy')", timeout=15000)
        laptop.locator('input[name="passphrase"]').fill('tea and toast')
        with laptop.expect_download() as info:
            laptop.get_by_role('button', name='Download locked copy').click()
        copy = json.loads(Path(info.value.path()).read_text())
        assert copy['kind'] == 'helper-jobs-locked-copy' and 'Noor' not in json.dumps(copy)

        assert not errors, errors
        print(f'devices-ok help from the second tablet reached the phone in {took:.2f}s')
        browser.close()
finally:
    server.terminate()
    server.wait(timeout=5)
