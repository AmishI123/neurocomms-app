// The Sunday report: how the day went, from this tablet's own records. Helpers' first names, no kid details.
(function () {
  const $ = s => document.querySelector(s);
  const { icon } = window.HelperJobsIcons; const { jobs } = window.HelperJobsData; const store = window.HelperJobsStore;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const main = $('#report');
  // Only after the coordinator PIN, in this browser session.
  let until = 0; try { until = Number(localStorage.getItem('helper-jobs.coord-until') || 0); } catch (_) {}
  if (Date.now() > until) { main.innerHTML = '<p class="print-empty">Open this from Coordinator tools on the outing tablet.</p>'; $('#report-date').closest('label').hidden = true; return; }
  const state = store.loadState();
  const day = iso => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const dates = [...new Set([...state.assignments.map(a => a.outingDate || day(a.createdAt)), ...state.helpAlerts.map(a => day(a.createdAt)), ...(state.feedback || []).map(f => f.outingDate)].filter(Boolean))].sort().reverse();
  const pick = $('#report-date');
  pick.innerHTML = dates.map(d => `<option value="${d}">${new Date(d + 'T12:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</option>`).join('') || '<option value="">No outings yet</option>';
  const name = id => state.helpers.find(h => h.id === id)?.name || 'A helper (removed)';
  const fmt = s => s < 60 ? `${Math.round(s)} s` : `${Math.floor(s / 60)} min ${String(Math.round(s % 60)).padStart(2, '0')} s`;
  const bars = (rows, unit) => {
    const max = Math.max(1, ...rows.map(r => r.value));
    return `<div class="r-bars" role="table">${rows.map(r => `<div class="r-bar" role="row" title="${esc(r.label)}: ${esc(r.text || r.value + ' ' + unit)}"><span class="r-bar-label" role="cell">${r.icon ? icon(r.icon) : ''}${esc(r.label)}</span><span class="r-bar-track" role="cell"><span class="r-bar-fill" style="width:${Math.max(2, r.value / max * 100)}%"></span></span><span class="r-bar-value" role="cell">${esc(r.text || r.value)}</span></div>`).join('')}</div>`;
  };
  function render(date) {
    const on = iso => (iso && day(iso) === date);
    const done = state.assignments.filter(a => (a.outingDate || day(a.createdAt)) === date && a.status === 'complete');
    const all = state.assignments.filter(a => (a.outingDate || day(a.createdAt)) === date);
    const alerts = state.helpAlerts.filter(a => on(a.createdAt));
    const answered = alerts.filter(a => a.acknowledgedAt).map(a => ({ ...a, secs: (Date.parse(a.acknowledgedAt) - Date.parse(a.createdAt)) / 1000 }));
    const sorted = answered.map(a => a.secs).sort((x, y) => x - y);
    const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
    const helpersHere = new Set(all.map(a => a.helperId));
    const head = state.outing.headcount || {}; const kidsMarked = Object.keys(head).length;
    const smiles = k => done.filter(a => a.smiley === k).length;
    const practice = (state.practice || []).filter(p => on(p.at));
    const breaks = all.filter(a => a.breakOfferedAt).length;
    const feedback = (state.feedback || []).filter(f => f.outingDate === date);
    const tile = (ic, big, label) => `<div class="r-tile">${icon(ic)}<strong>${big}</strong><span>${label}</span></div>`;
    const byJob = jobs.map(job => ({ label: job.name, icon: job.icon, value: done.filter(a => a.jobId === job.id).length })).filter(r => r.value);
    const byHelper = [...helpersHere].map(id => ({ label: name(id), icon: 'user', value: done.filter(a => a.helperId === id).length }));
    main.innerHTML = `<section class="sheet-page report-page">
      <p class="paper-kicker">Helper Jobs · Sunday report</p>
      <h1>${esc(state.outing.title || 'Sunday outing')} <i class="r-date">${esc(pick.options[pick.selectedIndex]?.textContent || date)}</i></h1>
      <div class="r-tiles">${tile('users', helpersHere.size, 'helpers had a job')}${tile('checklist', done.length, 'jobs done')}${tile('bell-ringing', alerts.length, 'times someone asked for help')}${tile('clock', median === null ? '–' : fmt(median), 'typical time to “I’m here”')}${tile('mood-happy', `${smiles('happy')} · ${smiles('okay')} · ${smiles('hard')}`, 'happy · okay · hard')}</div>
      <div class="r-cols">
        <div><h2>Jobs done</h2>${byJob.length ? bars(byJob, 'jobs') : '<p class="r-none">No jobs finished on this day.</p>'}</div>
        <div><h2>Jobs per helper</h2>${byHelper.length ? bars(byHelper, 'jobs') : '<p class="r-none">No helpers had a job.</p>'}</div>
      </div>
      <h2>Help, Stop and breaks: how fast someone came</h2>
      ${answered.length ? bars(answered.map(a => ({ label: `${name(a.helperId)} · ${a.kind === 'stop' ? 'Stop' : a.kind === 'break' ? 'Break' : 'Help'}`, icon: a.kind === 'stop' ? 'hand-stop' : a.kind === 'break' ? 'coffee' : 'bell-ringing', value: a.secs, text: fmt(a.secs) })), 's') : '<p class="r-none">Nobody asked for help, or it was not answered on the board.</p>'}
      ${alerts.length - answered.length ? `<p class="r-warn">${icon('alert-octagon')}${alerts.length - answered.length} not answered on the board or the lead’s phone.</p>` : ''}
      <div class="r-facts">
        <p>${icon('coffee')}<b>${breaks}</b> ${breaks === 1 ? 'break' : 'breaks'} offered after 20 minutes</p>
        <p>${icon('star')}<b>${practice.length}</b> practice ${practice.length === 1 ? 'run' : 'runs'}</p>
        <p>${icon('users')}<b>${kidsMarked}</b> ${kidsMarked === 1 ? 'kid' : 'kids'} marked at the head count</p>
      </div>
      <h2>What people said</h2>
      ${feedback.length ? `<ul class="r-quotes">${feedback.map(f => `<li><span class="r-who">${icon({ happy: 'mood-happy', okay: 'mood-neutral', hard: 'mood-sad' }[f.day] || 'message-circle')}${esc(f.role)}</span>${[f.easier && `<span><b>Easier:</b> ${esc(f.easier)}</span>`, f.harder && `<span><b>Harder:</b> ${esc(f.harder)}</span>`, f.change && `<span><b>Change:</b> ${esc(f.change)}</span>`].filter(Boolean).join('') || '<span>A face, no words.</span>'}</li>`).join('')}</ul>` : '<p class="r-none">No feedback saved for this day.</p>'}
      <p class="paper-small">From this tablet’s records. Helpers’ first names only: no kid names, tips or allergies. Keep with the coordinator.</p>
    </section>`;
  }
  pick.addEventListener('change', () => render(pick.value));
  if (dates.length) render(dates[0]); else main.innerHTML = '<p class="print-empty">No outings on this tablet yet.</p>';
})();
