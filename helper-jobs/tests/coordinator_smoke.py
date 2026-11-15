"""For the coordinator: make a job for a new place, unlock it, a helper does it (also on a second tablet),
progress across Sundays, dates on every yes, download what we hold, and taking over from a quiet main tablet."""
import json
import os
import subprocess
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PORT = '8806'
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
        context = browser.new_context(viewport={'width': 1100, 'height': 1300}, reduced_motion='reduce', accept_downloads=True)
        page = context.new_page()
        page.set_default_timeout(8000)
        page.on('pageerror', lambda exc: errors.append(str(exc)))
        page.on('dialog', lambda dialog: dialog.accept())
        page.goto(BASE + '/?fresh=1', wait_until='networkidle')
        page.get_by_role('button', name='I’m the volunteer lead').click()
        enter_pin(page, '5821'); enter_pin(page, '5821')
        page.wait_for_selector('#lead-setup-outing.active')
        page.get_by_role('button', name='Untick everyone').click()
        assert page.locator('#outing-form input[type="checkbox"]:checked').count() == 0
        page.get_by_role('button', name='Tick everyone', exact=True).click()
        page.get_by_role('button', name='Start live board').click()
        page.get_by_role('button', name='Coordinator tools').click()
        page.locator('#coordinator-pin-input').fill('7340'); page.locator('#coordinator-pin-confirm').fill('7340')
        page.get_by_role('button', name='Open coordinator tools').click()
        page.wait_for_selector('#coordinator.active')

        # Make a job for the zoo.
        form = page.locator('#job-form')
        form.locator('input[name="name"]').fill('Zoo Guide')
        form.locator('input[name="desc"]').fill('Help the group find the animals on the map.')
        form.locator('select[name="icon"]').select_option('map-pin')
        rows = page.locator('[data-job-step]')
        rows.nth(0).locator('[name="j-title"]').fill('Find the map'); rows.nth(0).locator('[name="j-text"]').fill('It is at the gate.')
        rows.nth(1).locator('[name="j-title"]').fill('Point to the next animal'); rows.nth(1).locator('[name="j-text"]').fill('Say its name out loud.')
        page.get_by_role('button', name='Add a step').click()
        rows.nth(2).locator('[name="j-title"]').fill('Count the group'); rows.nth(2).locator('[name="j-icon"]').select_option('users')
        form.get_by_role('button', name='Save job').click()
        job = page.evaluate(f'{STATE}.customJobs[0]')
        assert job['name'] == 'Zoo Guide' and len(job['steps']) == 4 and job['steps'][-1][1] == 'Tap Done', job
        assert 'Zoo Guide' in page.locator('#made-jobs').inner_text()
        page.locator(f'[data-unlock-helper="helper-asha"][data-unlock-job="{job["id"]}"]').click()
        assert job['id'] in page.evaluate(f"{STATE}.helpers[0].unlockedJobs")

        # A date on every yes, and "download what we hold" without other people's names.
        page.locator('[data-kid-form="kid-eli"] input[name="photoConsent"]').check()
        page.locator('[data-kid-form="kid-eli"]').get_by_role('button', name='Save kid record').click()
        assert 'photo:' in page.locator('.coordinator-card:has([data-kid-form="kid-eli"]) .yes-dates').inner_text()

        # Pair a second tablet; the lead matches Asha with the zoo job and Eli.
        page.locator('#coordinator [data-action="lead-board"]').first.click()
        page.get_by_role('button', name='More tablets').click()
        page.locator('[data-action="phone-link"]').click()
        page.wait_for_selector('#pair-qr svg')
        second = browser.new_context(viewport={'width': 820, 'height': 1180}).new_page()
        second.on('pageerror', lambda exc: errors.append(f'second: {exc}'))
        second.on('dialog', lambda dialog: dialog.accept())
        second.goto(page.locator('#pair-qr').get_attribute('data-url'))
        second.wait_for_function("document.querySelector('#mirror-state').textContent === 'Live'")
        page.locator('[data-action="pair-back"]').click()
        page.get_by_role('button', name='Make assignment').click()
        page.select_option('#assignment-helper', 'helper-asha'); page.select_option('#assignment-kid', 'kid-eli')
        page.select_option('#assignment-job', job['id']); page.select_option('#assignment-volunteer', 'vol-jordan')
        page.get_by_role('button', name='Save assignment').click()
        second.wait_for_function(f"JSON.parse(localStorage.getItem('helper-jobs.mirror-state.v1')).assignments.some(a => a.jobId === '{job['id']}')")
        second.get_by_role('button', name='I’m a helper').click()
        second.locator('[data-helper="helper-asha"]').click()
        second.locator(f'[data-job="{job["id"]}"]').click()
        assert second.locator('#task-title').inner_text() == 'Find the map'
        for _ in range(4):
            second.locator('[data-action="next"]').click()
        second.get_by_role('button', name='Happy').click()
        page.wait_for_function(f"{STATE}.assignments.some(a => a.jobId === '{job['id']}' && a.status === 'complete')")

        # Progress across Sundays, and the helper's own record with no kid names.
        page.get_by_role('button', name='Coordinator tools').click()
        page.locator('#coordinator-pin-input').fill('7340')
        page.get_by_role('button', name='Open coordinator tools').click()
        with page.expect_download() as info:
            page.locator('[data-export-kind="helper"][data-export-id="helper-asha"]').click()
        record = Path(info.value.path()).read_text()
        assert 'Zoo Guide' in record and 'Eli' not in record and '"with": "a kid"' in record
        prog = context.new_page(); prog.goto(BASE + '/progress.html')
        prog.wait_for_selector('.pg-card')
        assert prog.locator('.pg-card').count() == 3 and 'Play Partner: needs' in prog.locator('.pg-card').first.inner_text()
        cards = context.new_page(); cards.goto(BASE + '/print-cards.html')
        assert 'Zoo Guide' in cards.locator('#cards').inner_text()

        # The main tablet goes quiet: the second tablet offers to take over.
        second.clock.install()
        page.close()
        second.clock.run_for(200_000)
        second.wait_for_selector('#mirror-takeover', timeout=10000)
        second.locator('#mirror-takeover').click()
        second.wait_for_selector('#takeover-card')
        assert 'Restore from a copy' in second.locator('#takeover-card').inner_text()
        assert second.locator('#mirror-banner').is_hidden()
        assert not errors, errors
        print('coordinator-ok')
        browser.close()
finally:
    server.terminate()
    server.wait(timeout=5)
