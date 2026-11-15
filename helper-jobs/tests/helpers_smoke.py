"""For helpers: the day plan with now and next, I need a break, practising Help, wishes, step pictures,
outdoor mode, the helper card, and the day plan on the lead's phone."""
import os
import subprocess
from base64 import b64decode
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PORT = '8803'
BASE = f'http://127.0.0.1:{PORT}'
env = {**os.environ, 'PORT': PORT, 'HOST': '127.0.0.1', 'TRUST_PROXY': '0', 'ALLOWED_ORIGINS': BASE, 'REQUESTS_PER_MINUTE': '5000'}
server = subprocess.Popen(['node', str(ROOT / 'server' / 'server.mjs')], env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
STATE = "JSON.parse(localStorage.getItem('helper-jobs.state.v1'))"
JPEG = b64decode('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAAQABABAREA/8QAFgABAQEAAAAAAAAAAAAAAAAAAAYH/8QAIBAAAgICAgIDAAAAAAAAAAAAAQIDBAAFERIGITFBUf/aAAgBAQAAPwC/5HDqtfdmjWmWuvREhfMbOuKJPDLnMpYYlRP/2Q==')


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
        context = browser.new_context(viewport={'width': 1024, 'height': 1300}, reduced_motion='reduce')
        page = context.new_page()
        page.set_default_timeout(8000)
        page.on('pageerror', lambda exc: errors.append(str(exc)))
        page.on('dialog', lambda dialog: dialog.accept())
        page.goto(BASE + '/?fresh=1', wait_until='networkidle')

        # The lead edits the day plan while setting up.
        page.get_by_role('button', name='I’m the volunteer lead').click()
        enter_pin(page, '5821'); enter_pin(page, '5821')
        page.wait_for_selector('#lead-setup-outing.active')
        assert page.locator('[data-schedule-row]').count() == 6
        page.locator('[data-schedule-row]').nth(2).get_by_role('button', name='Remove').click()
        page.get_by_role('button', name='Add a part of the day').click()
        page.locator('[name="s-label"]').last.fill('Bubbles by the pond')
        page.locator('[name="s-icon"]').last.select_option('bubble')
        page.locator('input[name="helper-present"][value="helper-asha"]').check()
        page.locator('input[name="kid-present"][value="kid-eli"]').check()
        page.get_by_role('button', name='Start live board').click()
        plan = page.evaluate(f'{STATE}.outing.schedule')
        assert len(plan) == 6 and plan[-1]['label'] == 'Bubbles by the pond' and plan[-1]['icon'] == 'bubble', plan
        assert page.locator('#day-plan .day-steps li.now').inner_text().find('Arrive') >= 0
        page.locator('#day-plan [data-action="schedule-next"]').click()
        assert 'Walk to the park' in page.locator('#day-plan li.now').inner_text()

        # The lead's phone shows now and next, and can move the plan on.
        page.get_by_role('button', name='Lead’s phone').click()
        page.locator('[data-action="phone-link"]').click()
        page.wait_for_selector('#pair-qr svg')
        phone = browser.new_context(viewport={'width': 390, 'height': 844}).new_page()
        phone.on('pageerror', lambda exc: errors.append(f'phone: {exc}'))
        phone.goto(page.locator('#pair-qr').get_attribute('data-url'))
        phone.wait_for_selector('#phone-day:not([hidden])')
        assert 'Walk to the park' in phone.locator('#phone-day').inner_text()
        phone.locator('#phone-day-next').click()
        page.wait_for_function(f'{STATE}.outing.scheduleNow === 2')
        page.locator('[data-action="pair-back"]').click()

        # Coordinator: a picture for a Clean-Up step; outdoor mode.
        page.get_by_role('button', name='Coordinator tools').click()
        page.locator('#coordinator-pin-input').fill('7340'); page.locator('#coordinator-pin-confirm').fill('7340')
        page.get_by_role('button', name='Open coordinator tools').click()
        page.wait_for_selector('#coordinator.active')
        page.locator('.job-pics', has_text='Clean-Up Crew').locator('summary').click()
        page.locator('[data-step-photo="cleanup"][data-step-index="0"]').set_input_files({'name': 'bin.jpg', 'mimeType': 'image/jpeg', 'buffer': JPEG})
        page.wait_for_function(f"{STATE}.stepPhotos && {STATE}.stepPhotos.cleanup && {STATE}.stepPhotos.cleanup[0]")
        page.locator('#device-form input[name="outdoor"]').check()
        page.locator('#device-form').get_by_role('button', name='Save').click()
        assert page.evaluate("document.body.classList.contains('outdoor')")
        card = context.new_page(); card.goto(BASE + f'/helper-card.html?helper=helper-asha')
        assert card.locator('.hcard-name').inner_text() == 'Asha' and card.locator('.hcard-back li').count() >= 3
        page.locator('#coordinator [data-action="lead-board"]').first.click()
        page.locator('#lead-board [data-action="home"]').click()

        # Helper: the strip shows now and next; practise Help first.
        page.get_by_role('button', name='I’m a helper').click()
        page.locator('[data-helper="helper-asha"]').click()
        assert page.locator('#day-strip-jobs li.now').count() == 1 and page.locator('#day-strip-jobs li.next').count() == 1
        page.locator('[data-action="practice-help"]').click()
        page.locator('[data-action="practice-help-press"]').click()
        assert page.locator('#practice-help-done').is_visible()
        assert page.evaluate(f"{STATE}.helpAlerts.length") == 0, 'practice sends nothing'
        page.locator('#practice-help-done [data-action="helper-jobs"]').click()
        assert page.locator('[data-action="practice-help"]').count() == 0, 'shown until it is done once'
        # A step with its real picture, then a break.
        page.locator('[data-job="cleanup"]').click()
        assert page.locator('.task-photo img').count() == 1
        page.locator('[data-action="need-break"]').click()
        assert page.locator('#helper-break.active').count() == 1
        assert page.evaluate(f"{STATE}.helpAlerts.find(a => a.kind === 'break').status") == 'open'
        phone.wait_for_function("document.querySelector('.phone-alert-kind') && document.querySelector('.phone-alert-kind').textContent.includes('Wants a break')", timeout=6000)
        page.locator('[data-action="break-done"]').click()
        assert page.locator('#helper-task.active').count() == 1 and page.locator('#task-title').inner_text() == 'Pick up trash'
        for _ in range(4):
            page.locator('[data-action="next"]').click()
        page.locator('[data-wish="talk"]').click()
        assert page.evaluate(f"{STATE}.helpers[0].wishes[0].jobId") == 'talk'
        assert not errors, errors
        print('helpers-ok')
        browser.close()
finally:
    server.terminate()
    server.wait(timeout=5)
