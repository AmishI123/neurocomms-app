// The wording check page: every helper-facing line in English beside its Hindi or Spanish, to hear, fix and tick.
(function () {
  const I = window.HelperJobsI18n; const { jobs } = window.HelperJobsData; const { icon } = window.HelperJobsIcons;
  const $ = s => document.querySelector(s); const $$ = s => [...document.querySelectorAll(s)];
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const toast = m => { const el = $('#toast'); el.textContent = m; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 3000); };
  // Two ways to check: on the tablet itself, or on the checker's own phone from a link the coordinator sends.
  const Link = window.HelperJobsLink;
  const REVIEW = 'helper-jobs.wording-review.v1', REVIEW_FIXES = 'helper-jobs.wording-review-fixes.v1', OUTBOX = 'helper-jobs.wording-review-outbox.v1';
  const getJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; } catch (_) { return fallback; } };
  const setJSON = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };
  let review = Link ? Link.fromFragment(location.hash) : null;
  if (review) { setJSON(REVIEW, review); history.replaceState(null, '', location.pathname); } else review = getJSON(REVIEW, null);
  const FIXES = review ? REVIEW_FIXES : I.FIX_KEY;
  const read = () => getJSON(FIXES, {}) || {};
  const write = value => { setJSON(FIXES, value); if (!review) I.loadFixes(); };
  $$('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
  $$('[data-art]').forEach(el => { el.innerHTML = window.HelperJobsArt.draw(el.dataset.art); });

  // Groups: the screens first, then each job with its name, description and steps.
  const inJobs = new Set();
  const jobGroups = jobs.map(job => { const lines = [job.name, job.desc, ...job.steps.flatMap(step => [step[1], step[2]])]; lines.forEach(line => inJobs.add(line)); return { title: job.name, icon: job.icon, lines: [...new Set(lines)] }; });
  const screens = Object.keys(I.strings).filter(line => !inJobs.has(line));
  const groups = [{ title: 'Screens, buttons and the snack card', icon: 'device-tablet', lines: screens }, ...jobGroups];
  const all = [...new Set(groups.flatMap(group => group.lines))];
  let lang = 'hi';

  function render() {
    const fixes = read()[lang] || {};
    const filter = $('#filter').value;
    $('#groups').innerHTML = groups.map(group => {
      const rows = group.lines.filter(line => filter === 'all' || (filter === 'todo' && !fixes[line]?.ok) || (filter === 'changed' && fixes[line]?.text)).map(line => {
        const fix = fixes[line] || {};
        const value = fix.text || I.base(line, lang);
        return `<div class="wording-row ${fix.ok ? 'is-ok' : ''} ${fix.text ? 'is-changed' : ''}" data-line="${esc(line)}"><div class="wr-en"><small>English</small><p>${esc(line)}</p></div><label class="wr-tr"><small>${lang === 'hi' ? 'Hindi' : 'Spanish'}${fix.text ? ' · changed' : ''}</small><textarea rows="2" lang="${lang}" data-edit>${esc(value)}</textarea></label><div class="wr-do"><button type="button" class="secondary" data-hear>${icon('volume')}Hear it</button><label class="check-row"><input type="checkbox" data-ok ${fix.ok ? 'checked' : ''} /> Looks right</label></div></div>`;
      }).join('');
      return rows ? `<section class="wording-group"><h2 class="hj-h2 with-icon"><span class="h-icon">${icon(group.icon)}</span>${esc(group.title)}</h2>${rows}</section>` : '';
    }).join('') || '<p class="phone-calm">Nothing to show with this filter.</p>';
    progress();
  }
  function progress() {
    const fixes = read()[lang] || {};
    const done = all.filter(line => fixes[line]?.ok).length;
    $('#progress-count').textContent = `${done} of ${all.length}`;
    $('.wp-fill').style.strokeDashoffset = String(100 - Math.round(done / all.length * 100));
  }
  function update(line, patch) {
    const store = read(); store[lang] = store[lang] || {};
    const next = { ...(store[lang][line] || {}), ...patch };
    if (next.text !== undefined && next.text.trim() === I.base(line, lang)) delete next.text;
    if (!next.text && !next.ok) delete store[lang][line]; else store[lang][line] = next;
    write(store);
    if (review) send({ type: 'wording', lang, line, text: next.text || '', ok: Boolean(next.ok) });
  }
  document.addEventListener('change', event => {
    const row = event.target.closest('[data-line]');
    if (event.target.matches('[name="lang"]')) { lang = event.target.value; render(); return; }
    if (!row) return;
    if (event.target.matches('[data-ok]')) { update(row.dataset.line, { ok: event.target.checked }); row.classList.toggle('is-ok', event.target.checked); progress(); }
    if (event.target.matches('[data-edit]')) { const text = event.target.value.trim(); update(row.dataset.line, { text }); row.classList.toggle('is-changed', text !== I.base(row.dataset.line, lang)); }
  });
  $('#filter').addEventListener('change', render);
  document.addEventListener('click', event => {
    const hear = event.target.closest('[data-hear]');
    if (!hear) return;
    const text = hear.closest('[data-line]').querySelector('[data-edit]').value.replace(/\{name\}/g, lang === 'hi' ? 'आशा' : 'Asha').replace(/\{n\}|\{total\}/g, '3');
    if (!('speechSynthesis' in window)) return toast('This device cannot read aloud.');
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = I.LANGS[lang].speech; u.rate = 0.9; speechSynthesis.speak(u);
  });
  $('#download').addEventListener('click', () => {
    const fixes = read()[lang] || {};
    const lines = all.filter(line => fixes[line]).map(line => ({ english: line, before: I.base(line, lang), after: fixes[line].text || I.base(line, lang), looksRight: Boolean(fixes[line].ok) }));
    const blob = new Blob([JSON.stringify({ kind: 'helper-jobs-wording', language: lang, checkedAt: new Date().toISOString(), lines }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `helper-jobs-wording-${lang}.json`; document.body.append(a); a.click(); a.remove();
    toast(`Downloaded ${lines.length} lines. Send the file to the coordinator.`);
  });
  $('#load').addEventListener('change', async event => {
    try {
      const file = JSON.parse(await event.target.files[0].text());
      if (file.kind !== 'helper-jobs-wording' || !I.LANGS[file.language]) throw new Error();
      const store = read(); store[file.language] = store[file.language] || {};
      for (const item of file.lines || []) if (I.strings[item.english]) store[file.language][item.english] = { ...(item.after && item.after !== I.base(item.english, file.language) ? { text: String(item.after).slice(0, 300) } : {}), ...(item.looksRight ? { ok: true } : {}) };
      write(store); lang = file.language; $(`[name="lang"][value="${lang}"]`).checked = true; render();
      toast(`Loaded ${(file.lines || []).length} lines.`);
    } catch (_) { toast('That is not a wording file from Helper Jobs.'); }
    event.target.value = '';
  });
  $('#reset').addEventListener('click', () => { if (!confirm('Undo every change and tick for this language on this device?')) return; const store = read(); delete store[lang]; write(store); render(); });
  // Reviewer mode: fixes go to the tablet as commands (queued when offline); the tablet's copy comes back.
  const status = (text, state) => { const el = $('#review-status'); el.textContent = text; el.dataset.state = state; };
  function send(command) { const box = getJSON(OUTBOX, []); box.push({ ...command, id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }); setJSON(OUTBOX, box); flush(); }
  let flushing = false;
  async function flush() {
    if (flushing || !review) return; flushing = true;
    try {
      for (let box = getJSON(OUTBOX, []); box.length; box = getJSON(OUTBOX, [])) {
        await Link.sendCommand(review, box[0]);
        setJSON(OUTBOX, getJSON(OUTBOX, []).filter(item => item.id !== box[0].id));
      }
      status('Sent to the tablet', 'live');
    } catch (error) {
      status(error.status === 403 ? 'Link turned off' : 'Saved here · will send', 'off');
      if (error.status !== 403) setTimeout(flush, 5000);
    }
    flushing = false;
  }
  async function listen() {
    let seq = 0, failures = 0;
    Link.sendCommand(review, { id: `hello-${Date.now()}`, type: 'hello' }).catch(() => {});
    while (review) {
      try {
        const result = await Link.readSnapshot(review, seq, true);
        failures = 0;
        if (result.snapshot && result.snapshot.kind === 'wording') {
          seq = result.seq;
          // The tablet's copy wins, except for changes still waiting to be sent from here.
          const pending = getJSON(OUTBOX, []);
          const fixes = result.snapshot.fixes || {};
          const local = read();
          for (const item of pending) { fixes[item.lang] = fixes[item.lang] || {}; if (local[item.lang] && local[item.lang][item.line]) fixes[item.lang][item.line] = local[item.lang][item.line]; else delete fixes[item.lang][item.line]; }
          write(fixes);
          if (!document.activeElement || !document.activeElement.matches('textarea')) render(); else progress();
          if (!pending.length) status('Connected to the tablet', 'live');
        }
      } catch (error) {
        if (error.status === 403 || error.gone) { status(error.gone ? 'Waiting for the tablet' : 'Link turned off', 'off'); if (error.status === 403) return; }
        else status('Reconnecting…', 'off');
        failures += 1;
        await new Promise(done => setTimeout(done, Math.min(30000, 3000 * failures)));
      }
    }
  }
  if (review) {
    $('#review-banner').hidden = false; $('#review-leave').hidden = false; $('#reset').hidden = true;
    $('#local-note').textContent = 'Your changes go to the outing tablet as you make them. If the internet drops, they are kept here and sent when it is back.';
    $('#download').lastChild.textContent = 'Download a copy of the changes';
    $$('#review-banner [data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
    $('#review-leave').addEventListener('click', () => { if (!confirm('Stop checking for this tablet on this phone? Changes already sent stay on the tablet.')) return; [REVIEW, REVIEW_FIXES, OUTBOX].forEach(key => localStorage.removeItem(key)); location.replace(location.pathname); });
    window.addEventListener('online', flush);
    status('Connecting…', 'off');
    flush(); listen();
  }
  render();
})();
