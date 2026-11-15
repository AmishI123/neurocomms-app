"""This round's features in one browser: add/remove people, photos with a yes, languages and easier reading,
practice runs, the Talk Friend circle, the head count, Help notes, locked copies, paper cards, certificates
and starting again."""
import io
import json
import subprocess
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
PORT = '8767'
BASE = f'http://127.0.0.1:{PORT}'
server = subprocess.Popen([sys.executable, '-m', 'http.server', PORT, '--directory', str(ROOT)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
SPEECH_STUB = """
window.__said = [];
Object.defineProperty(window, 'speechSynthesis', { configurable: true, value: { cancel() {}, speak(u) { window.__said.push({ text: u.text, lang: u.lang, rate: u.rate }); } } });
window.SpeechSynthesisUtterance = function (text) { this.text = text; };
"""
STATE = "JSON.parse(localStorage.getItem('helper-jobs.state.v1'))"


def enter_pin(page, digits):
    for digit in digits:
        page.locator(f'[data-pin="{digit}"]').click()
    page.locator('[data-pin="enter"]').click()


def jpeg_bytes():
    # A tiny real JPEG made in the browser would also do; a fixed one keeps the test simple.
    from base64 import b64decode
    return b64decode('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAAQABABAREA/8QAFgABAQEAAAAAAAAAAAAAAAAAAAYH/8QAIBAAAgICAgIDAAAAAAAAAAAAAQIDBAAFERIGITFBUf/aAAgBAQAAPwC/5HDqtfdmjWmWuvREhfMbOuKJPDLnMpYYlRP/2Q==')


def coordinator(page, first=False):
    page.get_by_role('button', name='Coordinator tools').click()
    page.locator('#coordinator-pin-input').fill('7340')
    if first:
        page.locator('#coordinator-pin-confirm').fill('7340')
    page.get_by_role('button', name='Open coordinator tools').click()
    page.wait_for_selector('#coordinator.active')


try:
    time.sleep(1)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 900}, reduced_motion='reduce', accept_downloads=True)
        context.add_init_script(SPEECH_STUB)
        page = context.new_page()
        page.set_default_timeout(6000)
        errors = []
        page.on('pageerror', lambda exc: errors.append(str(exc)))
        page.on('dialog', lambda dialog: dialog.accept())
        page.goto(BASE + '/', wait_until='domcontentloaded')

        # Lead sets up the day: Asha and Ravi, kids Eli and Noor.
        page.get_by_role('button', name='I’m the volunteer lead').click()
        enter_pin(page, '5821'); enter_pin(page, '5821')
        page.wait_for_selector('#lead-setup-outing.active')
        for value in ['helper-asha', 'helper-ravi']:
            page.locator(f'input[name="helper-present"][value="{value}"]').check()
        for value in ['kid-eli', 'kid-noor']:
            page.locator(f'input[name="kid-present"][value="{value}"]').check()
        page.get_by_role('button', name='Start live board').click()

        # Coordinator: add a helper and a kid, then remove the kid.
        coordinator(page, first=True)
        add = page.locator('#add-helper-form')
        add.locator('input[name="name"]').fill('Dev')
        add.locator('select[name="language"]').select_option('es')
        add.locator('input[name="consent"]').check()
        add.get_by_role('button', name='Add helper').click()
        kid = page.locator('#add-kid-form')
        kid.locator('input[name="firstName"]').fill('Lia')
        kid.get_by_role('button', name='Add kid').click()
        state = page.evaluate(STATE)
        dev = next(h for h in state['helpers'] if h['name'] == 'Dev')
        lia = next(k for k in state['kids'] if k['firstName'] == 'Lia')
        assert dev['language'] == 'es' and dev['consent'] is True
        assert lia['snackAllowed'] is False and lia['parentConsent'] is False, lia
        page.locator(f'[data-remove-kind="kid"][data-remove-id="{lia["id"]}"]').click()
        assert not any(k['firstName'] == 'Lia' for k in page.evaluate(STATE)['kids'])

        # A photo needs a yes: tick it, save, then add the photo.
        asha_form = page.locator('[data-helper-form="helper-asha"]')
        assert page.locator('input[data-photo-kind="helper"][data-photo-id="helper-asha"]').count() == 0
        asha_form.locator('input[name="photoConsent"]').check()
        asha_form.get_by_role('button', name='Save helper record').click()
        page.locator('input[data-photo-kind="helper"][data-photo-id="helper-asha"]').set_input_files({'name': 'asha.jpg', 'mimeType': 'image/jpeg', 'buffer': jpeg_bytes()})
        page.wait_for_function(f"{STATE}.helpers.find(h => h.id === 'helper-asha').photoData")
        assert page.locator('.coord-photo img').count() >= 1

        # Ravi reads in Hindi, with bigger text, stronger contrast and a slower voice.
        ravi = page.locator('[data-helper-form="helper-ravi"]')
        ravi.locator('select[name="language"]').select_option('hi')
        for flag in ['bigText', 'contrast', 'slowVoice']:
            ravi.locator(f'input[name="{flag}"]').check()
        ravi.get_by_role('button', name='Save helper record').click()
        page.locator('#coordinator [data-action="lead-board"]').first.click()
        page.locator('#lead-board [data-action="home"]').click()

        page.get_by_role('button', name='I’m a helper').click()
        assert page.locator('[data-helper="helper-asha"] img').count() == 1, 'the photo shows on the helper card'
        page.locator('[data-helper="helper-ravi"]').click()
        assert page.locator('#jobs-title').inner_text() == 'काम चुनो'
        assert page.evaluate("document.body.classList.contains('big-text') && document.body.classList.contains('high-contrast')")
        page.locator('[data-job="cleanup"]').click()
        assert page.locator('#task-title').inner_text() == 'कचरा उठाओ'
        page.locator('[data-action="read"]').click()
        said = page.evaluate('window.__said')[-1]
        assert said['lang'] == 'hi-IN' and said['rate'] < 0.8 and said['text'].startswith('कचरा उठाओ'), said
        page.locator('#helper-task [data-action="stop-task"]').click()
        assert page.evaluate("!document.body.classList.contains('big-text')"), 'settings end when the helper leaves'
        assert page.locator('#home-title').get_attribute('lang') is None

        # Practice run: Asha can try Talk Friend (next level), with the calm 10-second circle.
        page.get_by_role('button', name='I’m a helper').click()
        page.locator('[data-helper="helper-asha"]').click()
        page.locator('.jobs-later summary').click()
        assert page.locator('[data-job="talk"].practice').count() == 1
        assert page.locator('[data-job="buddy"]').get_attribute('aria-disabled') == 'true', 'level 3 stays locked'
        page.locator('[data-job="talk"]').click()
        assert page.locator('.practice-tag').count() == 1
        page.locator('[data-action="next"]').click(); page.locator('[data-action="next"]').click()
        assert page.locator('#task-title').inner_text() == 'Wait 10 seconds'
        assert page.locator('.talk-wait svg .tw-fill').count() == 1
        while page.locator('#helper-task.active').count():
            page.locator('[data-action="next"]').click()
        assert page.locator('#done-eyebrow').inner_text().lower() == 'practice done'
        stars = page.evaluate(f"{STATE}.helpers.find(h => h.id === 'helper-asha').stars")
        page.get_by_role('button', name='Happy').click()
        assert page.evaluate(f"{STATE}.helpers.find(h => h.id === 'helper-asha').stars") == stars, 'practice gives no star'
        assert page.evaluate(f"{STATE}.practice.length") == 1
        page.locator('#helper-done [data-action="home"]').click()

        # Help, then "I'm here" on the tablet asks for a short note for the coordinator.
        page.get_by_role('button', name='I’m a helper').click()
        page.locator('[data-helper="helper-asha"]').click()
        page.locator('#helper-jobs [data-action="help"]').click()
        page.locator('#helper-jobs [data-action="home"]').last.click()
        page.get_by_role('button', name='I’m the volunteer lead').click()
        enter_pin(page, '5821')
        page.get_by_role('button', name='Start live board').click()
        page.locator('#lead-board-list article', has_text='Ravi').locator('.alert-ack').click()
        page.get_by_role('button', name='Skip').click()
        page.locator('#lead-board-list article', has_text='Asha').locator('.alert-ack').click()
        page.locator('#help-note-text').fill('Asha wanted a drink. Jordan went with her.')
        page.get_by_role('button', name='Save note').click()
        assert page.locator('#help-note-form').is_hidden()

        # Break reminder after 20 minutes on one job.
        page.get_by_role('button', name='Make assignment').click()
        page.select_option('#assignment-helper', 'helper-ravi')
        page.select_option('#assignment-kid', '')
        page.select_option('#assignment-job', 'cleanup')
        page.get_by_role('button', name='Save assignment').click()
        page.evaluate(f"""(() => {{ const s = {STATE}; const a = s.assignments.find(x => x.helperId === 'helper-ravi' && x.status === 'assigned'); a.startedAt = new Date(Date.now() - 21 * 60000).toISOString(); localStorage.setItem('helper-jobs.state.v1', JSON.stringify(s)); }})()""")
        page.reload(wait_until='domcontentloaded')
        page.get_by_role('button', name='I’m the volunteer lead').click()
        enter_pin(page, '5821')
        page.get_by_role('button', name='Start live board').click()
        assert 'offer a break' in page.locator('#lead-board-list').text_content()
        page.get_by_role('button', name='I offered a break').click()
        assert 'offer a break' not in page.locator('#lead-board-list').text_content()

        # Wrap-up cannot finish until every kid here today is marked.
        page.get_by_role('button', name='Wrap up outing').click()
        assert page.locator('.headcount-row').count() == 2
        page.locator('#finish-outing').click(force=True)  # aria-disabled: it still explains what is missing
        assert page.locator('#lead-wrap.active').count() == 1, 'cannot finish before the head count'
        page.locator('[data-headcount="kid-eli"][data-value="back"]').click()
        page.locator('[data-headcount="kid-noor"][data-value="family"]').click()
        assert 'Every kid is marked' in page.locator('#headcount-status').inner_text()
        page.locator('#finish-outing').click()
        assert page.locator('#home.active').count() == 1

        # Coordinator sees the note and the practice run; prints a certificate; saves and restores a locked copy.
        page.get_by_role('button', name='I’m the volunteer lead').click()
        enter_pin(page, '5821')
        page.get_by_role('button', name='Start live board').click()
        coordinator(page)
        notes = page.locator('#coordinator-notes').inner_text()
        assert 'Jordan went with her' in notes and 'practised Talk Friend' in notes, notes
        page.locator('#copy-form input[name="passphrase"]').fill('tea and toast')
        with page.expect_download() as info:
            page.get_by_role('button', name='Download locked copy').click()
        copy_path = info.value.path()
        locked = json.loads(Path(copy_path).read_text())
        assert locked['kind'] == 'helper-jobs-locked-copy' and 'Noor' not in Path(copy_path).read_text()
        page.evaluate("(() => { const s = JSON.parse(localStorage.getItem('helper-jobs.state.v1')); s.helpers[0].name = 'Changed'; localStorage.setItem('helper-jobs.state.v1', JSON.stringify(s)); })()")
        page.locator('#restore-form input[name="file"]').set_input_files(copy_path)
        page.locator('#restore-form input[name="passphrase"]').fill('wrong words')
        page.get_by_role('button', name='Restore').click()
        page.wait_for_function("document.querySelector('#toast').textContent.includes('do not open')")
        page.locator('#restore-form input[name="file"]').set_input_files(copy_path)
        page.locator('#restore-form input[name="passphrase"]').fill('tea and toast')
        page.get_by_role('button', name='Restore').click()
        page.wait_for_function(f"{STATE}.helpers[0].name === 'Asha'")

        cert = context.new_page()
        cert.goto(BASE + '/certificate.html?helper=helper-asha')
        assert cert.locator('.cert-sheet').count() >= 1 and 'Asha' in cert.locator('.cert-name').first.inner_text()
        cards = context.new_page()
        cards.goto(BASE + '/print-cards.html')
        assert cards.locator('.job-paper').count() == 6
        assert 'If the tablet stops' in cards.locator('#if-the-tablet-stops').inner_text()
        cards.select_option('#card-lang', 'es')
        assert 'Ayudante de merienda' in cards.locator('#cards').inner_text()

        # Start again: back to the made-up example, with no PINs.
        page.get_by_role('button', name='Start again with the made-up example').click()
        page.wait_for_load_state('domcontentloaded')
        page.wait_for_function("localStorage.getItem('helper-jobs.pins.v1') === null")
        page.get_by_role('button', name='I’m a helper').click()
        assert page.locator('[data-helper]').count() == 3 and page.locator('[data-helper] img').count() == 0
        assert not errors, errors
        print('features-ok')
        browser.close()
finally:
    server.terminate()
    server.wait(timeout=5)
