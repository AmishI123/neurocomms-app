import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { jobs, fixtures } from '../data.js';

// The browser modules are intentionally UMD-shaped; import them in an isolated
// CommonJS-compatible VM so the same contract is tested outside the browser.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const store = require('../store.js');
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
const serviceWorker = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../app.js', import.meta.url), 'utf8');

test('the catalog contains the six approved jobs and three levels', () => {
  assert.deepEqual(jobs.map(job => job.id), ['snack', 'walk', 'cleanup', 'play', 'talk', 'buddy']);
  assert.deepEqual([...new Set(jobs.map(job => job.level))], [1, 2, 3]);
  assert.ok(jobs.every(job => job.steps.length >= 4));
  assert.ok(jobs.find(job => job.id === 'buddy').steps.some(step => /bathroom/i.test(step.join(' '))));
});

test('helper view exposes only the helper-safe fields', () => {
  const state = store.initialState();
  const view = store.helperView(state, 'helper-asha');
  assert.deepEqual(Object.keys(view).sort(), ['id', 'level', 'name', 'photo', 'stars', 'unlockedJobs']);
  assert.equal('consent' in view, false);
});

test('assignment cannot be saved without a named nearby volunteer', () => {
  const state = store.initialState();
  const result = store.validateAssignment(state, { helperId: 'helper-asha', kidId: 'kid-eli', jobId: 'snack', nearbyVolunteerId: 'missing' });
  assert.equal(result.ok, false);
  assert.match(result.reason, /nearby volunteer/);
});

test('unlocked assignment with a nearby volunteer is accepted', () => {
  const state = store.initialState();
  const result = store.saveAssignment(state, { helperId: 'helper-asha', kidId: 'kid-eli', jobId: 'snack', nearbyVolunteerId: 'vol-jordan' });
  assert.equal(result.ok, true);
  assert.equal(state.assignments.length, 1);
});

test('non-kid-facing Clean-Up Crew can be assigned without a kid or volunteer', () => {
  const state = store.initialState();
  const result = store.validateAssignment(state, { helperId: 'helper-asha', jobId: 'cleanup' });
  assert.equal(result.ok, true);
});

test('lead cannot change coordinator-controlled snack permission', () => {
  const state = store.initialState();
  const result = store.setSnackPermission(state, 'kid-eli', false, 'lead');
  assert.equal(result.ok, false);
  assert.equal(state.kids.find(kid => kid.id === 'kid-eli').snackAllowed, true);
});

test('coordinator approval unlocks a higher-level job', () => {
  const state = store.initialState();
  const result = store.unlockJob(state, 'helper-asha', 'talk', 'coordinator');
  assert.equal(result.ok, true);
  assert.equal(state.helpers[0].unlockedJobs.includes('talk'), true);
  assert.equal(state.helpers[0].level, 2);
});

test('coordinator edits retain the minimum kid tips and record history', () => {
  const state = store.initialState();
  assert.equal(store.updateKid(state, 'kid-eli', { safeTips: ['one', 'two', 'three', 'four'] }, 'coordinator').ok, true);
  assert.deepEqual(state.kids.find(kid => kid.id === 'kid-eli').safeTips, ['one', 'two', 'three']);
  assert.equal(store.updateKid(state, 'kid-eli', { safeTips: ['hidden'] }, 'lead').ok, false);
  store.saveAssignment(state, { helperId: 'helper-asha', kidId: 'kid-eli', jobId: 'snack', nearbyVolunteerId: 'vol-jordan' });
  assert.equal(store.historyForHelper(state, 'helper-asha').length, 1);
});

test('retention is coordinator-owned', () => {
  const state = store.initialState();
  assert.equal(store.setRetention(state, { deletePhotosAfterDays: 30 }, 'lead').ok, false);
  assert.equal(store.setRetention(state, { deletePhotosAfterDays: 30 }, 'coordinator').ok, true);
});

test('lead setup records outing details and attendance', () => {
  const state = store.initialState();
  assert.equal(store.updateOuting(state, { place: 'Riverside Park', leadVolunteer: 'Kai' }, 'lead').ok, true);
  assert.equal(store.setPresence(state, 'helper', 'helper-asha', true, 'lead').ok, true);
  assert.equal(store.setPresence(state, 'kid', 'kid-eli', true, 'lead').ok, true);
  assert.equal(state.outing.place, 'Riverside Park');
  assert.deepEqual(state.outing.presentHelpers, ['helper-asha']);
  assert.deepEqual(state.outing.presentKids, ['kid-eli']);
});

test('Help alerts remain open until the lead acknowledges them', () => {
  const state = store.initialState();
  store.createAlert(state, 'helper-asha', 'help');
  store.createAlert(state, 'helper-asha', 'help');
  assert.equal(state.helpAlerts.length, 1);
  assert.equal(state.helpAlerts[0].status, 'open');
  store.acknowledgeAlert(state, state.helpAlerts[0].id);
  assert.equal(state.helpAlerts[0].status, 'acknowledged');
});

test('badges are derived from completed assignments', () => {
  const state = store.initialState();
  for (let index = 0; index < 5; index += 1) state.assignments.push({ id: `done-${index}`, helperId: 'helper-asha', jobId: 'snack', status: 'complete' });
  assert.deepEqual(store.badgesForHelper(state, 'helper-asha').map(badge => badge.name), ['Snack Star']);
});

test('recovery export contains state and queued changes', () => {
  const state = store.initialState();
  store.createAlert(state, 'helper-asha', 'stop');
  const recovered = JSON.parse(store.recoveryExport(state));
  assert.equal(recovered.state.helpAlerts.length, 1);
  assert.ok(Array.isArray(recovered.outbox));
});

test('outbox sync acknowledges accepted changes and keeps failed changes', async () => {
  const values = new Map();
  globalThis.localStorage = { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value) };
  store.queueMutation({ id: 'accepted', type: 'accepted' });
  store.queueMutation({ id: 'keep-me', type: 'keep-me' });
  const sent = [];
  const result = await store.syncOutbox(async mutation => { sent.push(mutation.id); return { accepted: mutation.type !== 'keep-me' }; });
  assert.ok(Array.isArray(result.sent));
  assert.ok(Array.isArray(result.pending));
  assert.equal(sent.length, result.sent.length + result.pending.length);
  assert.deepEqual(store.readOutbox().map(item => item.id), ['keep-me']);
  delete globalThis.localStorage;
});

test('reconcile preserves local safety fields and reports conflicts', () => {
  const local = store.initialState();
  const remote = store.initialState();
  remote.kids.find(kid => kid.id === 'kid-eli').snackAllowed = false;
  const result = store.reconcile(local, remote);
  assert.deepEqual(result.conflicts, ['kid:kid-eli']);
  assert.equal(result.merged.kids.find(kid => kid.id === 'kid-eli').snackAllowed, true);
});

test('fixtures remain privacy-safe demo data', () => {
  assert.equal(fixtures.kids.every(kid => kid.consent), true);
  assert.equal(fixtures.helpers.every(helper => helper.consent), true);
});

test('static shell keeps accessibility and privacy boundaries visible', () => {
  assert.match(html, /data-action="help" aria-label="Ask the volunteer for help"/);
  assert.match(html, /data-action="read"/);
  assert.match(html, /data-action="next"/);
  assert.match(html, /data-action="stop-task"/);
  assert.match(html, /data-action="retention"/);
  assert.match(html, /id="outing-form"/);
  assert.match(html, /id="coordinator-form"/);
  assert.match(html, /id="assignment-helper" name="assignment-helper"/);
  assert.match(html, /id="assignment-volunteer" name="assignment-volunteer"/);
  assert.match(html, /id="coordinator-audit"/);
  assert.match(app, /data-kid-form/);
  assert.match(app, /data-helper-form/);
  assert.match(app, /snack-card/);
  assert.match(app, /Never guess/);
  assert.doesNotMatch(html, /archive\/|communication-tool|neuro-divergent/);
  assert.match(css, /width:82px;height:82px/);
  assert.match(serviceWorker, /caches\.open/);
});

test('no PIN is shipped in the code or data', () => {
  assert.equal('leadPin' in fixtures.outing, false);
  assert.equal('coordinatorPin' in fixtures.outing, false);
  assert.doesNotMatch(html, /Try 1 2 3 4/);
  assert.match(app, /crypto\.subtle\.digest/);
});

test('a no-snack card changes the steps and is read aloud first', () => {
  assert.match(app, /No snack for/);
  assert.match(app, /Snack card: no snack for \{name\}\. Do not give food/);
  assert.doesNotMatch(jobs.find(job => job.id === 'snack').steps.find(step => /Check the snack card/.test(step[1]))[0], /✅/);
});

test('kid jobs wait for the lead, and stopping never opens the lead board', () => {
  assert.match(app, /Ask your lead to start this with you/);
  assert.doesNotMatch(app, /stop-task'\)[^\n]*lead-board/);
});

test('the offline copy updates when online and clears old copies', () => {
  assert.match(serviceWorker, /fetch\(event\.request\)\.then/);
  assert.match(serviceWorker, /caches\.delete/);
});

test('the presentation set is complete and every picture it points to exists', async () => {
  const { existsSync } = await import('node:fs');
  const at = path => new URL(`../presentation/${path}`, import.meta.url);
  for (const page of ['index.html', 'slides.html', 'present.html', 'presenter.html', 'handout.html', 'handout-view.html', 'video.html', 'video/helper-jobs-video.mp4', 'video/helper-jobs.vtt', 'video/poster.jpg', 'helper-jobs-slides.pdf', 'helper-jobs-handout.pdf']) assert.ok(existsSync(at(page)), page);
  const pages = ['index.html', 'slides.html', 'present.html', 'presenter.html', 'handout.html', 'handout-view.html'].map(page => readFileSync(at(page), 'utf8')).join('\n');
  const pictures = [...new Set([...pages.matchAll(/(?:src="|"src": ")((?:slides|img)\/[^"]+\.jpg)"/g)].map(match => match[1]))];
  assert.ok(pictures.length >= 14, `found ${pictures.length} pictures`);
  for (const picture of pictures) assert.ok(existsSync(at(picture)), picture);
  assert.doesNotMatch(pages, /Next Step|next-step|neuro-divergent/);
});

test('a kid record without a parent yes cannot be used for a job', () => {
  const state = store.initialState();
  state.kids.find(kid => kid.id === 'kid-eli').parentConsent = false;
  const result = store.validateAssignment(state, { helperId: 'helper-asha', kidId: 'kid-eli', jobId: 'snack', nearbyVolunteerId: 'vol-jordan' });
  assert.equal(result.ok, false);
  assert.match(result.reason, /parent/i);
});

test('old alerts and history are cleared after the days the coordinator set; open alerts stay', () => {
  const state = store.initialState();
  const old = new Date(Date.now() - 40 * 86400000).toISOString();
  state.helpAlerts.push({ id: 'old', status: 'acknowledged', createdAt: old }, { id: 'open-old', status: 'open', createdAt: old }, { id: 'new', status: 'acknowledged', createdAt: new Date().toISOString() });
  state.audit.push({ id: 'a-old', type: 'x', at: old });
  store.setRetention(state, { keepOperationalNotesAfterDays: 30 }, 'coordinator');
  store.applyRetention(state);
  assert.deepEqual(state.helpAlerts.map(alert => alert.id).sort(), ['new', 'open-old']);
  assert.equal(state.audit.some(item => item.id === 'a-old'), false);
});

test('the outing summary has no kid names, tips or allergies', () => {
  const state = store.initialState();
  store.saveAssignment(state, { helperId: 'helper-asha', kidId: 'kid-noor', jobId: 'snack', nearbyVolunteerId: 'vol-jordan' });
  state.assignments[0].status = 'complete'; state.assignments[0].smiley = 'happy';
  const csv = store.outingSummary(state, jobs);
  assert.match(csv, /Asha/);
  for (const secret of ['Noor', 'Eli', 'peanut', 'Ask before touching', 'Show the picture first']) assert.equal(csv.includes(secret), false, secret);
});

const i18n = require('../i18n.js');
const Link = require('../link.js');
const day = 86400000;

test('the coordinator adds people with no consent and no snack, and only the coordinator can', () => {
  const state = store.initialState();
  assert.equal(store.addHelper(state, { name: 'Dev' }, 'lead').ok, false);
  const helper = store.addHelper(state, { name: '  Dev  ', language: 'xx' }, 'coordinator').helper;
  assert.equal(helper.name, 'Dev'); assert.equal(helper.photo, 'D'); assert.equal(helper.consent, false); assert.equal(helper.language, 'en');
  const kid = store.addKid(state, { firstName: 'Lia', safeTips: ['a', 'b', 'c', 'd'] }, 'coordinator').kid;
  assert.equal(kid.snackAllowed, false); assert.equal(kid.parentConsent, false); assert.equal(kid.safeTips.length, 3);
  // No yes on record: neither can be matched.
  assert.equal(store.validateAssignment(state, { helperId: helper.id, jobId: 'cleanup' }).ok, false);
  assert.equal(store.validateAssignment(state, { helperId: 'helper-asha', kidId: kid.id, jobId: 'snack', nearbyVolunteerId: 'vol-jordan' }).ok, false);
});

test('removing someone removes their history, notes and photo', () => {
  const state = store.initialState();
  store.saveAssignment(state, { helperId: 'helper-asha', kidId: 'kid-eli', jobId: 'snack', nearbyVolunteerId: 'vol-jordan' });
  state.wrapNotes['helper-asha'] = 'Great job';
  assert.equal(store.removePerson(state, 'helper', 'helper-asha', 'lead').ok, false);
  assert.equal(store.removePerson(state, 'kid', 'kid-eli', 'coordinator').ok, true);
  assert.equal(state.assignments[0].kidId, undefined); assert.equal(state.assignments[0].status, 'cancelled');
  assert.equal(store.removePerson(state, 'helper', 'helper-asha', 'coordinator').ok, true);
  assert.equal(state.helpers.some(item => item.id === 'helper-asha'), false);
  assert.equal(state.assignments.length, 0); assert.equal('helper-asha' in state.wrapNotes, false);
});

test('a photo needs a yes on record, is small, goes when the yes goes, and expires', () => {
  const state = store.initialState();
  const jpeg = 'data:image/jpeg;base64,' + 'A'.repeat(400);
  assert.equal(store.setPhoto(state, 'kid', 'kid-eli', jpeg, 'coordinator').ok, false, 'no photo yes yet');
  store.updateKid(state, 'kid-eli', { photoConsent: true }, 'coordinator');
  assert.equal(store.setPhoto(state, 'kid', 'kid-eli', jpeg, 'lead').ok, false);
  assert.equal(store.setPhoto(state, 'kid', 'kid-eli', 'data:image/svg+xml;base64,AAAA', 'coordinator').ok, false, 'only JPEG');
  assert.equal(store.setPhoto(state, 'kid', 'kid-eli', 'data:image/jpeg;base64,' + 'A'.repeat(70000), 'coordinator').ok, false, 'too big');
  assert.equal(store.setPhoto(state, 'kid', 'kid-eli', jpeg, 'coordinator').ok, true);
  store.updateKid(state, 'kid-eli', { photoConsent: false }, 'coordinator');
  assert.equal(state.kids[0].photoData, undefined, 'taking back the yes removes the photo');
  store.updateHelper(state, 'helper-asha', { photoConsent: true }, 'coordinator');
  store.setPhoto(state, 'helper', 'helper-asha', jpeg, 'coordinator');
  state.helpers[0].photoAt = new Date(Date.now() - 40 * day).toISOString();
  store.setRetention(state, { deletePhotosAfterDays: 30, keepOperationalNotesAfterDays: 30 }, 'coordinator');
  store.applyRetention(state);
  assert.equal(state.helpers[0].photoData, undefined, 'old photos are cleared');
});

test('wrap-up needs every kid here today marked back or home with family', () => {
  const state = store.initialState();
  store.setPresence(state, 'kid', 'kid-eli', true, 'lead'); store.setPresence(state, 'kid', 'kid-noor', true, 'lead');
  assert.equal(store.headcount(state).done, false);
  assert.equal(store.setReturn(state, 'kid-eli', 'back', 'coordinator').ok, false, 'the lead does the head count');
  store.setReturn(state, 'kid-eli', 'back', 'lead');
  assert.deepEqual(store.headcount(state).missing.map(kid => kid.id), ['kid-noor']);
  store.setReturn(state, 'kid-noor', 'family', 'lead');
  assert.equal(store.headcount(state).done, true);
  store.setReturn(state, 'kid-noor', null, 'lead');
  assert.equal(store.headcount(state).done, false);
});

test('a note after Help is kept short and never reaches the summary', () => {
  const state = store.initialState();
  store.createAlert(state, 'helper-asha', 'help');
  const alert = state.helpAlerts[0];
  assert.equal(store.noteAlert(state, alert.id, '   ').ok, false);
  store.noteAlert(state, alert.id, 'Eli wanted the swings. ' + 'x'.repeat(400));
  assert.equal(alert.note.length, 280);
  assert.equal(store.outingSummary(state, jobs).includes('swings'), false);
});

test('a helper 20 minutes into one job is flagged for a break, once', () => {
  const state = store.initialState();
  const { assignment } = store.saveAssignment(state, { helperId: 'helper-asha', jobId: 'cleanup' });
  assert.equal(store.needsBreak(assignment), false, 'not started yet');
  store.startJob(state, assignment.id);
  assert.equal(store.needsBreak(assignment), false);
  assert.equal(store.needsBreak(assignment, Date.now() + 21 * 60000), true);
  store.offerBreak(state, assignment.id);
  assert.equal(store.needsBreak(assignment, Date.now() + 40 * 60000), false);
});

test('practice runs are only for the next level, and finishing a job gives one star even if sent twice', () => {
  const state = store.initialState();
  assert.deepEqual(store.practiceJobs(state.helpers[0]).sort(), ['play', 'talk']);
  assert.equal(store.recordPractice(state, 'helper-asha', 'buddy').ok, false, 'level 3 is not next');
  store.recordPractice(state, 'helper-asha', 'talk'); store.recordPractice(state, 'helper-asha', 'talk');
  assert.deepEqual(store.practiceFor(state, 'helper-asha'), { talk: 2 });
  const { assignment } = store.saveAssignment(state, { helperId: 'helper-asha', jobId: 'cleanup' });
  const before = state.helpers[0].stars;
  store.finishJob(state, { helperId: 'helper-asha', assignmentId: assignment.id, smiley: 'happy', star: true, eventId: 'ev-1' });
  store.finishJob(state, { helperId: 'helper-asha', assignmentId: assignment.id, smiley: 'happy', star: true, eventId: 'ev-1' });
  store.finishJob(state, { helperId: 'helper-asha', assignmentId: assignment.id, smiley: 'okay', star: true, eventId: 'ev-2' });
  assert.equal(state.helpers[0].stars, before + 1);
  assert.equal(assignment.status, 'complete'); assert.equal(assignment.smiley, 'okay');
  assert.match(store.outingSummary(state, jobs), /Practice runs/);
});

test('certificates and the family view show one helper only, and only with a family yes', () => {
  const state = store.initialState();
  for (let i = 0; i < 5; i += 1) { const { assignment } = store.saveAssignment(state, { helperId: 'helper-asha', kidId: 'kid-noor', jobId: 'snack', nearbyVolunteerId: 'vol-jordan' }); assignment.status = 'complete'; }
  const certs = store.certificatesFor(state, 'helper-asha');
  assert.deepEqual(certs.map(cert => cert.title), ['Thank You', 'Snack Star']);
  assert.equal(store.familyView(state, 'helper-asha'), null, 'no family yes yet');
  store.updateHelper(state, 'helper-asha', { familyConsent: true }, 'coordinator');
  const view = store.familyView(state, 'helper-asha');
  const text = JSON.stringify(view);
  assert.match(text, /Asha/);
  for (const secret of ['Noor', 'Eli', 'Ravi', 'Mina', 'peanut', 'Jordan']) assert.equal(text.includes(secret), false, secret);
  assert.equal(view.photoData, null);
});

test('Hindi and Spanish cover every helper step, job and screen word', () => {
  const english = new Set();
  for (const job of jobs) { english.add(job.name); english.add(job.desc); for (const step of job.steps) { english.add(step[1]); english.add(step[2]); } }
  for (const lang of ['hi', 'es']) {
    const missing = [...english].filter(text => i18n.t(text, lang) === text);
    assert.deepEqual(missing, [], `${lang} missing`);
  }
  assert.equal(i18n.t('No snack for {name}', 'es', { name: 'Noor' }), 'Sin merienda para Noor');
  assert.equal(i18n.t('No snack for {name}', 'en', { name: 'Noor' }), 'No snack for Noor');
  for (const word of html.matchAll(/data-t="([^"]+)"/g)) assert.notEqual(i18n.t(word[1], 'hi'), word[1], word[1]);
});

test('a locked copy opens only with the right words', async () => {
  const state = store.initialState();
  const locked = await Link.lockWithPassphrase(JSON.parse(store.recoveryExport(state)), 'tea and toast');
  assert.equal(JSON.stringify(locked).includes('Noor'), false);
  const back = await Link.unlockWithPassphrase(locked, 'tea and toast');
  assert.equal(back.state.kids[1].firstName, 'Noor');
  await assert.rejects(Link.unlockWithPassphrase(locked, 'wrong words'), /do not open/);
});

test('paper backup, certificates, family and backup pages exist and are cached for offline', () => {
  for (const page of ['print-cards.html', 'print-cards.js', 'certificate.html', 'certificate.js', 'family.html', 'family.js', 'backup.html', 'backup.js', 'print.css', 'i18n.js']) {
    assert.ok(readFileSync(new URL(`../${page}`, import.meta.url), 'utf8').length > 200, page);
    assert.match(serviceWorker, new RegExp(`'\\./${page.replace('.', '\\.')}'`), `${page} cached`);
  }
  assert.match(readFileSync(new URL('../print-cards.html', import.meta.url), 'utf8'), /id="if-the-tablet-stops"/);
});

test('photos and kid details never go to the phone or helper tablets', () => {
  const phone = app.slice(app.indexOf('function phoneSnapshot'), app.indexOf('function phoneCommand'));
  const tablets = app.slice(app.indexOf('function tabletSnapshot'), app.indexOf('function tabletCommand'));
  for (const part of [phone, tablets]) { assert.doesNotMatch(part, /photoData|allergy|parentConsent:|wrapNotes|note:/); }
});

test('feedback after an outing needs a face or words, and the download has no names', () => {
  const state = store.initialState();
  assert.equal(store.addFeedback(state, { role: 'stranger', day: 'happy' }).ok, false);
  assert.equal(store.addFeedback(state, { role: 'volunteer' }).ok, false);
  store.addFeedback(state, { role: 'volunteer', day: 'happy', tool: 'okay', easier: 'Clear jobs', harder: 'Sun on the screen', change: 'x'.repeat(900) });
  assert.equal(state.feedback[0].change.length, 400);
  const csv = store.feedbackCsv(state);
  assert.match(csv, /Sun on the screen/);
  for (const secret of ['Asha', 'Eli', 'Noor', 'peanut']) assert.equal(csv.includes(secret), false, secret);
});

test('a native speaker’s fix is used first, on that device only', () => {
  const saved = {};
  globalThis.localStorage = { getItem: key => saved[key] ?? null, setItem: (key, value) => { saved[key] = value; } };
  try {
    assert.equal(i18n.t('Next', 'hi'), 'आगे');
    saved[i18n.FIX_KEY] = JSON.stringify({ hi: { Next: { text: 'अगला', ok: true } } });
    i18n.loadFixes();
    assert.equal(i18n.t('Next', 'hi'), 'अगला');
    assert.equal(i18n.t('Next', 'es'), 'Siguiente');
    assert.equal(i18n.base('Next', 'hi'), 'आगे');
  } finally { delete globalThis.localStorage; i18n.loadFixes(); }
});

test('the lead’s phone can be woken, and the push carries no names', () => {
  const sw = serviceWorker;
  assert.match(sw, /addEventListener\('push'/);
  assert.match(sw, /someone needs you/);
  assert.doesNotMatch(sw.slice(sw.indexOf("addEventListener('push'")), /helperName|alert\.kid|firstName/);
  const phone = readFileSync(new URL('../lead-phone.js', import.meta.url), 'utf8');
  assert.match(phone, /pushManager\.subscribe/);
  assert.match(phone, /Add to Home Screen/);
  assert.match(app, /wakePhones/);
});

test('helper-only mode, the setup guide and the wording page are in place', () => {
  assert.match(html, /id="device-form"/);
  assert.match(css, /body\.helper-only \[data-action="lead-entry"\]/);
  const guide = readFileSync(new URL('../tablet-setup.html', import.meta.url), 'utf8');
  for (const words of ['Guided Access', 'App pinning', 'What we notice', 'The night before']) assert.match(guide, new RegExp(words));
  const wording = readFileSync(new URL('../wording.js', import.meta.url), 'utf8');
  assert.match(wording, /Looks right/);
});

test('the lead can end a match or change its volunteer; volunteers come and go with the coordinator', () => {
  const state = store.initialState();
  const { assignment } = store.saveAssignment(state, { helperId: 'helper-asha', kidId: 'kid-eli', jobId: 'snack', nearbyVolunteerId: 'vol-jordan' });
  assert.equal(assignment.outingDate, state.outing.date);
  assert.equal(store.changeVolunteer(state, assignment.id, 'vol-nobody', 'lead').ok, false);
  assert.equal(store.changeVolunteer(state, assignment.id, 'vol-kai', 'coordinator').ok, false);
  assert.equal(store.changeVolunteer(state, assignment.id, 'vol-kai', 'lead').ok, true);
  assert.equal(store.removeVolunteer(state, 'vol-kai', 'coordinator').ok, false, 'not while in a match');
  assert.equal(store.endAssignment(state, assignment.id, 'lead').ok, true);
  assert.equal(assignment.status, 'ended');
  assert.equal(store.removeVolunteer(state, 'vol-kai', 'coordinator').ok, true);
  const added = store.addVolunteer(state, { name: 'Priti' }, 'coordinator').volunteer;
  store.setPresence(state, 'volunteer', added.id, true, 'lead');
  // Only volunteers here today can be named as nearby.
  assert.equal(store.validateAssignment(state, { helperId: 'helper-asha', kidId: 'kid-eli', jobId: 'snack', nearbyVolunteerId: 'vol-jordan' }).ok, false);
  assert.equal(store.validateAssignment(state, { helperId: 'helper-asha', kidId: 'kid-eli', jobId: 'snack', nearbyVolunteerId: added.id }).ok, true);
});

test('updates wait during an outing; reports and certificates need the coordinator', () => {
  assert.match(serviceWorker, /type !== 'outing'/);
  assert.match(serviceWorker, /Date\.now\(\) < liveUntil/);
  for (const page of ['report.js', 'certificate.html']) assert.match(readFileSync(new URL(`../${page}`, import.meta.url), 'utf8'), /coord-until/);
  const report = readFileSync(new URL('../report.js', import.meta.url), 'utf8');
  assert.doesNotMatch(report, /firstName|safeTips|allergy/);
});

test('the day plan: the lead sets it and moves it on; helpers can only wish, never change anything', () => {
  const state = store.initialState();
  assert.equal(store.setSchedule(state, [{ label: 'Snack', icon: 'apple', time: '11:00' }], 'helper').ok, false);
  assert.equal(store.setSchedule(state, [{ label: '   ' }], 'lead').ok, false);
  assert.equal(store.setSchedule(state, [{ label: 'Arrive', icon: 'nope', time: '25:99x' }, { label: 'Snack', icon: 'apple', time: '11:00' }], 'lead').ok, true);
  assert.equal(state.outing.schedule[0].icon, 'star'); assert.equal(state.outing.schedule[0].time, '');
  assert.equal(store.moveSchedule(state, 5, 'lead').now, 1);
  assert.equal(store.scheduleNowNext(state).next, null);
  assert.equal(store.addWish(state, 'helper-asha', 'buddy').ok, true);
  assert.equal(state.helpers[0].unlockedJobs.includes('buddy'), false, 'a wish unlocks nothing');
  assert.equal(store.setStepPhoto(state, 'cleanup', 0, 'data:image/jpeg;base64,AAAA', 'lead').ok, false);
  assert.equal(store.setStepPhoto(state, 'cleanup', 9, 'data:image/jpeg;base64,AAAA', 'coordinator').ok, false);
  assert.equal(store.setStepPhoto(state, 'cleanup', 0, 'data:image/jpeg;base64,AAAA', 'coordinator').ok, true);
});

test('jobs made by the coordinator: checked, locked until unlocked, removable, and other people stay unnamed in exports', () => {
  const state = store.initialState();
  assert.equal(store.saveCustomJob(state, { name: 'Zoo Guide', steps: [{ title: 'One' }] }, 'coordinator').ok, false, 'two steps at least');
  assert.equal(store.saveCustomJob(state, { name: 'Zoo Guide', steps: [{ title: 'One' }, { title: 'Two' }] }, 'lead').ok, false);
  const { job } = store.saveCustomJob(state, { name: 'Zoo Guide', icon: 'not-an-icon', level: 9, steps: [{ title: 'Find the map' }, { title: 'Point' }] }, 'coordinator');
  assert.equal(job.icon, 'star'); assert.equal(job.level, 3); assert.equal(job.steps.at(-1)[1], 'Tap Done');
  assert.equal(store.validateAssignment(state, { helperId: 'helper-asha', jobId: job.id }).ok, false, 'locked until unlocked');
  store.unlockJob(state, 'helper-asha', job.id, 'coordinator');
  const { assignment } = store.saveAssignment(state, { helperId: 'helper-asha', kidId: 'kid-eli', jobId: job.id, nearbyVolunteerId: 'vol-jordan' });
  assert.equal(store.removeCustomJob(state, job.id, 'coordinator').ok, false, 'not while someone is doing it');
  assignment.status = 'complete';
  const record = JSON.stringify(store.exportPerson(state, 'helper', 'helper-asha'));
  assert.match(record, /Zoo Guide/); assert.equal(record.includes('Eli'), false);
  assert.equal(store.removeCustomJob(state, job.id, 'coordinator').ok, true);
  assert.equal(state.helpers[0].unlockedJobs.includes(job.id), false);
});

test('every yes has a date, and a year later it is due for review', () => {
  const state = store.initialState();
  store.updateHelper(state, 'helper-asha', { photoConsent: true }, 'coordinator');
  const helper = state.helpers[0];
  assert.ok(helper.yesDates.photoConsent);
  assert.deepEqual(store.yesReviewDue(helper), []);
  assert.deepEqual(store.yesReviewDue(helper, Date.now() + 400 * 86400000), ['photoConsent']);
  store.updateHelper(state, 'helper-asha', { photoConsent: false }, 'coordinator');
  assert.equal(helper.yesDates.photoConsent, undefined, 'a taken-back yes has no date');
});
