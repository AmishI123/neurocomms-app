import subprocess
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
server = subprocess.Popen([sys.executable, '-m', 'http.server', '8765', '--directory', str(ROOT)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# Read aloud is recorded instead of spoken, so the test can check what a helper would hear.
SPEECH_STUB = """
window.__said = [];
Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { cancel() {}, speak(u) { window.__said.push(u.text); } } });
window.SpeechSynthesisUtterance = function (text) { this.text = text; };
"""


def enter_pin(page, digits):
    for digit in digits:
        page.locator(f'[data-pin="{digit}"]').click()
    page.locator('[data-pin="enter"]').click()


try:
    time.sleep(1)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 900}, reduced_motion='reduce')
        context.add_init_script(SPEECH_STUB)
        page = context.new_page()
        page.set_default_timeout(5000)
        errors = []
        page.on('pageerror', lambda exc: errors.append(str(exc)))
        page.goto('http://127.0.0.1:8765/', wait_until='domcontentloaded')

        # Helper: locked jobs stay locked, and kid jobs wait for the lead.
        page.get_by_role('button', name='I’m a helper').click()
        page.locator('[data-helper="helper-asha"]').click()
        assert page.locator('[data-job="buddy"]').get_attribute('aria-disabled') == 'true'
        assert page.locator('[data-job="snack"]').get_attribute('aria-disabled') == 'true'
        page.locator('[data-job="snack"]').click(force=True)
        assert page.locator('#helper-jobs.active').count() == 1, 'a kid job does not start without the lead'
        page.locator('[data-job="cleanup"]').click()
        assert page.locator('#task-title').inner_text() == 'Pick up trash'
        for _ in range(4):
            page.locator('[data-action="next"]').click()
        assert page.locator('#helper-done.active').count() == 1
        stars = "JSON.parse(localStorage.getItem('helper-jobs.state.v1')).helpers[0].stars"
        page.get_by_role('button', name='Happy').click()
        first = page.evaluate(stars)
        assert first == 3, first  # Asha starts with 2 stars in the made-up data
        page.get_by_role('button', name='Happy').click()
        page.get_by_role('button', name='Okay').click()
        assert page.evaluate(stars) == first, 'one star per finished job'
        page.locator('#helper-done [data-action="home"]').click()

        # Lead: the first visit chooses a PIN; there is no PIN in the code.
        page.get_by_role('button', name='I’m the volunteer lead').click()
        assert 'First time' in page.locator('#pin-intro').inner_text()
        enter_pin(page, '5821')
        assert 'again' in page.locator('#pin-hint').inner_text()
        enter_pin(page, '5821')
        assert page.locator('#lead-setup-outing.active').count() == 1
        page.locator('#outing-form input[name="helper-present"][value="helper-asha"]').check()
        page.locator('#outing-form input[name="helper-present"][value="helper-ravi"]').check()
        page.locator('#outing-form input[name="kid-present"][value="kid-noor"]').check()
        page.get_by_role('button', name='Start live board').click()
        assert page.locator('#board-helper-count').inner_text() == '2'
        assert page.locator('#lead-board-list .lead-card').count() == 2, 'only helpers who are here'
        page.get_by_role('button', name='Make assignment').click()
        assert page.locator('#assignment-kid option').count() == 2, 'only kids who are here, plus no kid'
        page.select_option('#assignment-helper', 'helper-asha')
        page.select_option('#assignment-kid', 'kid-noor')
        page.select_option('#assignment-job', 'snack')
        page.select_option('#assignment-volunteer', 'vol-jordan')
        page.get_by_role('button', name='Save assignment').click()
        assert 'Snack Helper' in page.locator('#lead-board-list').inner_text()
        page.locator('#lead-board [data-action="home"]').click()

        # A no-snack card turns the job into no-snack steps, and read aloud says so first.
        page.get_by_role('button', name='I’m a helper').click()
        page.locator('[data-helper="helper-asha"]').click()
        page.locator('[data-job="snack"]').click()
        assert page.locator('#task-title').inner_text() == 'No snack for Noor'
        assert page.locator('#task-progress').text_content() == 'Step 1 of 4'
        page.locator('[data-action="read"]').click()
        task_text = page.locator('#task-card').inner_text()
        for _ in range(3):
            page.locator('[data-action="next"]').click()
            task_text += page.locator('#task-card').inner_text()
        assert 'Give one snack' not in task_text
        assert 'Tell the volunteer' in task_text
        said = page.evaluate('window.__said')
        assert said and said[0].startswith('Snack card: no snack for Noor.'), said

        # Stopping goes home, never to the lead board.
        page.locator('#helper-task [data-action="stop-task"]').click()
        assert page.locator('#home.active').count() == 1
        assert page.locator('#lead-board.active').count() == 0

        # Coordinator: chooses a separate PIN the first time.
        page.get_by_role('button', name='I’m the volunteer lead').click()
        enter_pin(page, '5821')
        page.get_by_role('button', name='Start live board').click()
        assert 'wants to stop' in page.locator('#lead-board-list').text_content()
        page.get_by_role('button', name='Coordinator tools').click()
        page.locator('#coordinator-pin-input').fill('5821')
        page.locator('#coordinator-pin-confirm').fill('5821')
        page.get_by_role('button', name='Open coordinator tools').click()
        assert page.locator('#coordinator.active').count() == 0, 'coordinator PIN must differ from the lead PIN'
        page.locator('#coordinator-pin-input').fill('7340')
        page.locator('#coordinator-pin-confirm').fill('7340')
        page.get_by_role('button', name='Open coordinator tools').click()
        assert page.locator('#coordinator.active').count() == 1
        assert page.locator('.coordinator-card').count() >= 6
        # Allowing snacks for a kid with an allergy asks first; saying no changes nothing.
        page.once('dialog', lambda dialog: dialog.dismiss())
        page.locator('[data-snack-kid="kid-noor"]').click()
        assert page.evaluate("JSON.parse(localStorage.getItem('helper-jobs.state.v1')).kids.find(k => k.id === 'kid-noor').snackAllowed") is False
        page.locator('[data-kid-form="kid-eli"] input[name="safeTips"]').fill('Quiet voice, <b>Ask first</b>, Offer two choices, Extra tip')
        page.locator('[data-kid-form="kid-eli"]').get_by_role('button', name='Save kid record').click()
        assert page.locator('#coordinator-list b').count() == 0, 'typed text is never treated as markup'
        page.locator('[data-helper-form="helper-asha"] select[name="language"]').select_option('en')
        page.locator('[data-helper-form="helper-asha"]').get_by_role('button', name='Save helper record').click()
        page.locator('[data-unlock-helper="helper-asha"][data-unlock-job="play"]').click()
        assert 'kid_updated' in page.locator('#coordinator-audit').inner_text()
        assert 'job_unlock_approved' in page.locator('#coordinator-audit').inner_text()
        assert 'helper-jobs.pins.v1' in page.evaluate('Object.keys(localStorage)')
        assert '5821' not in page.evaluate("localStorage.getItem('helper-jobs.pins.v1')"), 'PINs are stored scrambled'
        assert not errors, errors
        print('browser-journey-ok')
        browser.close()
finally:
    server.terminate()
    server.wait(timeout=5)
