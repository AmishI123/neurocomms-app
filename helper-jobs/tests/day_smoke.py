"""The real day: Help that can't be missed, fixing matches, volunteers, PIN recovery, this tablet's checks,
the Sunday report and the sheets for people."""
import os
import subprocess
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PORT = '8801'
BASE = f'http://127.0.0.1:{PORT}'
env = {**os.environ, 'PORT': PORT, 'HOST': '127.0.0.1', 'TRUST_PROXY': '0', 'ALLOWED_ORIGINS': BASE, 'REQUESTS_PER_MINUTE': '5000'}
server = subprocess.Popen(['node', str(ROOT / 'server' / 'server.mjs')], env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
STATE = "JSON.parse(localStorage.getItem('helper-jobs.state.v1'))"


def enter_pin(page, digits):
    for digit in digits:
        page.locator(f'[data-pin="{digit}"]').click()
    page.locator('[data-pin="enter"]').click()


def lead_in(page, first=False):
    page.get_by_role('button', name='I’m the volunteer lead').click()
    enter_pin(page, '5821')
    if first:
        enter_pin(page, '5821')
    page.wait_for_selector('#lead-setup-outing.active')


try:
    for _ in range(50):
        if '"port"' in server.stdout.readline().decode():
            break
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        errors = []
        context = browser.new_context(viewport={'width': 1024, 'height': 1300}, reduced_motion='reduce')
        page = context.new_page()
        page.set_default_timeout(8000)
        page.on('pageerror', lambda exc: errors.append(str(exc)))
        page.on('dialog', lambda dialog: dialog.accept())
        page.clock.install()
        page.goto(BASE + '/?fresh=1', wait_until='networkidle')

        # Coordinator first: a new volunteer, recovery words for the PIN.
        lead_in(page, first=True)
        page.get_by_role('button', name='Start live board').click()
        page.get_by_role('button', name='Coordinator tools').click()
        page.locator('#coordinator-pin-input').fill('7340'); page.locator('#coordinator-pin-confirm').fill('7340')
        page.locator('#coordinator-recovery').fill('tea and toast')
        page.get_by_role('button', name='Open coordinator tools').click()
        page.wait_for_selector('#coordinator.active')
        assert 'Recovery words are set' in page.locator('#recovery-state').inner_text()
        page.locator('#add-volunteer-form input[name="name"]').fill('Priti')
        page.locator('#add-volunteer-form').get_by_role('button', name='Add').click()
        assert 'Priti' in page.locator('#volunteer-list').inner_text()
        checks = page.locator('#device-checks').inner_text()
        assert 'Laptop backup is off' in checks and 'Read-aloud voices' in checks, checks
        # The Sunday report opens only after the coordinator PIN.
        report = context.new_page()
        report.goto(BASE + '/report.html')
        assert report.locator('#report').inner_text().startswith('No outings') or report.locator('.r-tiles').count() == 1
        page.locator('#coordinator [data-action="lead-board"]').first.click()

        # Who is here: Asha, Eli, and only Priti and Jordan as volunteers.
        page.locator('#lead-board [data-action="home"]').click()
        lead_in(page)
        page.locator('input[name="helper-present"][value="helper-asha"]').check()
        page.locator('input[name="kid-present"][value="kid-eli"]').check()
        page.locator('input[name="volunteer-present"][value="vol-kai"]').uncheck()
        priti = page.evaluate(f"{STATE}.volunteers.find(v => v.name === 'Priti').id")
        page.locator(f'input[name="volunteer-present"][value="{priti}"]').check()
        page.get_by_role('button', name='Start live board').click()
        assert page.locator('#board-notes li').count() >= 2, 'the board says what is not set up'
        page.get_by_role('button', name='Make assignment').click()
        options = page.locator('#assignment-volunteer option').all_inner_texts()
        assert any('Priti' in o for o in options) and not any('Kai' in o for o in options), options
        page.select_option('#assignment-helper', 'helper-asha'); page.select_option('#assignment-kid', 'kid-eli')
        page.select_option('#assignment-job', 'snack'); page.select_option('#assignment-volunteer', 'vol-jordan')
        page.get_by_role('button', name='Save assignment').click()
        # Change the volunteer, then end the job.
        card = page.locator('#lead-board-list article', has_text='Asha')
        card.locator('.card-change summary').click()
        vol_id = page.evaluate(f"{STATE}.volunteers.find(v => v.name === 'Priti').id")
        card.locator('select[data-change-vol]').select_option(vol_id)
        card.get_by_role('button', name='Save volunteer').click()
        assert page.evaluate(f"{STATE}.assignments[0].nearbyVolunteerId") == vol_id
        page.locator('#lead-board-list article', has_text='Asha').locator('.card-change summary').click()
        page.locator('#lead-board-list article', has_text='Asha').get_by_role('button', name='End this job').click()
        assert page.evaluate(f"{STATE}.assignments[0].status") == 'ended'

        # Help shows on every screen until it is answered; the helper sees "a volunteer is coming".
        page.locator('#lead-board [data-action="home"]').click()
        page.get_by_role('button', name='I’m a helper').click()
        page.locator('[data-helper="helper-asha"]').click()
        page.locator('#helper-jobs [data-action="help"]').click()
        banner = page.locator('#alert-banner')
        assert banner.is_visible() and 'Asha' in banner.inner_text() and 'volunteer is coming' in banner.inner_text()
        page.clock.run_for(75_000)
        assert '1 min' in banner.inner_text(), banner.inner_text()
        page.locator('#helper-jobs [data-action="home"]').last.click()
        lead_in(page)
        page.get_by_role('button', name='Start live board').click()
        page.locator('#lead-board-list .alert-ack').click()
        page.get_by_role('button', name='Skip').click()
        page.locator('#lead-board [data-action="home"]').click()
        assert banner.is_hidden(), 'gone once answered'

        # Reset the lead PIN; recover the coordinator PIN with the words.
        lead_in(page)
        page.get_by_role('button', name='Start live board').click()
        page.get_by_role('button', name='Coordinator tools').click()
        page.get_by_role('button', name='Forgot the coordinator PIN?').click()
        form = page.locator('#recover-form')
        form.locator('input[name="words"]').fill('tea and toast')
        form.locator('input[name="pin"]').fill('2468'); form.locator('input[name="pin2"]').fill('2468')
        form.get_by_role('button', name='Save the new PIN').click()
        page.wait_for_selector('#coordinator.active')
        page.get_by_role('button', name='Reset the lead PIN').click()
        assert 'lead' not in page.evaluate("JSON.parse(localStorage.getItem('helper-jobs.pins.v1'))")

        report.goto(BASE + '/report.html')
        report.wait_for_selector('.r-tiles')
        text = report.locator('#report').inner_text()
        assert 'times someone asked for help' in text and 'Asha' in text
        for secret in ['Eli', 'Ask before touching', 'peanut']:
            assert secret not in text, secret
        assert report.locator('.r-bar').count() >= 1
        sheets = context.new_page()
        sheets.goto(BASE + '/people-sheets.html')
        assert sheets.locator('.sheet-page').count() == 3 and sheets.locator('.consent').count() == 2
        assert not errors, errors
        print('day-ok')
        browser.close()
finally:
    server.terminate()
    server.wait(timeout=5)
