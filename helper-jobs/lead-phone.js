// The lead's phone: shows the outing board from the tablet and answers Help with "I'm here".
(function () {
  const Link = window.HelperJobsLink;
  const KEY = 'helper-jobs.phone-link.v1';
  const SOUND = 'helper-jobs.phone-sound.v1';
  const STRONG = 'helper-jobs.phone-strong.v1';
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const store = { get(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } }, set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} }, drop(key) { try { localStorage.removeItem(key); } catch (_) {} } };
  let link = Link.fromFragment(location.hash);
  if (link) { store.set(KEY, link); history.replaceState(null, '', location.pathname); } // keep the key out of the address bar
  else link = store.get(KEY);
  if (!link || !Link.available()) { $('#phone-missing').hidden = false; $('#phone-status').textContent = 'Not paired'; return; }
  $('#phone-board').hidden = false;

  let seq = 0, board = null, lastHeard = 0, failures = 0;
  const seen = new Set();
  const pending = new Set();
  const waitingFor = new Map(); // command id -> what to say when the tablet answers
  let manageSig = '';
  const icon = name => (window.HelperJobsIcons ? window.HelperJobsIcons.icon(name) : '');
  document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
  const sound = $('#phone-sound');
  sound.checked = store.get(SOUND) === true;
  const strong = $('#phone-strong'); strong.checked = store.get(STRONG) === true;
  strong.addEventListener('change', () => store.set(STRONG, strong.checked));
  sound.addEventListener('change', () => store.set(SOUND, sound.checked));

  function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2800); }
  function ago(iso) {
    const s = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 1000));
    return s < 60 ? `${s} s ago` : s < 3600 ? `${Math.round(s / 60)} min ago` : 'over an hour ago';
  }
  function beep() {
    try { const ctx = new (window.AudioContext || window.webkitAudioContext)(); const o = ctx.createOscillator(); const g = ctx.createGain(); o.frequency.value = 880; g.gain.value = 0.15; o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.35); } catch (_) {}
  }
  function alertArrived(alert) {
    if (navigator.vibrate) navigator.vibrate(strong.checked ? [600, 150, 600, 150, 600] : [250, 120, 250]);
    if (sound.checked) beep();
    const text = `${alert.helperName} ${alert.kind === 'stop' ? 'wants to stop' : 'needs you'}`;
    if (document.hidden && 'Notification' in window && Notification.permission === 'granted') { try { new Notification('Helper Jobs', { body: text, tag: alert.id }); } catch (_) {} }
  }
  function render() {
    if (!board) return;
    $('#phone-title').textContent = board.title || 'Sunday outing';
    $('#phone-updated').textContent = `${board.place ? board.place + ' · ' : ''}Updated ${ago(board.updatedAt)}${board.lead ? ' · lead: ' + board.lead : ''}`;
    const alerts = board.alerts || [];
    document.title = alerts.length ? `(${alerts.length}) Help needed · Helper Jobs` : 'Helper Jobs · Lead’s phone';
    $('#phone-alerts').innerHTML = alerts.map(alert => `<article class="phone-alert ${alert.kind === 'stop' ? 'is-stop' : ''}"><p class="phone-alert-kind">${icon(alert.kind === 'stop' ? 'hand-stop' : 'bell-ringing')}${alert.kind === 'stop' ? 'Wants to stop' : alert.kind === 'break' ? 'Wants a break' : 'Needs you'} · ${esc(ago(alert.createdAt))}</p><h2>${esc(alert.helperName)}</h2><p>${esc(alert.job || 'No job')}${alert.kid ? ' · with ' + esc(alert.kid) : ''}</p><button type="button" class="phone-ack" data-alert="${esc(alert.id)}" ${pending.has(alert.id) ? 'disabled' : ''}>${pending.has(alert.id) ? 'Sent. Closing…' : 'I’m here'}</button></article>`).join('') || `<p class="phone-calm">${icon('circle-check')}No one needs you right now.</p>`;
    const day = board.day;
    $('#phone-day').hidden = !day;
    if (day) $('#phone-day').innerHTML = `<span class="pd-icon">${icon(day.nowIcon || 'calendar-event')}</span><div><small>Now</small><strong>${esc(day.now)}</strong>${day.next ? `<small>Next: ${esc(day.next)}</small>` : ''}</div>${day.next ? '<button type="button" class="secondary" id="phone-day-next">Next part →</button>' : ''}`;
    const counts = board.counts || {};
    $('#phone-summary').innerHTML = `<div><strong>${counts.helpers ?? 0}</strong><span>helpers today</span></div><div><strong>${counts.onJob ?? 0}</strong><span>on a job</span></div><div class="alert-summary"><strong>${alerts.length}</strong><span>need you</span></div>`;
    $('#phone-helpers').innerHTML = (board.helpers || []).map(helper => `<article class="lead-card ${helper.breakFor ? 'break' : helper.status === 'on a job' ? 'ok' : helper.status === 'waiting' ? 'wait' : 'alert'}"><div class="lead-card-left"><span class="mini-photo">${esc(helper.photo)}</span><div><strong>${esc(helper.name)}</strong><small>${helper.job ? esc(helper.job) + (helper.kid ? ' · ' + esc(helper.kid) : '') : 'Waiting for a job'}</small></div></div><span class="lead-card-status">${icon(helper.breakFor ? 'coffee' : helper.status === 'on a job' ? 'checklist' : helper.status === 'waiting' ? 'hourglass' : helper.status === 'wants to stop' ? 'hand-stop' : 'bell-ringing')}${esc(helper.status)}</span>${helper.breakFor ? `<button type="button" class="alert-ack break-ack" data-break="${esc(helper.breakFor)}">I offered a break</button>` : ''}</article>`).join('');
    renderManage();
    for (const result of board.results || []) if (waitingFor.has(result.id)) { const say = waitingFor.get(result.id); waitingFor.delete(result.id); toast(result.ok ? say : result.reason || 'The tablet said no.'); }
  }
  // Matches and who is here: built again only when the lists change, so a half-made choice is kept.
  function renderManage() {
    const manage = board.manage; if (!manage) return;
    const sig = JSON.stringify(manage);
    if (sig === manageSig) return; manageSig = sig;
    const keep = id => $(id).value;
    const options = (el, list, first) => { const before = keep(el); $(el).innerHTML = (first ? `<option value="">${first}</option>` : '') + list.map(item => `<option value="${esc(item.id)}">${esc(item.label)}</option>`).join(''); if ([...$(el).options].some(option => option.value === before)) $(el).value = before; };
    const here = manage.helpers.filter(item => item.here);
    options('#pm-helper', (here.length ? here : manage.helpers).map(item => ({ id: item.id, label: item.name })));
    const kidsHere = manage.kids.filter(item => item.here);
    options('#pm-kid', (kidsHere.length ? kidsHere : manage.kids).map(item => ({ id: item.id, label: item.name + (item.parentYes ? '' : ' (no parent yes yet)') })), 'No kid · task only');
    options('#pm-job', manage.jobs.map(item => ({ id: item.id, label: item.name })));
    options('#pm-volunteer', manage.volunteers.map(item => ({ id: item.id, label: item.name + ' · nearby' })), 'Choose nearby volunteer');
    const boxes = (el, kind, list) => { $(el).innerHTML = list.map(item => `<label class="presence-choice"><input type="checkbox" data-here-kind="${kind}" value="${esc(item.id)}" ${item.here ? 'checked' : ''} /> ${esc(item.name)}</label>`).join(''); };
    boxes('#pm-helpers-here', 'helper', manage.helpers); boxes('#pm-kids-here', 'kid', manage.kids);
  }
  async function send(command, say) {
    const full = { id: Link.id(command.type), at: new Date().toISOString(), ...command };
    if (say) waitingFor.set(full.id, say);
    try { await Link.sendCommand(link, full); return true; }
    catch (_) { waitingFor.delete(full.id); toast('That did not send. Check the internet and try again.'); return false; }
  }
  function status() {
    const el = $('#phone-status');
    if (!lastHeard) { el.textContent = failures ? 'Trying to connect…' : 'Connecting…'; return; }
    const stale = board && Date.now() - Date.parse(board.updatedAt) > 120_000;
    el.textContent = failures ? 'Reconnecting…' : stale ? 'Tablet quiet' : 'Live';
    el.dataset.state = failures ? 'off' : stale ? 'stale' : 'live';
    if (stale) $('#phone-updated').textContent = `The tablet has not sent anything for ${ago(board.updatedAt).replace(' ago', '')}. Is it on and online?`;
  }
  async function loop() {
    for (;;) {
      try {
        const result = await Link.readSnapshot(link, seq, true);
        failures = 0; lastHeard = Date.now();
        if (result.snapshot) {
          seq = result.seq; board = result.snapshot;
          for (const alert of board.alerts || []) if (!seen.has(alert.id)) { if (seen.size || seq > 1) alertArrived(alert); seen.add(alert.id); }
          for (const id of [...pending]) if (!(board.alerts || []).some(alert => alert.id === id)) pending.delete(id);
          render();
        }
      } catch (error) {
        failures += 1;
        if (error.gone) { $('#phone-updated').textContent = 'This pairing has ended. Make a new pairing code on the tablet.'; status(); return; }
        if (error.status === 403) { $('#phone-updated').textContent = 'This phone’s link does not match the tablet any more. Scan the new pairing code.'; status(); return; }
        await new Promise(done => setTimeout(done, Math.min(15000, 2000 * failures)));
      }
      status();
    }
  }
  document.addEventListener('click', async event => {
    if (event.target.closest('#phone-day-next')) { event.target.closest('#phone-day-next').disabled = true; await send({ type: 'schedule', delta: 1 }, 'The day plan moved on.'); return; }
    const breakButton = event.target.closest('[data-break]');
    if (breakButton) { breakButton.disabled = true; await send({ type: 'break', assignmentId: breakButton.dataset.break }, 'Noted on the tablet.'); return; }
    const button = event.target.closest('[data-alert]');
    if (!button) return;
    const id = button.dataset.alert;
    pending.add(id); render();
    try {
      await Link.sendCommand(link, { id: Link.id('ack'), type: 'ack', alertId: id, at: new Date().toISOString() });
      toast('Sent. The tablet will close it.');
      const form = $('#phone-note'); form.dataset.noteFor = id; form.hidden = false; $('#phone-note-text').value = '';
    } catch (_) { pending.delete(id); render(); toast('That did not send. Check the internet and try again.'); }
  });
  $('#phone-note').addEventListener('submit', async event => {
    event.preventDefault();
    const note = $('#phone-note-text').value.trim();
    if (!note) return toast('Type a short note, or skip.');
    if (await send({ type: 'note', alertId: event.currentTarget.dataset.noteFor, note }, 'Note saved for the coordinator.')) $('#phone-note').hidden = true;
  });
  $('#phone-note-skip').addEventListener('click', () => { $('#phone-note').hidden = true; });
  $('#phone-match').addEventListener('submit', async event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await send({ type: 'assign', helperId: data.get('helperId'), kidId: data.get('kidId') || '', jobId: data.get('jobId'), volunteerId: data.get('volunteerId') || '' }, 'Match saved on the tablet.');
  });
  document.addEventListener('change', event => {
    const box = event.target.closest('[data-here-kind]');
    if (box) send({ type: 'presence', kind: box.dataset.hereKind, recordId: box.value, present: box.checked }, `${box.parentElement.textContent.trim()} ${box.checked ? 'is marked here' : 'is no longer marked here'}.`);
  });
  $('#phone-forget').addEventListener('click', () => { store.drop(KEY); location.replace('./lead-phone.html'); });
  // Waking the phone when it is locked (Web Push). The alert says only "someone needs you".
  const WAKE = 'helper-jobs.phone-wake.v1';
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const canPush = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const keyBytes = text => { const s = atob(text.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((text.length + 3) % 4)); return Uint8Array.from(s, ch => ch.charCodeAt(0)); };
  function wakeView(on, note) {
    $('#wake-status').textContent = note || (on ? 'On. This phone buzzes for Help and Stop, even when locked.' : 'Off. Help only shows while this page is open.');
    $('#wake-on').hidden = on; $('#wake-test').hidden = !on; $('#wake-off').hidden = !on;
    $('#wake-box').classList.toggle('is-on', on);
  }
  async function wakeSubscribe(ask) {
    if (!canPush) {
      $('#wake-hint').hidden = false;
      $('#wake-hint').textContent = ios && !standalone ? 'On iPhone: tap Share, then “Add to Home Screen”. Open Helper Jobs from the home screen and turn this on there.' : 'This browser cannot buzz when locked. Keep this page open, with the sound on.';
      return false;
    }
    if (ask) { const answer = await Notification.requestPermission(); if (answer !== 'granted') { wakeView(false, 'Not allowed. To change it, allow notifications for this site in the phone’s settings.'); return false; } }
    if (Notification.permission !== 'granted') return false;
    const reg = await navigator.serviceWorker.ready;
    const key = await Link.pushKey(link.api);
    if (!key) { wakeView(false, 'The live link cannot wake phones yet.'); return false; }
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key) });
    await Link.addPhone(link, sub.endpoint);
    // The tablet remembers it too, so it can tell the live link again after a restart.
    await Link.sendCommand(link, { id: Link.id('wake'), type: 'phone-push', endpoint: sub.endpoint, at: new Date().toISOString() }).catch(() => {});
    store.set(WAKE, true); wakeView(true);
    return true;
  }
  if (!(window.HelperJobsNative && window.HelperJobsNative.isNative) && 'serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  $('#wake-on').addEventListener('click', () => wakeSubscribe(true).catch(() => wakeView(false, 'That did not work. Check the internet and try again.')));
  $('#wake-test').addEventListener('click', async () => {
    try { const result = await Link.wakePhones(link); toast(result.sent ? 'Test sent. Lock the phone: it should buzz in a few seconds.' : result.waited ? 'Wait a few seconds, then try again.' : 'No buzz was sent. Turn it off and on again.'); }
    catch (_) { toast('That did not send. Check the internet.'); }
  });
  $('#wake-off').addEventListener('click', async () => {
    try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); if (sub) { await Link.addPhone(link, sub.endpoint, true).catch(() => {}); await sub.unsubscribe(); } } catch (_) {}
    store.drop(WAKE); wakeView(false);
  });
  if (store.get(WAKE) === true) { wakeView(true); wakeSubscribe(false).catch(() => {}); setInterval(() => wakeSubscribe(false).catch(() => {}), 10 * 60_000); }
  else wakeView(false);
  setInterval(() => { render(); status(); }, 10_000);
  // Until someone answers, the phone buzzes again every 30 seconds while this page is open.
  setInterval(() => {
    const waiting = (board && board.alerts || []).filter(alert => !pending.has(alert.id));
    if (!waiting.length) return;
    if (navigator.vibrate) navigator.vibrate(store.get(STRONG) ? [500, 150, 500, 150, 500] : [250, 120, 250]);
    if (sound.checked) beep();
  }, 30_000);
  Link.sendCommand(link, { id: Link.id('hello'), type: 'hello', at: new Date().toISOString() }).catch(() => {});
  loop();
})();
