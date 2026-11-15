import {uid, validateVisit} from './model.mjs';
import {sourceText, PASSAGE_KINDS} from './intake-model.mjs';

export const PREPARATION_FILE_LIMIT = 10 * 1024 * 1024;
const text = value => typeof value === 'string';
const identifier = value => text(value) && value.length > 0;
const count = value => Number.isSafeInteger(value) && value >= 0;

export function newPreparation() {
  return {version: 1, id: uid(), name: '', source: '', items: [], batchId: uid(),
    destination: {kind: 'new', visitId: null, snapshot: null},
    completed: [], result: null};
}

// Empty selected text is valid unfinished work. Intake review still refuses it.
export function validatePreparation(value) {
  if (!value || value.version !== 1 || !identifier(value.id) || !text(value.name) || !identifier(value.batchId) || !Array.isArray(value.items) || !Array.isArray(value.completed)) throw Error('This preparation is damaged or unsupported.');
  const ids = new Set();
  const items = value.items.map(item => {
    if (!item || !identifier(item.id) || ids.has(item.id) || !PASSAGE_KINDS.includes(item.kind)) throw Error('A preparation passage is invalid.');
    ids.add(item.id);
    return {id: item.id, kind: item.kind, text: sourceText(item.text)};
  });
  const d = value.destination;
  if (!d || !['new', 'saved', 'draft'].includes(d.kind)) throw Error('The preparation destination is invalid.');
  let destination;
  if (d.kind === 'new') {
    if (d.visitId !== null || d.snapshot !== null) throw Error('A new-visit destination must not contain an old visit.');
    destination = {kind: 'new', visitId: null, snapshot: null};
  } else {
    const snapshot = validateVisit(d.snapshot);
    if (!identifier(d.visitId) || snapshot.id !== d.visitId) throw Error('The preparation destination does not match its visit.');
    destination = {kind: d.kind, visitId: d.visitId, snapshot};
  }
  const batches = new Set();
  const completed = value.completed.map(entry => {
    if (!entry || !identifier(entry.batchId) || batches.has(entry.batchId) || !identifier(entry.visitId) || !count(entry.added) || !count(entry.skipped)) throw Error('The preparation completion record is invalid.');
    batches.add(entry.batchId);
    return {batchId: entry.batchId, visitId: entry.visitId, added: entry.added, skipped: entry.skipped};
  });
  if (batches.has(value.batchId)) throw Error('An applied batch cannot remain pending.');
  const result = value.result === null ? null : validateVisit(value.result);
  if (result && !completed.some(entry => entry.visitId === result.id)) throw Error('A recovered result needs a completion record.');
  return {version: 1, id: value.id, name: value.name, source: sourceText(value.source), items,
    batchId: value.batchId, destination, completed, result};
}

export function preparationBackup(preparation) {
  const output = JSON.stringify({format: 'my-visit-preparation-backup', version: 1, preparation: validatePreparation(preparation)}, null, 2);
  if (new TextEncoder().encode(output).length > PREPARATION_FILE_LIMIT) throw Error('Preparation backup exceeds the 10 MiB limit. Keep a smaller preparation.');
  return output;
}

export function restorePreparation(input) {
  if (!text(input) || new TextEncoder().encode(input).length > PREPARATION_FILE_LIMIT) throw Error('Preparation backup exceeds the 10 MiB limit.');
  const value = JSON.parse(input);
  if (!value || value.format !== 'my-visit-preparation-backup' || value.version !== 1) throw Error('Choose a supported private preparation backup, not a visit backup.');
  return validatePreparation(value.preparation);
}

export function completePreparation(preparation, result, addedCount, skippedCount) {
  const next = validatePreparation(preparation), visit = validateVisit(result);
  if (!count(addedCount) || addedCount < 1 || !count(skippedCount) || addedCount + skippedCount !== next.items.length) throw Error('Completion counts do not match the reviewed passages.');
  next.completed.push({batchId: next.batchId, visitId: visit.id, added: addedCount, skipped: skippedCount});
  next.items = [];
  next.batchId = uid();
  next.result = visit;
  return next;
}

export function preparationDestination(preparation, visits) {
  const p = validatePreparation(preparation), d = p.destination;
  if (d.kind === 'new') return {state: 'new', visit: null};
  if (d.kind === 'draft') return {state: 'draft', visit: d.snapshot};
  const latest = visits.find(v => v.id === d.visitId);
  if (!latest) return {state: 'missing', visit: null};
  const clean = validateVisit(latest);
  return {state: JSON.stringify(clean) === JSON.stringify(d.snapshot) ? 'unchanged' : 'changed', visit: clean};
}

// Called by the app inside the same locked write that changes a saved visit.
// Retain receipts when a preparation is removed: an older backup must not replay it.
export function applyPreparationBatch(store, preparation, result, addedCount, skippedCount, saveVisit) {
  const p = validatePreparation(preparation);
  if (!Array.isArray(store.preparations) || !Array.isArray(store.preparationReceipts)) throw Error('Preparation storage is unavailable.');
  if (store.preparationReceipts.some(receipt => receipt.batchId === p.batchId)) throw Error('This batch was already added. Open its result instead of adding it again.');
  const next = structuredClone(store), finished = completePreparation(p, result, addedCount, skippedCount);
  const index = next.preparations.findIndex(entry => entry.id === p.id);
  if (index < 0) throw Error('Save this preparation before recording its completion.');
  if (JSON.stringify(validatePreparation(next.preparations[index])) !== JSON.stringify(p)) throw Error('Saved preparation changed. Review the latest copy before adding.');
  if (saveVisit) {
    const i = next.visits.findIndex(v => v.id === finished.result.id);
    if (i < 0) throw Error('The saved destination is no longer available.');
    if (JSON.stringify(validateVisit(next.visits[i])) !== JSON.stringify(p.destination.snapshot)) throw Error('The destination changed. Review it again.');
    next.visits[i] = finished.result;
    finished.destination = {kind: 'saved', visitId: finished.result.id, snapshot: finished.result};
  } else {
    finished.destination = {kind: 'draft', visitId: finished.result.id, snapshot: finished.result};
  }
  next.preparations[index] = finished;
  next.preparationReceipts.push({batchId: p.batchId, preparationId: p.id, visitId: finished.result.id});
  return {store: next, preparation: finished};
}
