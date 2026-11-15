(() => {
  'use strict';

  const STORAGE_KEY = 'communication-access-card.v1';
  const sectionsEl = document.querySelector('#sections');
  const previewEl = document.querySelector('#card-preview');
  const titleEl = document.querySelector('#card-title');
  const identifierEl = document.querySelector('#card-identifier');
  const layoutEl = document.querySelector('#layout-select');
  const saveStateEl = document.querySelector('#save-state');
  const toastEl = document.querySelector('#toast');
  const dialogEl = document.querySelector('#privacy-dialog');
  const dialogBox = dialogEl.querySelector('.dialog');
  const dialogContentEl = document.querySelector('#dialog-content');
  let toastTimer;
  let pendingAction = null;
  let lastFocused = null;

  const templates = [
    { title: 'Getting my attention', items: ['Please speak directly to me.', 'Please say my name or get my attention before giving important information.'] },
    { title: 'How I may communicate', items: ['I may use speech, writing, typing, signs, gestures, symbols, or AAC.', 'Please accept my communication method instead of asking me to use only speech.'] },
    { title: 'Understanding and processing', items: ['Please use clear, direct language and one question at a time.', 'Please give me extra time to understand and answer.'] },
    { title: 'Turn-taking', items: ['Please wait for my answer. Silence does not automatically mean yes.', 'Please do not finish my message or answer for me unless I ask.'] },
    { title: 'If communication breaks down', items: ['Please ask me to try another way rather than guessing what I mean.', 'Please check your understanding with me.'] },
    { title: 'What not to assume', items: ['Do not assume that my voice, speed, eye contact, or body movement tells you how much I understand.', 'Please ask me instead of deciding what I want.'] },
  ];

  let state = blankState();

  function uid(prefix) { return `${prefix}-${Math.random().toString(36).slice(2, 9)}`; }
  function blankState() {
    return { version: 1, title: 'How to communicate with me', identifier: '', layout: 'large', sections: [] };
  }
  function exampleState() {
    return {
      ...blankState(),
      identifier: 'My communication card',
      sections: templates.slice(0, 5).map((section, index) => ({
        id: uid('section'), title: section.title, visible: true, sortOrder: index,
        items: section.items.map((text, itemIndex) => ({ id: uid('item'), text, visible: true, sortOrder: itemIndex, source: 'template' }))
      }))
    };
  }
  function normalize(raw) {
    const source = raw && typeof raw === 'object' ? raw : blankState();
    return {
      version: 1,
      title: typeof source.title === 'string' ? source.title.slice(0, 80) : 'How to communicate with me',
      identifier: typeof source.identifier === 'string' ? source.identifier.slice(0, 80) : '',
      layout: source.layout === 'compact' ? 'compact' : 'large',
      sections: Array.isArray(source.sections) ? source.sections.map((section, sIndex) => ({
        id: typeof section.id === 'string' ? section.id : uid('section'),
        title: typeof section.title === 'string' ? section.title.slice(0, 100) : 'Communication support',
        visible: section.visible !== false,
        sortOrder: sIndex,
        items: Array.isArray(section.items) ? section.items.map((item, iIndex) => ({
          id: typeof item.id === 'string' ? item.id : uid('item'),
          text: typeof item.text === 'string' ? item.text.slice(0, 500) : '',
          visible: item.visible !== false,
          sortOrder: iIndex,
          source: item.source === 'custom' ? 'custom' : 'template'
        })) : []
      })) : []
    };
  }
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }
  function visibleSections() {
    return state.sections.filter(section => section.visible !== false && section.items.some(item => item.visible !== false && item.text.trim()));
  }
  function visibleItems(section) { return section.items.filter(item => item.visible !== false && item.text.trim()); }
  function render() {
    titleEl.value = state.title;
    identifierEl.value = state.identifier;
    layoutEl.value = state.layout;
    renderEditor();
    renderPreview();
  }
  function renderEditor() {
    if (!state.sections.length) {
      sectionsEl.innerHTML = '<div class="panel empty-editor"><h3>Your card is empty</h3><p class="help-text">Add a section or try the example to get started.</p></div>';
      return;
    }
    sectionsEl.innerHTML = state.sections.map((section, sectionIndex) => `
      <article class="editor-section" data-section-id="${escapeHtml(section.id)}">
        <div class="section-top">
          <div class="section-title-wrap">
            <label class="sr-only" for="section-title-${escapeHtml(section.id)}">Section title</label>
            <input class="section-title-input" id="section-title-${escapeHtml(section.id)}" data-field="section-title" value="${escapeHtml(section.title)}" maxlength="100" />
          </div>
          <div class="section-tools" aria-label="Section controls">
            <button class="icon-button" type="button" data-action="move-section-up" aria-label="Move section up" ${sectionIndex === 0 ? 'disabled' : ''}>↑</button>
            <button class="icon-button" type="button" data-action="move-section-down" aria-label="Move section down" ${sectionIndex === state.sections.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="icon-button delete" type="button" data-action="delete-section" aria-label="Delete section">×</button>
          </div>
        </div>
        <div class="section-body">
          <div class="statement-list">
            ${section.items.map((item, itemIndex) => statementHtml(section, item, itemIndex)).join('')}
          </div>
          <button class="add-item" type="button" data-action="add-item">+ Add a statement to this section</button>
        </div>
      </article>`).join('');
  }
  function statementHtml(section, item, itemIndex) {
    const checked = item.visible !== false;
    return `<div class="statement ${checked ? '' : 'hidden-statement'}" data-item-id="${escapeHtml(item.id)}">
      <label class="visibility" title="${checked ? 'This statement appears on the shared card' : 'This statement is hidden from the shared card'}">
        <input type="checkbox" data-field="item-visible" ${checked ? 'checked' : ''} /> <span>${checked ? 'Shown' : 'Hidden'}</span>
      </label>
      <label class="sr-only" for="item-${escapeHtml(item.id)}">Statement ${itemIndex + 1}</label>
      <textarea id="item-${escapeHtml(item.id)}" data-field="item-text" maxlength="500" rows="2">${escapeHtml(item.text)}</textarea>
      <div class="statement-tools">
        <button class="icon-button" type="button" data-action="move-item-up" aria-label="Move statement up" ${itemIndex === 0 ? 'disabled' : ''}>↑</button>
        <button class="icon-button" type="button" data-action="move-item-down" aria-label="Move statement down" ${itemIndex === section.items.length - 1 ? 'disabled' : ''}>↓</button>
        <button class="icon-button delete" type="button" data-action="delete-item" aria-label="Delete statement">×</button>
      </div>
    </div>`;
  }
  function renderPreview() {
    const sections = visibleSections();
    previewEl.classList.toggle('card-preview-large', state.layout === 'large');
    previewEl.classList.toggle('card-preview-compact', state.layout === 'compact');
    if (!sections.length) {
      previewEl.innerHTML = '<div class="empty-preview"><p>Your selected communication information will appear here.</p></div>';
      return;
    }
    const title = state.title.trim() || 'My communication-access card';
    const identifier = state.identifier.trim();
    previewEl.innerHTML = `<h2 class="preview-title">${escapeHtml(title)}</h2>
      ${identifier ? `<p class="preview-identifier">${escapeHtml(identifier)}</p>` : ''}
      <div class="preview-intro">Please communicate directly with me. The information below describes what I have chosen to share.</div>
      ${sections.map(section => `<section class="preview-section"><h3>${escapeHtml(section.title || 'Communication support')}</h3><ul>${visibleItems(section).map(item => `<li>${escapeHtml(item.text)}</li>`).join('')}</ul></section>`).join('')}`;
  }
  function findSection(target) { return state.sections.find(section => section.id === target.closest('[data-section-id]')?.dataset.sectionId); }
  function findItem(target) { const section = findSection(target); return { section, item: section?.items.find(item => item.id === target.closest('[data-item-id]')?.dataset.itemId) }; }
  function swap(list, index, nextIndex) { if (index < 0 || nextIndex < 0 || index >= list.length || nextIndex >= list.length) return; [list[index], list[nextIndex]] = [list[nextIndex], list[index]]; }
  function handleEditorInput(event) {
    const target = event.target;
    if (target.id === 'card-title') state.title = target.value;
    else if (target.id === 'card-identifier') state.identifier = target.value;
    else if (target.id === 'layout-select') state.layout = target.value;
    else if (target.dataset.field === 'section-title') findSection(target).title = target.value;
    else if (target.dataset.field === 'item-text') findItem(target).item.text = target.value;
    else return;
    renderPreview();
  }
  function handleEditorChange(event) {
    const target = event.target;
    if (target.dataset.field !== 'item-visible') return;
    const found = findItem(target);
    found.item.visible = target.checked;
    render();
  }
  function handleAction(event) {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    const section = findSection(button);
    const sectionIndex = section ? state.sections.indexOf(section) : -1;
    const found = findItem(button);
    const itemIndex = found.item && found.section ? found.section.items.indexOf(found.item) : -1;
    if (action === 'delete-section') state.sections.splice(sectionIndex, 1);
    if (action === 'move-section-up') swap(state.sections, sectionIndex, sectionIndex - 1);
    if (action === 'move-section-down') swap(state.sections, sectionIndex, sectionIndex + 1);
    if (action === 'delete-item') found.section.items.splice(itemIndex, 1);
    if (action === 'move-item-up') swap(found.section.items, itemIndex, itemIndex - 1);
    if (action === 'move-item-down') swap(found.section.items, itemIndex, itemIndex + 1);
    if (action === 'add-item') section.items.push({ id: uid('item'), text: '', visible: true, sortOrder: section.items.length, source: 'custom' });
    render();
    if (action === 'add-item') sectionsEl.querySelector(`[data-item-id="${state.sections[sectionIndex].items.at(-1).id}"] textarea`)?.focus();
  }
  function addSection(title = 'New section') {
    const section = { id: uid('section'), title, visible: true, sortOrder: state.sections.length, items: [{ id: uid('item'), text: '', visible: true, sortOrder: 0, source: 'custom' }] };
    state.sections.push(section); render();
    document.querySelector(`[data-section-id="${section.id}"] .section-title-input`)?.focus();
  }
  function saveCard() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); saveStateEl.textContent = `Saved on this device at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`; toast('Saved only on this device.'); }
    catch { toast('This browser could not save the card. You can still print or export it.'); }
  }
  function loadCard() {
    try { const stored = localStorage.getItem(STORAGE_KEY); if (stored) { state = normalize(JSON.parse(stored)); saveStateEl.textContent = 'Saved card loaded from this device'; } }
    catch { state = blankState(); saveStateEl.textContent = 'Saved card could not be read'; }
  }
  function clearCard() {
    if (!localStorage.getItem(STORAGE_KEY) && !state.sections.length) { toast('There is no saved card to delete.'); return; }
    if (!window.confirm('Delete the card saved on this device? This cannot be undone.')) return;
    localStorage.removeItem(STORAGE_KEY); state = blankState(); saveStateEl.textContent = 'Saved card deleted'; render(); toast('Saved card deleted.');
  }
  function cardText() {
    const lines = [state.title.trim() || 'My communication-access card'];
    if (state.identifier.trim()) lines.push(state.identifier.trim());
    lines.push('', 'Please communicate directly with me. The information below describes what I have chosen to share.', '');
    visibleSections().forEach(section => { lines.push(section.title.trim() || 'Communication support'); visibleItems(section).forEach(item => lines.push(`• ${item.text.trim()}`)); lines.push(''); });
    return lines.join('\n').trim();
  }
  function disclosure(action) {
    pendingAction = action; lastFocused = document.activeElement; dialogContentEl.textContent = cardText(); dialogEl.hidden = false; dialogBox.focus();
  }
  function closeDialog() { dialogEl.hidden = true; pendingAction = null; lastFocused?.focus(); }
  function dialogFocusables() {
    return [...dialogBox.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')];
  }
  function keepFocusInDialog(event) {
    if (dialogEl.hidden || event.key !== 'Tab') return;
    const focusables = dialogFocusables();
    if (!focusables.length) { event.preventDefault(); dialogBox.focus(); return; }
    const first = focusables[0];
    const last = focusables.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogBox)) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogBox)) {
      event.preventDefault(); first.focus();
    }
  }
  function confirmDisclosure() {
    const action = pendingAction; closeDialog(); if (action) action();
  }
  function download(filename, content, type) { const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); }
  function exportHtml() {
    const title = state.title.trim() || 'My communication-access card';
    const body = `<main class="card"><h1>${escapeHtml(title)}</h1>${state.identifier.trim() ? `<p class="identifier">${escapeHtml(state.identifier)}</p>` : ''}<p class="intro">Please communicate directly with me. The information below describes what I have chosen to share.</p>${visibleSections().map(section => `<section><h2>${escapeHtml(section.title || 'Communication support')}</h2><ul>${visibleItems(section).map(item => `<li>${escapeHtml(item.text)}</li>`).join('')}</ul></section>`).join('')}</main>`;
    download('communication-access-card.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>body{margin:0;padding:32px;background:#f4f7f4;color:#1d2927;font:18px/1.55 system-ui,sans-serif}.card{max-width:760px;margin:auto;padding:32px;background:#fff;border-top:8px solid #286153;border-radius:12px}.card h1{color:#173d35;line-height:1.1}.identifier{color:#5e6d69;font-weight:700}.intro{padding:12px;background:#fff3cf;border-left:4px solid #d19f14}.card h2{font-size:1.1em;border-bottom:2px solid #dce9e3}.card li{margin-bottom:8px}</style></head><body>${body}</body></html>`, 'text/html');
    toast('HTML card exported.');
  }
  function exportText() { download('communication-access-card.txt', cardText(), 'text/plain;charset=utf-8'); toast('Text card exported.'); }
  async function shareCard() {
    const text = cardText();
    if (navigator.share) { try { await navigator.share({ title: state.title || 'Communication-access card', text }); toast('Share sheet opened.'); } catch (error) { if (error.name !== 'AbortError') toast('Sharing was cancelled or unavailable.'); } return; }
    try { await navigator.clipboard.writeText(text); toast('Card text copied to the clipboard.'); }
    catch { download('communication-access-card.txt', text, 'text/plain;charset=utf-8'); toast('Clipboard was unavailable, so a text file was downloaded.'); }
  }
  function toast(message) { clearTimeout(toastTimer); toastEl.textContent = message; toastEl.classList.add('show'); toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3500); }
  function init() {
    loadCard(); render();
    titleEl.addEventListener('input', handleEditorInput); identifierEl.addEventListener('input', handleEditorInput); layoutEl.addEventListener('change', handleEditorInput);
    sectionsEl.addEventListener('input', handleEditorInput); sectionsEl.addEventListener('change', handleEditorChange); sectionsEl.addEventListener('click', handleAction);
    document.querySelector('#load-example').addEventListener('click', () => { state = exampleState(); render(); toast('Example loaded. Edit every sentence so it is right for you.'); });
    document.querySelector('#start-blank').addEventListener('click', () => { state = blankState(); render(); toast('Blank card ready.'); });
    document.querySelector('#add-section').addEventListener('click', () => addSection());
    document.querySelector('#save-card').addEventListener('click', saveCard); document.querySelector('#clear-card').addEventListener('click', clearCard);
    document.querySelector('#print-card').addEventListener('click', () => window.print());
    document.querySelector('#export-html').addEventListener('click', () => disclosure(exportHtml)); document.querySelector('#export-text').addEventListener('click', () => disclosure(exportText)); document.querySelector('#share-card').addEventListener('click', () => disclosure(shareCard));
    document.querySelector('#show-privacy').addEventListener('click', () => disclosure(null)); document.querySelector('#close-dialog').addEventListener('click', closeDialog); document.querySelector('#dialog-cancel').addEventListener('click', closeDialog); document.querySelector('#dialog-confirm').addEventListener('click', confirmDisclosure);
    dialogEl.addEventListener('click', event => { if (event.target === dialogEl) closeDialog(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !dialogEl.hidden) closeDialog(); keepFocusInDialog(event); });
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  init();
})();
