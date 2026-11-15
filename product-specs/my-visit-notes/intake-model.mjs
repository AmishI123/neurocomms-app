import {validateVisit, question, action, uid} from './model.mjs';

export const SOURCE_LIMIT = 1024 * 1024;
export const PASSAGE_KINDS = ['question', 'action', 'private'];

export function sourceText(text) {
  if (typeof text !== 'string') throw Error('Choose plain text.');
  if (new TextEncoder().encode(text).length > SOURCE_LIMIT) throw Error('Text exceeds the 1 MiB limit. Choose a smaller part.');
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text)) throw Error('This contains unreadable control characters. Choose plain text.');
  return text.replace(/\r\n?/g, '\n');
}

export function decodeSource(bytes, filename) {
  if (!/\.txt$/i.test(filename)) throw Error('Choose a .txt file. PDFs, pictures and other file types are not supported.');
  if (bytes.byteLength > SOURCE_LIMIT) throw Error('File exceeds the 1 MiB limit. Choose a smaller text file.');
  let text;
  try { text = new TextDecoder('utf-8', {fatal: true}).decode(bytes); }
  catch { throw Error('This file is not readable UTF-8 text. Save a UTF-8 .txt copy and try again.'); }
  return sourceText(text);
}

export function passage(source, start, end, kind) {
  const text = sourceText(source);
  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > text.length || end <= start) throw Error('Select a passage first.');
  const item = {id: uid(), kind, text: text.slice(start, end)};
  validatePassages([item]);
  return item;
}

function validatePassages(items) {
  if (!Array.isArray(items)) throw Error('Chosen passages are invalid.');
  const ids = new Set();
  for (const item of items) {
    if (!item || typeof item.id !== 'string' || !item.id || ids.has(item.id) || !PASSAGE_KINDS.includes(item.kind)) throw Error('A chosen passage is invalid.');
    if (!sourceText(item.text).trim()) throw Error('Write something in each chosen passage, or remove the empty one.');
    ids.add(item.id);
  }
}

const matchText = text => text.replace(/\s+/gu, ' ').trim();

// Matching changes neither spelling nor stored whitespace. It does not infer meaning.
export function planPassages(destination, items, keepDuplicates = new Set()) {
  const visit = validateVisit(destination);
  validatePassages(items);
  const existing = [...visit.questions.map(q => q.text), ...visit.actions.map(a => a.text)].map(matchText);
  const privateText = matchText(visit.privateNotes);
  const accepted = [];
  const rows = items.map(item => {
    const key = matchText(item.text);
    const matchesVisit = existing.includes(key) || Boolean(privateText && privateText.includes(key));
    const matchesChosen = accepted.some(other => matchText(other.text) === key);
    const duplicate = matchesVisit || matchesChosen;
    const include = !duplicate || keepDuplicates.has(item.id);
    if (include) accepted.push({...item});
    return {...item, duplicate, include, reason: matchesVisit ? 'Matching text is already in this visit.' : matchesChosen ? 'Matching text is already in this selection.' : ''};
  });
  return {rows, additions: accepted};
}

// Pure append: never mutate source visit, selected items, or existing identifiers.
export function appendPassages(destination, items, keepDuplicates = new Set()) {
  const next = validateVisit(destination);
  const plan = planPassages(next, items, keepDuplicates);
  for (const item of plan.additions) {
    if (item.kind === 'question') next.questions.push(question(item.text));
    else if (item.kind === 'action') next.actions.push(action(item.text));
    else next.privateNotes += (next.privateNotes ? '\n\n' : '') + item.text;
  }
  if (!next.current) next.current = next.questions[0]?.id || null;
  return {visit: next, ...plan};
}
