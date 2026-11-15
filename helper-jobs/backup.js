// The coordinator's laptop: keeps the newest locked copy from the tablet in view, and saves it as a locked file.
(function () {
  const Link = window.HelperJobsLink;
  const KEY = 'helper-jobs.backup-view.v1';
  const $ = selector => document.querySelector(selector);
  const toast = message => { const el = $('#toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 3200); };
  let link = Link.fromFragment(location.hash);
  if (link) { try { localStorage.setItem(KEY, JSON.stringify(link)); } catch (_) {} history.replaceState(null, '', location.pathname); }
  else { try { link = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) { link = null; } }
  if (!link || !Link.available()) { $('#backup-missing').hidden = false; $('#backup-status').textContent = 'Not paired'; return; }
  $('#backup-board').hidden = false;
  const icon = name => window.HelperJobsIcons.icon(name);
  document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
  document.querySelectorAll('[data-art]').forEach(el => { el.innerHTML = window.HelperJobsArt.draw(el.dataset.art); });
  let seq = 0, copy = null, failures = 0;
  const when = iso => new Date(iso).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' });
  function render() {
    if (!copy) return;
    $('#backup-title').textContent = `Newest copy: ${when(copy.savedAt)}`;
    $('#backup-when').textContent = `${copy.title || 'Outing'} · updates by itself while the tablet is online.`;
    $('#backup-summary').innerHTML = `<div>${icon('users')}<strong>${copy.counts.helpers}</strong><span>helpers</span></div><div>${icon('mood-happy')}<strong>${copy.counts.kids}</strong><span>kids</span></div><div>${icon('checklist')}<strong>${copy.counts.jobs}</strong><span>matches</span></div>`;
  }
  async function loop() {
    for (;;) {
      try {
        const result = await Link.readSnapshot(link, seq, true);
        failures = 0;
        if (result.snapshot && result.snapshot.kind === 'backup') { seq = result.seq; copy = result.snapshot; render(); }
        $('#backup-status').textContent = copy ? 'Up to date' : 'Waiting for the tablet'; $('#backup-status').dataset.state = 'live';
      } catch (error) {
        failures += 1;
        if (error.gone || error.status === 403) { $('#backup-status').textContent = 'Backup ended'; $('#backup-status').dataset.state = 'off'; return; }
        $('#backup-status').textContent = 'Reconnecting…'; $('#backup-status').dataset.state = 'off';
        await new Promise(done => setTimeout(done, Math.min(20000, 2000 * failures)));
      }
    }
  }
  $('#backup-save').addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!copy) return toast('No copy from the tablet yet.');
    const words = new FormData(form).get('passphrase');
    if (String(words).length < 8) return toast('Use at least 8 letters.');
    const locked = await Link.lockWithPassphrase({ exportedAt: copy.savedAt, state: copy.state, outbox: copy.outbox || [] }, words);
    const blob = new Blob([JSON.stringify(locked)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `helper-jobs-copy-${copy.savedAt.slice(0, 10)}.hjcopy`; document.body.append(a); a.click(); a.remove();
    form.reset(); toast('Locked copy saved. Keep the words safe.');
  });
  $('#backup-forget').addEventListener('click', () => { localStorage.removeItem(KEY); location.replace('./backup.html'); });
  Link.sendCommand(link, { id: Link.id('hello'), type: 'hello', at: new Date().toISOString() }).catch(() => {});
  loop();
})();
