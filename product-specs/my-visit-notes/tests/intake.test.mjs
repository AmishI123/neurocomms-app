import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {blank, question, action, backup, restore, summary, carryForward} from '../model.mjs';
import {SOURCE_LIMIT, sourceText, decodeSource, passage, planPassages, appendPassages} from '../intake-model.mjs';
globalThis.crypto ??= webcrypto;

const item = (text, kind = 'question') => passage(text, 0, text.length, kind);
test('source: preserves wording and spaces, normalizes line endings only', () => {
  assert.equal(sourceText('  café\r\n日本語\rnext\t '), '  café\n日本語\nnext\t ');
  assert.equal(decodeSource(new TextEncoder().encode('é'), 'notes.TXT'), 'é');
});
test('source: refuses wrong file types, invalid encoding, binary controls and oversized text', () => {
  assert.throws(() => decodeSource(new Uint8Array([65]), 'notes.pdf'), /\.txt/);
  assert.throws(() => decodeSource(new Uint8Array([255]), 'notes.txt'), /UTF-8/);
  assert.throws(() => sourceText('a\0b'), /control/);
  assert.throws(() => sourceText('é'.repeat(SOURCE_LIMIT)), /limit/);
  assert.throws(() => decodeSource(new Uint8Array(SOURCE_LIMIT + 1), 'notes.txt'), /limit/);
});
test('selection: exact snapshot, valid bounds, nonblank text and recognized kinds', () => {
  const chosen = passage('before\n  Ask me?  \nafter', 7, 18, 'question');
  assert.equal(chosen.text, '  Ask me?  ');
  assert.throws(() => passage('a', -1, 1, 'question'));
  assert.throws(() => passage('a', 0, 2, 'question'));
  assert.throws(() => passage('a', 0, 1, 'answer'));
  assert.throws(() => item(' \n '));
});
test('append: preserves existing fields and states, creates only selected destination fields', () => {
  const v = blank(); v.title = 'Keep title'; v.privateNotes = 'Original private';
  v.questions = [{...question('Old question'), state: 'Answered', note: 'Old answer'}];
  v.current = v.questions[0].id; v.actions = [{...action('Old action'), state: 'Done'}];
  v.requests = [{text: 'Wait please', visible: true}];
  const before = structuredClone(v);
  const result = appendPassages(v, [item(' New question '), item('Call someone', 'action'), item('Private addition', 'private')]).visit;
  assert.deepEqual(v, before);
  assert.deepEqual(result.questions[0], before.questions[0]);
  assert.deepEqual(result.actions[0], before.actions[0]);
  assert.deepEqual(result.requests, before.requests);
  assert.equal(result.title, before.title); assert.equal(result.id, before.id); assert.equal(result.current, before.current);
  assert.equal(result.questions[1].text, ' New question '); assert.equal(result.questions[1].state, 'Open'); assert.equal(result.questions[1].note, '');
  assert.equal(result.actions[1].state, 'To do'); assert.equal(result.actions[1].date, ''); assert.equal(result.actions[1].contact, '');
  assert.equal(result.privateNotes, 'Original private\n\nPrivate addition');
});
test('duplicates: whitespace comparison across types and private passages, explicit override', () => {
  const v = blank(); v.questions = [question('Ask   me')]; v.privateNotes = 'My secret detail here';
  const items = [item('Ask\nme', 'action'), item('secret detail', 'private'), item('New'), item(' New ', 'private')];
  const plan = planPassages(v, items);
  assert.deepEqual(plan.rows.map(r => r.include), [false, false, true, false]);
  assert.equal(plan.additions[0].text, 'New');
  assert.equal(appendPassages(v, items, new Set(items.map(i => i.id))).additions.length, 4);
  assert.equal(planPassages(v, [item('ask me')]).additions.length, 1, 'not a meaning or case matcher');
});
test('repeat append skips matching passages; malformed and duplicate selection identifiers rejected', () => {
  const items = [item('Question'), item('Next', 'action'), item('Secret', 'private')];
  const once = appendPassages(blank(), items).visit;
  const twice = appendPassages(once, items);
  assert.equal(twice.additions.length, 0); assert.deepEqual(twice.visit, once);
  assert.throws(() => planPassages(once, [items[0], items[0]]));
  assert.throws(() => planPassages(once, [{...items[0], text: ''}]));
});
test('downstream: backup preserves chosen private content; summary and carry-forward exclude it', () => {
  const source = 'Unselected source must not enter a visit';
  const v = appendPassages(blank(), [item('Ask'), item('Do', 'action'), item('Secret', 'private')]).visit;
  assert.deepEqual(restore(backup(v)), v); assert.ok(!backup(v).includes(source));
  const qs = new Set(v.questions.map(q => q.id)), steps = new Set(v.actions.map(a => a.id));
  const output = summary(v, qs, new Set(), new Set(), steps);
  assert.ok(output.includes('Ask')); assert.ok(output.includes('Do')); assert.ok(!output.includes('Secret'));
  const next = carryForward(v, qs, steps); assert.equal(next.privateNotes, ''); assert.equal(next.questions[0].text, 'Ask');
});
