(function () {
  const NATIVE = Boolean(window.HelperJobsNative && window.HelperJobsNative.isNative);
  if (!NATIVE && 'serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  const jobsList = () => store.jobList(state);
  const store = window.HelperJobsStore;
  const { icon } = window.HelperJobsIcons;
  const I18N = window.HelperJobsI18n;
  const { t, LANGS } = I18N;
  const Link = window.HelperJobsLink;
  const KEYS = { state: 'helper-jobs.state.v1', phone: 'helper-jobs.link.v1', tablets: 'helper-jobs.tablets-link.v1', backup: 'helper-jobs.backup-link.v1', mirror: 'helper-jobs.mirror-link.v1', mirrorState: 'helper-jobs.mirror-state.v1', mirrorOutbox: 'helper-jobs.mirror-outbox.v1', mirrorQueue: 'helper-jobs.mirror-queue.v1' };
  const ls = {
    get(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} },
    drop(key) { try { localStorage.removeItem(key); } catch (_) {} }
  };
  // Start again: everything this app keeps on the tablet starts with "helper-jobs.".
  function clearTablet() { try { Object.keys(localStorage).filter(key => key.startsWith('helper-jobs.')).forEach(key => localStorage.removeItem(key)); } catch (_) {} }
  const FRESH_QUESTION = 'Start again with the made-up example? This clears everything on this tablet: people, PINs, links and history.';
  if (new URLSearchParams(location.search).get('fresh') === '1') {
    if (window.confirm(FRESH_QUESTION)) clearTablet();
    history.replaceState(null, '', location.pathname);
  }

  // A second tablet joins with a link that carries the room and key in the #fragment.
  if (/[#&]r=/.test(location.hash) && Link) {
    const joined = Link.fromFragment(location.hash);
    history.replaceState(null, '', location.pathname + location.search);
    if (joined) ls.set(KEYS.mirror, joined);
  }
  let mirrorLink = ls.get(KEYS.mirror);
  const MIRROR = Boolean(mirrorLink && mirrorLink.roomId && mirrorLink.key);
  if (MIRROR) store.useKeys(KEYS.mirrorState, KEYS.mirrorOutbox);
  const emptyMirror = () => ({ schemaVersion: 1, mirror: true, outing: { id: 'mirror', title: 'Waiting for the main tablet', place: '', presentHelpers: [], presentKids: [] }, helpers: [], kids: [], volunteers: [], assignments: [], helpAlerts: [], audit: [], wrapNotes: {}, practice: [], appliedEvents: [] });
  const loadState = () => { if (!MIRROR) return store.loadState(); const saved = ls.get(KEYS.mirrorState); return saved && saved.schemaVersion === 1 ? saved : emptyMirror(); };

  let state = loadState();
  if (!MIRROR) store.applyRetention(state);
  let selectedJob = null;
  let selectedHelper = null;
  let activeAssignment = null;
  let practiceMode = false;
  let stepIndex = 0;
  let starGiven = false;
  let pin = '';
  let talkTimer = null;
  let lang = 'en';
  const L = (text, vars) => t(text, lang, vars);
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const helperById = id => state.helpers.find(item => item.id === id);
  // Names, tips and notes are typed in by people, so never put them into the page as markup.
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const photo = record => record.photoData && /^data:image\/jpeg;base64,/.test(record.photoData) ? `<img src="${esc(record.photoData)}" alt="" />` : esc(record.photo);
  // Once the lead marks who is here, the screens show only those people.
  const presentHelpers = () => { const ids = state.outing.presentHelpers || []; return ids.length || MIRROR ? state.helpers.filter(item => ids.includes(item.id)) : state.helpers; };
  const presentKids = () => { const ids = state.outing.presentKids || []; return ids.length ? state.kids.filter(item => ids.includes(item.id)) : state.kids; };
  const volunteersHere = () => { const ids = state.outing.presentVolunteers || []; return ids.length ? state.volunteers.filter(item => ids.includes(item.id)) : state.volunteers; };
  const openAssignment = (helperId, jobId) => state.assignments.find(item => item.helperId === helperId && item.jobId === jobId && item.status === 'assigned') || null;
  const hasAllergy = kid => Boolean(kid.allergy) && !/^\s*(none|no|n\/a|-)?\s*$/i.test(kid.allergy);
  const eventId = () => (Link ? Link.id('ev') : `ev-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const timeOf = iso => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? '' : d.toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }); };

  // Helper screens follow the helper's own settings: language, bigger text, stronger contrast.
  function applyHelperPrefs(helper) {
    lang = helper && LANGS[helper.language] ? helper.language : 'en';
    document.body.classList.toggle('big-text', Boolean(helper && helper.bigText));
    document.body.classList.toggle('high-contrast', Boolean(helper && helper.contrast));
    $$('[data-t]').forEach(element => { element.textContent = L(element.dataset.t); });
    $$('.help-button').forEach(button => button.setAttribute('aria-label', lang === 'en' ? 'Ask the volunteer for help' : L('Help')));
    $$('#helper-jobs, #helper-task, #helper-done, #helper-break, #helper-practice-help').forEach(section => section.setAttribute('lang', lang));
  }
  function show(id) {
    $$('.screen').forEach(screen => screen.classList.toggle('active', screen.id === id));
    showAlertBanner();
    if (!/^helper-(jobs|task|done|break|practice-help)$/.test(id)) applyHelperPrefs(null);
    if (id === 'home') { try { localStorage.removeItem('helper-jobs.coord-until'); } catch (_) {} }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Move focus to the new screen's heading so keyboard and screen reader users land in the right place.
    const heading = document.getElementById(id)?.querySelector('h1, h2');
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
  }
  const isActive = id => $(`#${id}`)?.classList.contains('active');
  function toast(message) {
    const element = $('#toast');
    element.textContent = message;
    element.classList.add('show');
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => element.classList.remove('show'), 3200);
  }
  function reload() {
    state = loadState();
    if (activeAssignment) activeAssignment = state.assignments.find(item => item.id === activeAssignment.id) || activeAssignment;
    if (!MIRROR) channels.all().forEach(channel => channel.schedule());
    showAlertBanner();
  }
  function download(name, text, type) { const blob = new Blob([text], { type }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = name; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(link.href), 4000); }

  function taskKid() { return activeAssignment?.kidId ? state.kids.find(item => item.id === activeAssignment.kidId) : null; }
  // A no-snack card changes the job itself: the helper is never told to give food.
  // Steps are [icon, title, words, names to fill in]; the words are translated when shown.
  function stepsFor(job, kid) {
    if (job.id === 'snack' && kid && !kid.snackAllowed) {
      const water = (kid.snackAllowList || []).includes('water');
      const name = { name: kid.firstName };
      return [
        ['alert-octagon', 'No snack for {name}', 'The card says no snack. Do not give any food.', name],
        ['droplet', water ? 'Water is okay' : 'Ask about water', water ? 'You may offer {name} water.' : 'Ask the volunteer before giving a drink.', name],
        ['user-check', 'Tell the volunteer', 'Show them the snack card.', name],
        ['star', 'Tap Done', 'You kept {name} safe.', name]
      ];
    }
    return job.steps;
  }
  const currentSteps = () => stepsFor(selectedJob, practiceMode ? null : taskKid());
  function snackCardText(kid) { return L(kid.snackAllowed ? 'Snack card: a snack is okay for {name}.' : 'Snack card: no snack for {name}. Do not give food.', { name: kid.firstName }); }

  // The day plan as pictures: what is happening now, and what comes next.
  function dayStrip(compact) {
    const { list, at } = store.scheduleNowNext(state);
    if (!list.length) return '';
    return `<ol class="day-steps ${compact ? 'compact' : ''}">${list.map((item, i) => `<li class="${i < at ? 'past' : i === at ? 'now' : i === at + 1 ? 'next' : ''}">${i === at ? `<span class="day-tag">${esc(L('Now'))}</span>` : i === at + 1 ? `<span class="day-tag soft">${esc(L('Next'))}</span>` : ''}<span class="day-icon">${icon(item.icon)}</span><strong>${esc(L(item.label))}</strong>${item.time ? `<small>${esc(item.time)}</small>` : ''}</li>`).join('')}</ol>`;
  }
  // Keep "now" in view when the plan is wider than the screen.
  function centreNow() { $$('.day-steps').forEach(list => { const now = list.querySelector('li.now'); if (now) list.scrollLeft = Math.max(0, now.offsetLeft - (list.clientWidth - now.clientWidth) / 2); }); }
  function renderHelpers() {
    const list = presentHelpers();
    $('#helper-list').innerHTML = list.map(helper => `<button class="person-card" data-helper="${esc(helper.id)}"><span class="person-photo">${photo(helper)}</span><strong>${esc(helper.name)}</strong><small>Level ${esc(helper.level)} helper · ${esc(helper.stars)} stars</small></button>`).join('')
      || `<p class="phone-calm">${MIRROR ? 'Waiting for the main tablet to share today’s helpers…' : 'No helpers yet. The coordinator can add helpers.'}</p>`;
  }
  function renderJobs() {
    const helper = selectedHelper && helperById(selectedHelper.id);
    const unlocked = helper?.unlockedJobs || [];
    const practice = store.practiceJobs(helper, state);
    const card = job => {
      const locked = !unlocked.includes(job.id);
      const canPractice = locked && practice.includes(job.id);
      const assignment = helper && openAssignment(helper.id, job.id);
      const kid = assignment?.kidId && state.kids.find(item => item.id === assignment.kidId);
      const waiting = !locked && job.needsVolunteer && !assignment;
      const note = canPractice ? esc(L('Try a practice run')) : locked ? esc(L('Coming soon for you!')) : assignment ? `${esc(L('Your job now'))}${kid ? ` · ${esc(L('with {name}', { name: kid.firstName }))}` : ''}` : waiting ? esc(L('Ask your lead to start this with you.')) : esc(L(job.desc));
      const disabled = (locked && !canPractice) || waiting;
      return `<button class="job-card ${locked && !canPractice ? 'locked' : ''} ${canPractice ? 'practice' : ''} ${waiting ? 'needs-lead' : ''} ${assignment ? 'assigned' : ''}" data-job="${job.id}" ${disabled ? 'aria-disabled="true"' : ''}><span class="job-art">${icon(job.icon)}</span><strong>${esc(L(job.name))}</strong><small>${note}</small><span class="job-level">${canPractice ? esc(L('Practice')) : esc(L('Level {n}', { n: job.level }))}</span>${locked && !canPractice ? `<span class="lock">${icon('lock', 'Locked')}</span>` : ''}</button>`;
    };
    // At most four choices at once: the job the lead set up first, then the other open jobs.
    const open = jobsList().filter(job => unlocked.includes(job.id)).sort((a, b) => Number(Boolean(helper && openAssignment(helper.id, b.id))) - Number(Boolean(helper && openAssignment(helper.id, a.id))));
    const shown = open.slice(0, 4);
    const later = [...open.slice(4), ...jobsList().filter(job => practice.includes(job.id)), ...jobsList().filter(job => !unlocked.includes(job.id) && !practice.includes(job.id))];
    const label = open.length > 4 ? L('More jobs') : practice.length ? L('Practice and new jobs') : L('Jobs coming soon for you');
    $('#day-strip-jobs').innerHTML = dayStrip(true); requestAnimationFrame(centreNow);
    const practiceHelp = helper && !helper.triedHelp ? `<button class="job-card practice-help-card" data-action="practice-help"><span class="job-art">${icon('lifebuoy')}</span><strong>${esc(L('Practise the Help button'))}</strong><small>${esc(L('Try it here. Nothing is sent.'))}</small></button>` : '';
    $('#job-list').innerHTML = shown.map(card).join('') + practiceHelp + (later.length ? `<details class="jobs-later"><summary>${esc(label)} (${later.length})</summary><div class="job-grid">${later.map(card).join('')}</div></details>` : '');
  }
  function renderTask() {
    const steps = currentSteps();
    const step = steps[stepIndex];
    const kid = practiceMode ? null : taskKid();
    const kidCard = kid ? `<aside class="kid-card"><span class="kid-face">${photo(kid)}</span><span><strong>${esc(kid.firstName)}</strong><small>${(kid.safeTips || []).map(esc).join(' · ')}</small></span></aside>` : '';
    const snackCard = selectedJob.id === 'snack' && kid ? `<aside class="snack-card ${kid.snackAllowed ? 'snack-ok' : 'snack-stop'}"><strong>${esc(L(kid.snackAllowed ? 'Snack okay' : 'No snack · ask the volunteer'))}</strong><small>${esc(L(kid.snackAllowed ? 'Give one snack next to the volunteer.' : 'Ask the volunteer. Never guess or change this card.'))}</small></aside>` : '';
    const practiceTag = practiceMode ? `<p class="practice-tag">${esc(L('Practice run · no kid'))}</p>` : '';
    $('#task-progress').textContent = L('Step {n} of {total}', { n: stepIndex + 1, total: steps.length });
    $('#task-card').classList.toggle('is-stop', selectedJob.id === 'snack' && Boolean(kid) && !kid.snackAllowed);
    const noSnack = selectedJob.id === 'snack' && kid && !kid.snackAllowed;
    const stepPhoto = !noSnack && state.stepPhotos && state.stepPhotos[selectedJob.id] && state.stepPhotos[selectedJob.id][stepIndex];
    const art = stepPhoto && /^data:image\/jpeg;base64,/.test(stepPhoto) ? `<div class="task-photo"><img src="${esc(stepPhoto)}" alt="" /><span class="task-photo-icon">${icon(step[0])}</span></div>` : `<div class="task-art" aria-hidden="true">${icon(step[0])}</div>`;
    $('#task-card').innerHTML = `<div>${practiceTag}${kidCard}${snackCard}${art}<h2 id="task-title">${esc(L(step[1], step[3]))}</h2><p>${esc(L(step[2], step[3]))}</p></div>`;
    window.clearInterval(talkTimer);
    // Talk Friend: a calm circle fills over ten seconds. It is a guide, not a deadline.
    if (selectedJob.id === 'talk' && /wait 10/i.test(step[1])) {
      $('#task-card').insertAdjacentHTML('beforeend', `<div class="talk-wait"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="tw-track" cx="60" cy="60" r="52"/><circle class="tw-fill" cx="60" cy="60" r="52" pathLength="100"/></svg><span class="talk-countdown">${esc(L('{n} seconds · take your time', { n: 10 }))}</span></div>`);
      let seconds = 10;
      talkTimer = window.setInterval(() => {
        seconds -= 1;
        const timer = document.querySelector('.talk-countdown');
        if (timer) timer.textContent = seconds > 0 ? L('{n} seconds · take your time', { n: seconds }) : L('Take all the time you need');
        const fill = document.querySelector('.tw-fill'); if (fill) fill.style.strokeDashoffset = String(seconds * 10);
        if (seconds <= 0) { window.clearInterval(talkTimer); document.querySelector('.talk-wait')?.classList.add('done'); }
      }, 1000);
    }
  }
  function boardStatus(helper, alerts, active) {
    const alert = alerts.find(item => item.helperId === helper.id);
    const assignment = active.find(item => item.helperId === helper.id);
    if (alert) return { alert, assignment, label: alert.kind === 'stop' ? 'wants to stop' : alert.kind === 'break' ? 'wants a break' : 'needs you', kind: 'alert' };
    if (store.needsBreak(assignment)) return { assignment, label: '20 min · offer a break', kind: 'break' };
    return { assignment, label: assignment ? 'on a job' : 'waiting', kind: assignment ? 'ok' : 'wait' };
  }
  function renderLead() {
    const active = state.assignments.filter(item => item.status === 'assigned');
    const alerts = state.helpAlerts.filter(item => item.status === 'open');
    const helpers = presentHelpers();
    $('#board-helper-count').textContent = helpers.length;
    $('#board-job-count').textContent = active.length;
    $('#board-alert-count').textContent = alerts.length;
    $('#board-title').textContent = state.outing.title || `Sunday at ${state.outing.place}`;
    const notes = [];
    if (!channels.backup.link) notes.push(['device-laptop', 'No laptop backup yet. The coordinator can turn it on.']);
    if (deviceStatus.persisted === false) notes.push(['lock', 'This tablet may clear its saved data. Add Helper Jobs to the home screen.']);
    if (!channels.phone.link) notes.push(['device-mobile', 'The lead’s phone is not paired.']);
    const plan = store.scheduleNowNext(state);
    $('#day-plan').innerHTML = plan.list.length ? `<div class="day-plan-head"><h2>${icon('calendar-event')}The day plan</h2><div class="day-plan-move"><button type="button" class="button button-secondary" data-action="schedule-back" ${plan.at === 0 ? 'disabled' : ''}>← Back</button><button type="button" class="primary" data-action="schedule-next" ${plan.next ? '' : 'disabled'}>Next: ${esc(plan.next ? plan.next.label : 'done')} →</button></div></div>${dayStrip(false)}` : '';
    requestAnimationFrame(centreNow);
    $('#board-notes').innerHTML = notes.map(([ic, text]) => `<li>${icon(ic)}${esc(text)}</li>`).join('');
    $('#lead-board-list').innerHTML = helpers.map(helper => {
      const { alert, assignment, label, kind } = boardStatus(helper, alerts, active);
      const kid = assignment?.kidId && state.kids.find(item => item.id === assignment.kidId);
      const job = assignment && jobsList().find(item => item.id === assignment.jobId);
      const change = assignment ? `<details class="card-change"><summary>${icon('pencil-check')}Change</summary><div><label>Volunteer nearby<select data-change-vol="${esc(assignment.id)}">${volunteersHere().map(vol => `<option value="${esc(vol.id)}" ${vol.id === assignment.nearbyVolunteerId ? 'selected' : ''}>${esc(vol.name)}</option>`).join('')}</select></label><button type="button" class="button button-secondary" data-save-vol="${esc(assignment.id)}">Save volunteer</button><button type="button" class="button-stop" data-end-job="${esc(assignment.id)}">End this job</button></div></details>` : '';
      const actions = (alert ? `<button class="button button-secondary alert-ack" data-alert="${esc(alert.id)}">I’m here</button>` : kind === 'break' ? `<button class="button button-secondary alert-ack break-ack" data-break="${esc(assignment.id)}">I offered a break</button>` : '') + change;
      const description = assignment ? `${esc(job.name)}${kid ? ` · ${esc(kid.firstName)}` : ''}` : 'Waiting for a job';
      return `<article class="lead-card ${kind}"><div class="lead-card-left"><span class="mini-photo">${photo(helper)}</span><div><strong>${esc(helper.name)}</strong><small>${description}</small></div></div><span class="lead-card-status">${kind === 'alert' ? icon(alert.kind === 'stop' ? 'hand-stop' : 'bell-ringing') : kind === 'break' ? icon('coffee') : kind === 'ok' ? icon(job.icon) : icon('hourglass')}${esc(label)}</span>${actions}</article>`;
    }).join('');
    channels.showDots();
  }
  function renderWrap() {
    const count = store.headcount(state);
    $('#headcount-list').innerHTML = count.kids.map(kid => {
      const mark = count.marks[kid.id]?.status;
      return `<div class="headcount-row ${mark ? 'marked' : ''}"><span class="mini-photo">${photo(kid)}</span><strong>${esc(kid.firstName)}</strong><div class="headcount-choice" role="group" aria-label="Where is ${esc(kid.firstName)}?"><button type="button" data-headcount="${esc(kid.id)}" data-value="back" aria-pressed="${mark === 'back'}">${icon('users')}Back with a volunteer</button><button type="button" data-headcount="${esc(kid.id)}" data-value="family" aria-pressed="${mark === 'family'}">${icon('home')}Went home with family</button></div></div>`;
    }).join('') || '<p class="phone-calm">No kids on today’s list.</p>';
    $('#headcount-status').textContent = count.done ? 'Every kid is marked. You can finish.' : `Mark ${count.missing.length} more ${count.missing.length === 1 ? 'kid' : 'kids'} before finishing.`;
    $('#headcount-status').classList.toggle('done', count.done);
    $('#finish-outing').setAttribute('aria-disabled', String(!count.done));
    const helpers = presentHelpers();
    if (!$('#wrap-feedback').children.length) $('#wrap-feedback').innerHTML = feedbackForm('lead');
    $('#wrap-list').innerHTML = helpers.map(helper => `<div class="wrap-row"><label for="note-${esc(helper.id)}">${esc(helper.name)}</label><input id="note-${esc(helper.id)}" data-note="${esc(helper.id)}" value="${esc(state.wrapNotes[helper.id] || 'Great job helping today.')}" /><div class="wrap-rating"><button type="button" data-rating="${esc(helper.id)}" data-value="up" aria-label="Went well for ${esc(helper.name)}">👍</button><button type="button" data-rating="${esc(helper.id)}" data-value="down" aria-label="Was hard for ${esc(helper.name)}">👎</button></div></div>`).join('');
  }
  // Feedback after the outing: a face for the day, a face for the app, and a few words. No names.
  const MOOD = [['happy', 'mood-happy', 'Good'], ['okay', 'mood-neutral', 'Okay'], ['hard', 'mood-sad', 'Hard']];
  function feedbackForm(fixedRole) {
    const moods = (name, legend) => `<fieldset class="mood-set"><legend>${legend}</legend>${MOOD.map(([value, ic, label]) => `<label class="mood-choice"><input type="radio" name="${name}" value="${value}" />${icon(ic)}<span>${label}</span></label>`).join('')}</fieldset>`;
    const roles = [['volunteer', 'users', 'Volunteer'], ['lead', 'clipboard-list', 'Lead'], ['coordinator', 'shield-check', 'Coordinator'], ['family', 'heart', 'Family member']];
    const who = fixedRole ? `<input type="hidden" name="role" value="${fixedRole}" />` : `<fieldset class="mood-set role-set"><legend>Who is this from?</legend>${roles.map(([value, ic, label]) => `<label class="mood-choice"><input type="radio" name="role" value="${value}" ${value === 'volunteer' ? 'checked' : ''} />${icon(ic)}<span>${label}</span></label>`).join('')}</fieldset>`;
    return `<form class="feedback-form" data-feedback-form>${who}${moods('day', 'The day overall')}${moods('tool', 'Helper Jobs on the tablet')}<label>What made it easier?<textarea name="easier" rows="2" maxlength="400"></textarea></label><label>What made it harder?<textarea name="harder" rows="2" maxlength="400"></textarea></label><label>One thing to change<textarea name="change" rows="2" maxlength="400"></textarea></label><button class="primary" type="submit">${icon('message-circle')}Save feedback</button></form>`;
  }
  function saveFeedback(form) {
    const data = new FormData(form);
    const result = store.addFeedback(state, { role: data.get('role'), day: data.get('day'), tool: data.get('tool'), easier: data.get('easier'), harder: data.get('harder'), change: data.get('change') });
    if (result.ok) { form.reset(); reload(); }
    return result;
  }
  const ICON_NAMES = { 'map-pin': 'Place', walk: 'Walk', puzzle: 'Play', apple: 'Snack', basket: 'Clean up', home: 'Home', users: 'Group', sun: 'Outside', coffee: 'Break', star: 'Special', flag: 'Meet', bubble: 'Bubbles' };
  function renderScheduleEditor(list) {
    const icons = window.HelperJobsData.scheduleIcons || [];
    $('#outing-schedule').innerHTML = list.map((item, i) => `<div class="schedule-row" data-schedule-row><span class="schedule-pic">${icon(item.icon)}</span><label><span class="sr-only">Picture</span><select name="s-icon">${icons.map(name => `<option value="${name}" ${name === item.icon ? 'selected' : ''}>${ICON_NAMES[name] || name}</option>`).join('')}</select></label><label><span class="sr-only">Part of the day</span><input name="s-label" value="${esc(item.label)}" maxlength="40" /></label><label><span class="sr-only">Time</span><input name="s-time" type="time" value="${esc(item.time)}" /></label><button type="button" class="button-stop" data-action="schedule-remove" aria-label="Remove ${esc(item.label)}">Remove</button></div>`).join('');
  }
  const readScheduleEditor = () => $$('[data-schedule-row]').map(row => ({ icon: row.querySelector('[name="s-icon"]').value, label: row.querySelector('[name="s-label"]').value, time: row.querySelector('[name="s-time"]').value }));
  function renderAssignmentForm() {
    $('#assignment-helper').innerHTML = presentHelpers().map(item => `<option value="${esc(item.id)}">${esc(item.name)}</option>`).join('');
    $('#assignment-kid').innerHTML = `<option value="">No kid · task only</option>` + presentKids().map(item => `<option value="${esc(item.id)}">${esc(item.firstName)}${item.parentConsent === false ? ' (no parent yes yet)' : ''}</option>`).join('');
    $('#assignment-job').innerHTML = jobsList().map(item => `<option value="${item.id}">${esc(item.name)} · Level ${item.level}</option>`).join('');
    $('#assignment-volunteer').innerHTML = `<option value="">Choose nearby volunteer</option>` + volunteersHere().map(item => `<option value="${esc(item.id)}">${esc(item.name)} · nearby</option>`).join('');
  }
  function renderOutingSetup() {
    $('#outing-place').value = state.outing.place || '';
    $('#outing-date').value = state.outing.date || '';
    $('#outing-lead').value = state.outing.leadVolunteer || '';
    $('#outing-helpers').innerHTML = state.helpers.map(item => `<label class="presence-choice"><input type="checkbox" name="helper-present" value="${esc(item.id)}" ${state.outing.presentHelpers?.includes(item.id) ? 'checked' : ''} /> ${esc(item.name)}</label>`).join('');
    renderScheduleEditor(state.outing.schedule || []);
    $('#outing-volunteers').innerHTML = state.volunteers.map(item => `<label class="presence-choice"><input type="checkbox" name="volunteer-present" value="${esc(item.id)}" ${!(state.outing.presentVolunteers || []).length || state.outing.presentVolunteers.includes(item.id) ? 'checked' : ''} /> ${esc(item.name)}</label>`).join('') || '<small>No volunteers yet. The coordinator adds them.</small>';
    $('#outing-kids').innerHTML = state.kids.map(item => `<label class="presence-choice"><input type="checkbox" name="kid-present" value="${esc(item.id)}" ${state.outing.presentKids?.includes(item.id) ? 'checked' : ''} /> ${esc(item.firstName)}${item.parentConsent === false ? ' <small>(no parent yes yet: no kid jobsList())</small>' : ''}</label>`).join('');
  }
  const check = (name, on, text) => `<label class="check-row"><input type="checkbox" name="${name}" ${on ? 'checked' : ''} /> ${text}</label>`;
  const FIELD_NAMES = { consent: 'taking part', parentConsent: 'parent’s yes', photoConsent: 'photo', familyConsent: 'family page' };
  const yesLine = record => {
    const dates = Object.entries(record.yesDates || {});
    if (!dates.length) return '';
    const due = store.yesReviewDue(record);
    return `<p class="yes-dates ${due.length ? 'due' : ''}">${icon(due.length ? 'alert-octagon' : 'calendar-event')}${dates.map(([field, at]) => `${FIELD_NAMES[field] || field}: ${new Date(at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`).join(' · ')}${due.length ? ' · <b>review due</b>' : ''}</p>`;
  };
  const photoTools = (kind, record, allowed) => `<div class="photo-tools"><span class="coord-photo">${photo(record)}</span><div>${allowed ? `<label class="button button-secondary file-button">${icon('camera')}${record.photoData ? 'Change photo' : 'Add a photo'}<input type="file" accept="image/*" capture="user" data-photo-kind="${kind}" data-photo-id="${esc(record.id)}" /></label>${record.photoData ? `<button type="button" class="button button-secondary" data-photo-remove="${kind}" data-photo-id="${esc(record.id)}">Remove photo</button>` : ''}` : `<small class="photo-wait">${icon('lock')}A photo needs a yes first. Tick it below and save.</small>`}</div></div>`;
  function renderCoordinator() {
    try { localStorage.setItem('helper-jobs.coord-until', String(Date.now() + 30 * 60_000)); } catch (_) {}
    const kidCards = state.kids.map(kid => `<article class="coordinator-card"><p class="card-kind">${icon('mood-happy')}Kid</p>${photoTools('kid', kid, kid.parentConsent && kid.photoConsent)}<form class="admin-form" data-kid-form="${esc(kid.id)}"><h2>${esc(kid.firstName)}</h2><label>First name<input name="firstName" value="${esc(kid.firstName)}" maxlength="40" required /></label><label>Photo letter<input name="photo" value="${esc(kid.photo)}" maxlength="2" required /></label><label>Safe tips <small>(up to 3, comma-separated)</small><input name="safeTips" value="${esc(kid.safeTips.join(', '))}" /></label><label>Allergy note<input name="allergy" value="${esc(kid.allergy)}" /></label>${check('parentConsent', kid.parentConsent, 'Parent consent recorded')}${yesLine(kid)}${check('photoConsent', kid.photoConsent, 'Parent said yes to a photo')}<button class="button button-secondary" type="submit">Save kid record</button></form><span>Snack: ${kid.snackAllowed ? 'allowed' : 'not allowed'} · allow list: ${esc((kid.snackAllowList || []).join(', '))}${hasAllergy(kid) ? ` · <strong>allergy: ${esc(kid.allergy)}</strong>` : ''}</span><button class="button button-secondary" data-snack-kid="${esc(kid.id)}" data-snack-value="${kid.snackAllowed ? 'false' : 'true'}">Coordinator: ${kid.snackAllowed ? 'deny' : 'allow'} snack</button><button type="button" class="button button-secondary" data-export-kind="kid" data-export-id="${esc(kid.id)}">${icon('download')}Download what we hold</button><button type="button" class="button-stop remove-person" data-remove-kind="kid" data-remove-id="${esc(kid.id)}">Remove ${esc(kid.firstName)}</button></article>`).join('');
    const helperCards = state.helpers.map(helper => {
      const practice = store.practiceFor(state, helper.id);
      const practiceText = Object.entries(practice).map(([jobId, n]) => `${jobsList().find(job => job.id === jobId)?.name || jobId} ×${n}`).join(', ');
      const certs = store.certificatesFor(state, helper.id);
      return `<article class="coordinator-card"><p class="card-kind">${icon('user')}Helper · ${'★'.repeat(Math.min(5, helper.stars))}${helper.stars > 5 ? ` ${helper.stars}` : ''}</p>${photoTools('helper', helper, helper.consent && helper.photoConsent)}<form class="admin-form" data-helper-form="${esc(helper.id)}"><h2>${esc(helper.name)} · Level ${esc(helper.level)}</h2><label>First name<input name="name" value="${esc(helper.name)}" maxlength="40" required /></label><label>Photo letter<input name="photo" value="${esc(helper.photo)}" maxlength="2" required /></label><label>Language<select name="language">${Object.entries(LANGS).map(([code, item]) => `<option value="${code}" ${(helper.language || 'en') === code ? 'selected' : ''}>${esc(item.name)}</option>`).join('')}</select></label>${check('voiceEnabled', helper.voiceEnabled !== false, 'Read aloud on')}${check('slowVoice', helper.slowVoice, 'Slower read aloud')}${check('bigText', helper.bigText, 'Bigger text')}${check('contrast', helper.contrast, 'Stronger contrast')}${check('consent', helper.consent, 'Helper consent recorded')}${check('photoConsent', helper.photoConsent, 'Yes to a photo')}${check('familyConsent', helper.familyConsent, 'Family may see badges and photo')}${yesLine(helper)}<button class="button button-secondary" type="submit">Save helper record</button></form><small>Approved: ${esc(helper.unlockedJobs.join(', '))} · ${store.historyForHelper(state, helper.id).length} jobs in history${practiceText ? ` · practice: ${esc(practiceText)}` : ''}</small>${(helper.wishes || []).length ? `<p class="wish-note">${icon('heart')}Would like to try: <b>${esc(helper.wishes.map(w => jobsList().find(job => job.id === w.jobId)?.name).filter(Boolean).join(', '))}</b></p>` : ''}${helper.triedHelp ? '' : `<p class="wish-note">${icon('lifebuoy')}Has not practised the Help button yet</p>`}<div>${jobsList().map(job => `<button class="button button-secondary unlock-job" data-unlock-helper="${esc(helper.id)}" data-unlock-job="${job.id}" ${helper.unlockedJobs.includes(job.id) ? 'disabled' : ''}>${helper.unlockedJobs.includes(job.id) ? '✓ ' : ''}${esc(job.name)}${practice[job.id] ? ` · practised ${practice[job.id]}×` : ''}</button>`).join('')}</div><div class="card-links">${certs.length ? `<a class="button button-secondary" href="certificate.html?helper=${encodeURIComponent(helper.id)}" target="_blank" rel="noopener">${icon('certificate')}Print certificate${certs.length > 1 ? 's' : ''} (${certs.length})</a>` : ''}<a class="button button-secondary" href="helper-card.html?helper=${encodeURIComponent(helper.id)}" target="_blank" rel="noopener">${icon('user-check')}Helper card</a><button type="button" class="button button-secondary" data-family="${esc(helper.id)}" ${helper.familyConsent && helper.consent ? '' : 'disabled'}><span class="phone-dot" data-family-dot="${esc(helper.id)}" aria-hidden="true"></span>${icon('heart')}Family page</button></div><button type="button" class="button button-secondary" data-export-kind="helper" data-export-id="${esc(helper.id)}">${icon('download')}Download what we hold</button><button type="button" class="button-stop remove-person" data-remove-kind="helper" data-remove-id="${esc(helper.id)}">Remove ${esc(helper.name)}</button></article>`;
    }).join('');
    $('#coordinator-list').innerHTML = kidCards + helperCards;
    const notes = state.helpAlerts.filter(item => item.note).map(item => `<div class="audit-row note-row"><span class="row-icon">${icon(item.kind === 'stop' ? 'hand-stop' : 'bell-ringing')}</span><span><strong>${esc(helperById(item.helperId)?.name || 'A helper')} · ${item.kind === 'stop' ? 'wanted to stop' : 'asked for help'}</strong><span class="note-text">${esc(item.note)}</span></span><small>${esc(timeOf(item.createdAt))}</small></div>`);
    const practice = (state.practice || []).slice(-10).reverse().map(item => `<div class="audit-row note-row"><span class="row-icon">${icon(jobsList().find(job => job.id === item.jobId)?.icon || 'star')}</span><span><strong>${esc(helperById(item.helperId)?.name || 'A helper')}</strong> practised ${esc(jobsList().find(job => job.id === item.jobId)?.name || item.jobId)}</span><small>${esc(timeOf(item.at))}</small></div>`);
    const moodIcon = { happy: 'mood-happy', okay: 'mood-neutral', hard: 'mood-sad' };
    const feedback = (state.feedback || []).slice(-10).reverse().map(item => `<div class="audit-row note-row"><span class="row-icon">${icon(moodIcon[item.day] || 'message-circle')}</span><span><strong>Feedback · ${esc(item.role)}</strong><span class="note-text">${[item.easier && `Easier: ${esc(item.easier)}`, item.harder && `Harder: ${esc(item.harder)}`, item.change && `Change: ${esc(item.change)}`].filter(Boolean).join(' · ') || 'A face, no words.'}</span></span><small>${esc(timeOf(item.at))}</small></div>`);
    $('#coordinator-notes').innerHTML = [...feedback, ...notes, ...practice].join('') || '<p>No feedback, Help notes or practice runs yet.</p>';
    const helperOnly = $('#device-form input[name="helperOnly"]'); if (helperOnly) helperOnly.checked = Boolean(device.get().helperOnly);
    $('#volunteer-list').innerHTML = state.volunteers.map(vol => `<li><span class="mini-photo">${esc(vol.name.charAt(0))}</span><strong>${esc(vol.name)}</strong><button type="button" class="button-stop" data-remove-vol="${esc(vol.id)}">Remove</button></li>`).join('') || '<li>No volunteers yet.</li>';
    $('#recovery-state').textContent = readPins().recovery ? 'Recovery words are set for the coordinator PIN.' : 'No recovery words set. If the coordinator PIN is forgotten, the tablet has to start again from a locked copy.';
    renderDeviceChecks(); renderPinCard();
    if (NATIVE) window.HelperJobsNative.pinState().then(result => { if (Boolean(result.pinned) !== deviceStatus.pinned) { deviceStatus.pinned = Boolean(result.pinned); renderPinCard(); } }).catch(() => {});
    renderJobMaker();
    $('#job-pictures').innerHTML = jobsList().map(job => `<details class="job-pics"><summary><span class="job-pics-icon">${icon(job.icon)}</span>${esc(job.name)}<small>${Object.keys((state.stepPhotos || {})[job.id] || {}).length} of ${job.steps.length} steps have a picture</small></summary><ol>${job.steps.map((step, i) => { const pic = state.stepPhotos?.[job.id]?.[i]; return `<li><span class="step-thumb">${pic ? `<img src="${esc(pic)}" alt="" />` : icon(step[0])}</span><span><b>${esc(step[1])}</b><small>${esc(step[2])}</small></span><span class="step-pic-do"><label class="button button-secondary file-button">${icon('camera')}${pic ? 'Change' : 'Add a picture'}<input type="file" accept="image/*" capture="environment" data-step-photo="${job.id}" data-step-index="${i}" /></label>${pic ? `<button type="button" class="button-stop" data-step-photo-remove="${job.id}" data-step-index="${i}">Remove</button>` : ''}</span></li>`; }).join('')}</ol></details>`).join('');
    const outdoor = $('#device-form input[name="outdoor"]'); if (outdoor) outdoor.checked = Boolean(device.get().outdoor);
    const quiet = $('#device-form input[name="quiet"]'); if (quiet) quiet.checked = Boolean(device.get().quiet);
    $('#coordinator-audit').innerHTML = state.audit.slice(-20).reverse().map(item => `<div class="audit-row"><strong>${esc(item.type)}</strong><small>${esc(item.at)}</small></div>`).join('') || '<p>No audit events yet.</p>';
    channels.showDots();
  }
  // What this tablet can and cannot do, so the coordinator knows before the day.
  const deviceStatus = { persisted: NATIVE ? true : null, installed: NATIVE || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true, pinned: null, canPin: false };
  if (NATIVE) window.HelperJobsNative.pinState().then(result => { deviceStatus.canPin = Boolean(result.supported); deviceStatus.pinned = Boolean(result.pinned); renderDeviceChecks(); renderPinCard(); }).catch(() => {});
  if (!NATIVE && navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(yes => yes || navigator.storage.persist()).then(yes => { deviceStatus.persisted = Boolean(yes); }).catch(() => {});
  const voiceList = () => { try { return 'speechSynthesis' in window && typeof window.speechSynthesis.getVoices === 'function' ? window.speechSynthesis.getVoices() || [] : []; } catch (_) { return []; } };
  const voiceFor = code => voiceList().find(voice => voice.lang && voice.lang.toLowerCase().replace('_', '-').startsWith(code));
  function renderDeviceChecks() {
    const list = $('#device-checks'); if (!list) return;
    const row = (ok, text) => `<li class="${ok ? 'ok' : 'warn'}">${icon(ok ? 'circle-check' : 'alert-octagon')}<span>${text}</span></li>`;
    const backup = channels.backup.link ? (channels.backup.lastSent ? `Laptop backup on · last copy ${timeOf(new Date(channels.backup.lastSent).toISOString())}` : 'Laptop backup on · waiting to send') : 'Laptop backup is off';
    const voices = ['en', 'hi', 'es'].map(code => `${{ en: 'English', hi: 'Hindi', es: 'Spanish' }[code]} ${voiceFor(code) ? '✓' : '✗'}`).join(' · ');
    const needed = [...new Set(state.helpers.map(helper => helper.language).filter(code => code && code !== 'en'))].filter(code => !voiceFor(code));
    list.innerHTML = [
      row(deviceStatus.persisted !== false, NATIVE ? 'Saved data stays inside the Helper Jobs app' : deviceStatus.persisted ? 'Saved data is protected on this tablet' : deviceStatus.persisted === false ? 'Saved data is not protected: add Helper Jobs to the home screen' : 'Checking saved data…'),
      row(deviceStatus.installed, NATIVE ? `Running as the ${window.HelperJobsNative.platform === 'ios' ? 'iPad' : 'Android'} app` : deviceStatus.installed ? 'Opened from the home screen' : 'Not on the home screen yet (Share → Add to Home Screen)'),
      row(Boolean(channels.backup.link), backup),
      row(!needed.length, `Read-aloud voices: ${voices}${needed.length ? '. A helper’s language has no voice here, so steps are read in English.' : ''}`),
      row(wake.supported(), wake.supported() ? 'The screen stays on while an outing is live' : 'This browser may let the screen go dark: set auto-lock to Never for the outing'),
      row(true, NATIVE ? 'Updates come with a new version of the app' : swState.live ? 'Updates wait until this outing ends' : 'Updates load when the app opens')
    ].join('');
  }
  // In the app, the coordinator can pin Helper Jobs so helpers cannot leave it (Android), or is shown how (iPad).
  function renderPinCard() {
    const box = $('#pin-app'); if (!box) return;
    box.hidden = !NATIVE;
    if (!NATIVE) return;
    if (window.HelperJobsNative.platform === 'ios') {
      box.innerHTML = `<p class="card-note"><b>Keep helpers in the app:</b> on the iPad, turn on Settings → Accessibility → Guided Access and set a passcode. Then open Helper Jobs and press the top (or Home) button three times. Press it three times again and enter the passcode to leave.</p>`;
      return;
    }
    box.innerHTML = deviceStatus.pinned
      ? `<p class="card-note"><b>Helper Jobs is pinned.</b> Helpers cannot leave the app. Unpin it after the outing.</p><button type="button" class="button button-secondary" data-action="unpin-app">${icon('lock')}Unpin Helper Jobs</button>`
      : `<p class="card-note"><b>Keep helpers in the app:</b> pin Helper Jobs to the screen. Android asks once to confirm. Tip: in Android settings, turn on “Ask for PIN before unpinning”.</p><button type="button" class="button button-secondary" data-action="pin-app"${deviceStatus.canPin ? '' : ' disabled'}>${icon('lock')}Pin Helper Jobs to this screen</button>`;
  }
  // The job editor: a name, a picture, a level, and up to 8 picture steps.
  function jobStepRow(step = ['star', '', '']) { return `<div class="job-step-row" data-job-step><select name="j-icon" aria-label="Step picture">${store.JOB_ICONS.map(name => `<option value="${name}" ${name === step[0] ? 'selected' : ''}>${name.replace(/-/g, ' ')}</option>`).join('')}</select><input name="j-title" maxlength="50" placeholder="Short step, like “Find the map”" value="${esc(step[1])}" aria-label="Step" /><input name="j-text" maxlength="120" placeholder="A few words" value="${esc(step[2])}" aria-label="Words" /><button type="button" class="button-stop" data-action="job-step-remove" aria-label="Remove step">Remove</button></div>`; }
  function renderJobMaker(job) {
    const form = $('#job-form'); if (!form) return;
    if (!$('#job-icon').options.length) $('#job-icon').innerHTML = store.JOB_ICONS.map(name => `<option value="${name}">${name.replace(/-/g, ' ')}</option>`).join('');
    if (job || !$('#job-steps').children.length) {
      form.elements.jobId.value = job ? job.id : ''; form.elements.name.value = job ? job.name : ''; form.elements.desc.value = job ? job.desc : '';
      form.elements.icon.value = job ? job.icon : 'flag'; form.elements.level.value = job ? job.level : 1; form.elements.needsVolunteer.checked = job ? job.needsVolunteer : true;
      $('#job-steps').innerHTML = (job ? job.steps.filter(step => step[1] !== 'Tap Done') : [['map-pin', '', ''], ['eye', '', '']]).map(jobStepRow).join('');
      $('#job-form-title').textContent = job ? `Change “${job.name}”` : 'New job';
    }
    $('#made-jobs').innerHTML = (state.customJobs || []).map(item => `<li><span class="job-pics-icon">${icon(item.icon)}</span><span><b>${esc(item.name)}</b><small>Level ${item.level} · ${item.steps.length} steps · ${state.helpers.filter(h => h.unlockedJobs.includes(item.id)).length} helpers can do it</small></span><button type="button" class="button button-secondary" data-edit-job="${esc(item.id)}">Change</button><button type="button" class="button-stop" data-remove-job="${esc(item.id)}">Remove</button></li>`).join('') || '<li>No jobs made yet.</li>';
  }
  function renderPin() { $$('#pin-dots i').forEach((dot, index) => dot.classList.toggle('filled', index < pin.length)); }
  function readCurrent() {
    const step = currentSteps()[stepIndex];
    const helper = selectedHelper && helperById(selectedHelper.id);
    if (helper?.voiceEnabled === false) return toast('Read aloud is turned off for you.');
    const kid = practiceMode ? null : taskKid();
    // The snack card is read first, so a helper who relies on read aloud always hears it.
    const card = selectedJob.id === 'snack' && kid ? `${snackCardText(kid)} ` : '';
    if (!('speechSynthesis' in window)) return toast('Read aloud is not available on this device.');
    window.speechSynthesis.cancel();
    let text = `${card}${L(step[1], step[3])}. ${L(step[2], step[3])}`;
    let speakLang = lang;
    // No voice for this language on this tablet: read it in English, rather than in the wrong voice.
    if (lang !== 'en' && voiceList().length && !voiceFor(lang)) {
      const en = (value, vars) => t(value, 'en', vars);
      text = `${selectedJob.id === 'snack' && kid ? `${en(kid.snackAllowed ? 'Snack card: a snack is okay for {name}.' : 'Snack card: no snack for {name}. Do not give food.', { name: kid.firstName })} ` : ''}${en(step[1], step[3])}. ${en(step[2], step[3])}`;
      speakLang = 'en'; toast('This tablet has no voice for this language, so it reads in English.');
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANGS[speakLang].speech;
    const voice = voiceFor(speakLang); if (voice) utterance.voice = voice;
    utterance.rate = helper?.slowVoice ? 0.72 : 0.95;
    window.speechSynthesis.speak(utterance);
  }

  // What a helper does, on this tablet or sent from a helper tablet to the main one.
  function helperEvent(event) {
    if (MIRROR) { mirror.send(event); return; }
    applyEvent(event, event.id);
  }
  function applyEvent(event, id) {
    state.appliedEvents = state.appliedEvents || [];
    if (id && state.appliedEvents.includes(id)) return false;
    if (!helperById(event.helperId)) return false;
    let result = { ok: true };
    if (event.kind === 'help' || event.kind === 'stop' || event.kind === 'break') { store.createAlert(state, event.helperId, event.kind); chime(); }
    else if (event.kind === 'start') store.startJob(state, event.assignmentId);
    else if (event.kind === 'finish' || event.kind === 'smiley') result = store.finishJob(state, { helperId: event.helperId, assignmentId: event.assignmentId, smiley: event.smiley, star: Boolean(event.star), eventId: id });
    else if (event.kind === 'practice') result = store.recordPractice(state, event.helperId, event.jobId);
    else if (event.kind === 'tried') { store.markTriedHelp(state, event.helperId); result = { ok: true }; }
    else if (event.kind === 'wish') result = store.addWish(state, event.helperId, event.jobId);
    else return false;
    if (id && !state.appliedEvents.includes(id)) { state.appliedEvents.push(id); if (state.appliedEvents.length > 300) state.appliedEvents.splice(0, state.appliedEvents.length - 300); store.saveState(state); }
    reload();
    return result.ok !== false;
  }
  function requestHelp(kind = 'help') {
    if (!selectedHelper) return toast('Choose your picture first.');
    helperEvent({ id: eventId(), kind, helperId: selectedHelper.id });
    // The lead may not be looking at a screen, so the helper is also told to find a person.
    toast(L(kind === 'stop' ? 'Stopping is okay. Your lead can see it on the board. Find your volunteer.' : 'Your lead can see this on the board. Wave to your volunteer too.'));
  }
  function saveWrapNotes() {
    $$('[data-note]').forEach(input => { state.wrapNotes[input.dataset.note] = input.value; }); state.wrapNotesAt = new Date().toISOString();
    store.mutate(state, 'wrap_notes_saved', state.wrapNotes);
    reload();
  }

  // PINs are chosen on each tablet the first time and kept only as a scrambled (hashed) value.
  const PIN_KEY = 'helper-jobs.pins.v1';
  const pinFlow = { setting: false, first: null, failures: { lead: 0, coordinator: 0 }, lockedUntil: { lead: 0, coordinator: 0 } };
  function readPins() { return ls.get(PIN_KEY) || {}; }
  function savePins(pins) { ls.set(PIN_KEY, pins); }
  async function hashPin(role, value) {
    const text = `helper-jobs:${role}:${value}`;
    if (window.crypto?.subtle) {
      const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
    }
    return `plain:${value}`;
  }
  // Recovery words are kept only as a slow, salted hash (PBKDF2).
  async function wordsHash(words, saltHex) {
    const salt = saltHex ? Uint8Array.from(saltHex.match(/../g).map(h => parseInt(h, 16))) : crypto.getRandomValues(new Uint8Array(16));
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(words), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 210000, hash: 'SHA-256' }, base, 256);
    const hex = bytes => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
    return { salt: hex(salt), hash: hex(bits) };
  }
  function lockedOut(role) {
    const wait = Math.ceil((pinFlow.lockedUntil[role] - Date.now()) / 1000);
    return wait > 0 ? wait : 0;
  }
  async function wrongPin(role) {
    pinFlow.failures[role] += 1;
    if (pinFlow.failures[role] >= 5) { pinFlow.failures[role] = 0; pinFlow.lockedUntil[role] = Date.now() + 30000; return 'Too many tries. Wait 30 seconds.'; }
    return 'That PIN did not work.';
  }
  function startLeadPin() {
    pin = ''; pinFlow.first = null;
    pinFlow.setting = !readPins().lead;
    $('#pin-intro').textContent = pinFlow.setting ? 'First time on this tablet: choose a 4-digit lead PIN. Keep it to yourself.' : 'Enter the 4-digit lead PIN to set up today’s outing.';
    $('#pin-hint').textContent = pinFlow.setting ? 'Type 4 numbers, then Enter.' : '';
    renderPin();
  }
  async function enterLeadPin() {
    const hint = $('#pin-hint');
    const typed = pin; pin = ''; renderPin();
    if (typed.length !== 4) { hint.textContent = 'Type 4 numbers.'; return; }
    if (pinFlow.setting) {
      if (pinFlow.first === null) { pinFlow.first = typed; hint.textContent = 'Type the same PIN again.'; return; }
      if (pinFlow.first !== typed) { pinFlow.first = null; hint.textContent = 'Those did not match. Choose a PIN again.'; return; }
      const pins = readPins(); pins.lead = await hashPin('lead', typed); savePins(pins);
      pinFlow.setting = false; pinFlow.first = null;
      renderOutingSetup(); show('lead-setup-outing'); return;
    }
    const wait = lockedOut('lead');
    if (wait) { hint.textContent = `Too many tries. Wait ${wait} seconds.`; return; }
    if (await hashPin('lead', typed) === readPins().lead) { pinFlow.failures.lead = 0; hint.textContent = ''; renderOutingSetup(); show('lead-setup-outing'); }
    else hint.textContent = await wrongPin('lead');
  }
  function startCoordinatorPin() {
    const setting = !readPins().coordinator;
    $('#coordinator-pin-input').value = '';
    $('#coordinator-pin-confirm').value = '';
    $('#coordinator-confirm-label').hidden = !setting;
    $('#coordinator-recovery-label').hidden = !setting;
    $('#forgot-pin').hidden = setting;
    $('#recover-form').hidden = true;
    $('#coordinator-pin-confirm').required = setting;
    $('#coordinator-pin-label-text').textContent = setting ? 'Choose a coordinator PIN (4 numbers)' : 'Coordinator PIN';
    $('#coordinator-pin-intro').textContent = setting ? 'First time on this tablet: choose a coordinator PIN, different from the lead PIN.' : 'Enter the coordinator PIN to view sensitive records.';
  }
  async function submitCoordinatorPin() {
    const value = $('#coordinator-pin-input').value.trim();
    const pins = readPins();
    if (!/^\d{4}$/.test(value)) return toast('Type 4 numbers.');
    if (!pins.coordinator) {
      if (value !== $('#coordinator-pin-confirm').value.trim()) return toast('Those did not match. Try again.');
      if (pins.lead && await hashPin('lead', value) === pins.lead) return toast('Use a different PIN from the lead PIN.');
      pins.coordinator = await hashPin('coordinator', value);
      const words = $('#coordinator-recovery').value;
      if (words) { if (words.length < 8) return toast('Recovery words need at least 8 letters.'); pins.recovery = await wordsHash(words); }
      savePins(pins); $('#coordinator-recovery').value = '';
      show('coordinator'); renderCoordinator(); return;
    }
    const wait = lockedOut('coordinator');
    if (wait) return toast(`Too many tries. Wait ${wait} seconds.`);
    if (await hashPin('coordinator', value) !== pins.coordinator) return toast(await wrongPin('coordinator'));
    pinFlow.failures.coordinator = 0;
    show('coordinator'); renderCoordinator();
  }

  // Links to other devices. Everything is locked with a key made on this tablet before it is sent;
  // the server passes along scrambled data it cannot read.
  function makeChannel(name, opts) {
    return {
      name, opts, link: null, timer: null, polling: false, seen: 0, lastSent: 0, error: '',
      load() { const saved = ls.get(opts.key); if (saved && saved.roomId && saved.key) { this.link = saved; this.seen = saved.seen || 0; this.publish(); this.poll(); } return this; },
      save() { this.link ? ls.set(opts.key, { ...this.link, seen: this.seen }) : ls.drop(opts.key); },
      schedule(delay = opts.delay || 300) { if (!this.link) return; clearTimeout(this.timer); this.timer = setTimeout(() => this.publish(), delay); },
      async publish() {
        if (!this.link || !navigator.onLine) return pairing.refresh();
        const snapshot = opts.snapshot();
        if (!snapshot) { this.stop(true); return; }
        try { await Link.pushSnapshot(this.link, snapshot); this.lastSent = Date.now(); this.error = ''; if (opts.afterSend) opts.afterSend(this, snapshot); }
        catch (error) {
          if (error.gone) { try { await this.reRegister(); await Link.pushSnapshot(this.link, opts.snapshot()); this.lastSent = Date.now(); this.error = ''; } catch (again) { this.error = again.message; } }
          else this.error = error.message;
        }
        pairing.refresh(); channels.showDots();
      },
      async poll() {
        if (this.polling || !opts.onCommand) return; this.polling = true;
        let failures = 0;
        while (this.link) {
          const link = this.link;
          try {
            const result = await Link.readCommands(link, link.lastCommand || 0, true);
            failures = 0;
            let changed = false;
            for (const command of result.commands) {
              if (command.type === 'hello') { this.seen = Date.now(); continue; }
              if (opts.onCommand(command)) changed = true;
            }
            if (this.link === link) { link.lastCommand = Math.max(link.lastCommand || 0, result.seq || 0); this.save(); }
            if (changed) { reload(); refreshScreens(); }
            if (result.commands.length) { this.publish(); pairing.refresh(); }
          } catch (error) {
            failures += 1;
            if (error.gone && this.link) { try { await this.reRegister(); this.publish(); } catch (_) {} }
            await new Promise(done => setTimeout(done, Math.min(20000, 2000 * failures)));
          }
        }
        this.polling = false;
      },
      // After the live link restarts, the room is made again, with the phones that asked to be woken.
      async reRegister() { await Link.register(this.link); for (const endpoint of this.link.phones || []) await Link.addPhone(this.link, endpoint).catch(() => {}); },
      async start() {
        if (!Link || !Link.available()) { toast('This browser cannot make a pairing code.'); return; }
        const button = $('[data-action="phone-link"]'); const note = $('#pair-start .hj-privacy'); const before = note.textContent;
        button.disabled = true; note.textContent = 'Connecting… The first time after a quiet spell can take up to a minute.';
        this.link = { ...Link.newLink(), lastCommand: 0, ...(opts.size ? { size: opts.size } : {}), ...(opts.keepDays ? { keepDays: opts.keepDays } : {}) };
        try { await Link.register(this.link); this.save(); await this.publish(); this.poll(); }
        catch (error) { this.link = null; toast(navigator.onLine ? `The live link did not answer. ${error.message}` : 'No internet. The tablet keeps working; try again when online.'); }
        button.disabled = false; note.textContent = before;
        pairing.refresh(); channels.showDots();
      },
      stop(quiet) { clearTimeout(this.timer); this.link = null; this.seen = 0; this.lastSent = 0; this.save(); pairing.refresh(); channels.showDots(); if (!quiet) toast(opts.stopped); },
      url() { return this.link ? Link.pairingUrl(this.link, Link.publicBase(location.origin + location.pathname.replace(/[^/]*$/, '').replace(/\/$/, '')), opts.page) : ''; },
      dot() { return !this.link ? 'off' : this.error ? 'error' : 'on'; }
    };
  }

  // The lead's phone: the board, plus "I'm here", a short note, matches and who is here.
  const phoneResults = [];
  function phoneSnapshot() {
    const alerts = state.helpAlerts.filter(item => item.status === 'open');
    const active = state.assignments.filter(item => item.status === 'assigned');
    const describe = assignment => {
      const job = assignment && jobsList().find(item => item.id === assignment.jobId);
      const kid = assignment?.kidId && state.kids.find(item => item.id === assignment.kidId);
      return { job: job ? job.name : '', kid: kid ? kid.firstName : '' };
    };
    const here = { helpers: state.outing.presentHelpers || [], kids: state.outing.presentKids || [] };
    // Only what the lead needs: first names, jobs and alerts. No tips, allergies, consent records or photos.
    return {
      title: state.outing.title || `Sunday at ${state.outing.place}`, place: state.outing.place, lead: state.outing.leadVolunteer, updatedAt: new Date().toISOString(),
      helpers: presentHelpers().map(helper => {
        const status = boardStatus(helper, alerts, active);
        return { id: helper.id, name: helper.name, photo: helper.photo, status: status.label, breakFor: status.kind === 'break' ? status.assignment.id : null, ...describe(status.assignment) };
      }),
      alerts: alerts.map(alert => { const helper = helperById(alert.helperId); return { id: alert.id, kind: alert.kind, createdAt: alert.createdAt, helperName: helper ? helper.name : 'A helper', ...describe(active.find(item => item.helperId === alert.helperId)) }; }),
      counts: { helpers: presentHelpers().length, onJob: active.length },
      manage: {
        helpers: state.helpers.map(helper => ({ id: helper.id, name: helper.name, here: here.helpers.includes(helper.id), jobs: helper.unlockedJobs })),
        kids: state.kids.map(kid => ({ id: kid.id, name: kid.firstName, here: here.kids.includes(kid.id), parentYes: kid.parentConsent !== false })),
        jobs: jobsList().map(job => ({ id: job.id, name: job.name, needsVolunteer: job.needsVolunteer })),
        volunteers: volunteersHere().map(item => ({ id: item.id, name: item.name }))
      },
      results: phoneResults.slice(-10),
      day: (() => { const plan = store.scheduleNowNext(state); return plan.now ? { now: plan.now.label, nowIcon: plan.now.icon, next: plan.next ? plan.next.label : '' } : null; })()
    };
  }
  function phoneCommand(command) {
    const answer = (ok, reason) => { phoneResults.push({ id: command.id, ok, reason: reason || '' }); if (phoneResults.length > 20) phoneResults.shift(); };
    if (command.type === 'ack') {
      const alert = state.helpAlerts.find(item => item.id === command.alertId && item.status === 'open');
      if (alert) { store.acknowledgeAlert(state, alert.id); toast('The lead answered from their phone.'); return true; }
      return false;
    }
    if (command.type === 'phone-push' && channels.phone.link && /^https:\/\//.test(String(command.endpoint || ''))) {
      const phones = (channels.phone.link.phones || []).filter(item => item !== command.endpoint);
      channels.phone.link.phones = [...phones, String(command.endpoint)].slice(-3); channels.phone.save(); return false;
    }
    if (command.type === 'note') { const result = store.noteAlert(state, command.alertId, command.note); answer(result.ok, result.reason); return result.ok; }
    if (command.type === 'schedule') { const result = store.moveSchedule(state, command.delta === -1 ? -1 : 1, 'lead'); answer(result.ok, result.reason); return result.ok; }
    if (command.type === 'break') { const result = store.offerBreak(state, command.assignmentId); answer(result.ok); return result.ok; }
    if (command.type === 'presence') {
      const result = store.setPresence(state, command.kind === 'kid' ? 'kid' : 'helper', command.recordId, Boolean(command.present), 'lead');
      answer(result.ok, result.reason); return result.ok;
    }
    if (command.type === 'assign') {
      const result = store.saveAssignment(state, { helperId: command.helperId, kidId: command.kidId || undefined, jobId: command.jobId, nearbyVolunteerId: command.volunteerId || undefined, startTime: new Date().toISOString(), madeOn: 'phone' });
      answer(result.ok, result.reason); if (result.ok) toast('The lead made a match from their phone.'); return result.ok;
    }
    return false;
  }

  // A new Help or Stop also wakes the lead's phone if it is locked. Each alert wakes it once.
  const woken = new Set(state.helpAlerts.filter(item => item.status === 'open').map(item => item.id));
  const wokenAt = new Map();
  function wakeForNewAlerts(channel, snapshot) {
    const fresh = (snapshot.alerts || []).filter(alert => !woken.has(alert.id));
    if (!fresh.length) return;
    fresh.forEach(alert => { woken.add(alert.id); wokenAt.set(alert.id, Date.now()); });
    Link.wakePhones(channel.link).catch(() => {});
  }
  // Not answered after a minute? Wake the phones again, and again each minute, until someone taps "I'm here".
  function escalate() {
    const open = state.helpAlerts.filter(item => item.status === 'open');
    const due = open.filter(alert => Date.now() - (wokenAt.get(alert.id) || Date.parse(alert.createdAt)) >= 60_000);
    if (due.length && channels.phone.link) { due.forEach(alert => wokenAt.set(alert.id, Date.now())); Link.wakePhones(channels.phone.link).catch(() => {}); }
    if (due.length) chime(true);
    showAlertBanner(open);
  }

  // Helper tablets: the same helpers, jobs and matches. No allergy notes, consent records or photos.
  function tabletSnapshot() {
    const open = state.assignments.filter(item => item.status === 'assigned');
    const kidIds = new Set(open.map(item => item.kidId).filter(Boolean));
    return {
      kind: 'helpers', title: state.outing.title || `Sunday at ${state.outing.place}`, place: state.outing.place, updatedAt: new Date().toISOString(),
      helpers: presentHelpers().map(helper => ({ id: helper.id, name: helper.name, photo: helper.photo, level: helper.level, stars: helper.stars, unlockedJobs: helper.unlockedJobs, language: helper.language, voiceEnabled: helper.voiceEnabled, bigText: Boolean(helper.bigText), contrast: Boolean(helper.contrast), slowVoice: Boolean(helper.slowVoice), consent: helper.consent, badges: store.badgesForHelper(state, helper.id).map(badge => badge.name) })),
      kids: state.kids.filter(kid => kidIds.has(kid.id)).map(kid => ({ id: kid.id, firstName: kid.firstName, photo: kid.photo, safeTips: kid.safeTips, snackAllowed: kid.snackAllowed, snackAllowList: kid.snackAllowList })),
      assignments: open.map(item => ({ id: item.id, helperId: item.helperId, kidId: item.kidId, jobId: item.jobId, status: item.status, startedAt: item.startedAt || null, createdAt: item.createdAt })),
      alerts: state.helpAlerts.filter(item => item.status === 'open').map(item => ({ id: item.id, kind: item.kind, helperId: item.helperId, createdAt: item.createdAt })),
      schedule: state.outing.schedule || [], scheduleNow: state.outing.scheduleNow || 0,
      customJobs: state.customJobs || []
    };
  }
  function tabletCommand(command) {
    if (command.type !== 'event' || !command.event || typeof command.event !== 'object') return false;
    const changed = applyEvent(command.event, command.id);
    if (changed && (command.event.kind === 'help' || command.event.kind === 'stop')) toast(`${helperById(command.event.helperId)?.name || 'A helper'} pressed ${command.event.kind === 'stop' ? 'Stop' : 'Help'} on another tablet.`);
    return changed;
  }
  // The laptop backup: everything on this tablet, locked, so a broken tablet loses nothing.
  function backupSnapshot() {
    return { kind: 'backup', savedAt: new Date().toISOString(), title: state.outing.title || state.outing.place, counts: { helpers: state.helpers.length, kids: state.kids.length, jobs: state.assignments.length }, state: { ...state, audit: state.audit.slice(-200) }, outbox: store.readOutbox() };
  }

  const familyChannels = {};
  const channels = {
    phone: makeChannel('phone', { key: KEYS.phone, snapshot: phoneSnapshot, onCommand: phoneCommand, afterSend: wakeForNewAlerts, stopped: 'The phone no longer gets updates from this tablet.' }),
    tablets: makeChannel('tablets', { key: KEYS.tablets, page: 'index.html', snapshot: tabletSnapshot, onCommand: tabletCommand, stopped: 'Other tablets no longer get updates from this tablet.' }),
    backup: makeChannel('backup', { key: KEYS.backup, page: 'backup.html', size: 'large', keepDays: 14, delay: 4000, snapshot: backupSnapshot, onCommand: () => false, stopped: 'The laptop backup is off.' }),
    wording: makeChannel('wording', { key: 'helper-jobs.wording-link.v1', page: 'wording.html', keepDays: 14, delay: 1500, snapshot: wordingSnapshot, onCommand: wordingCommand, stopped: 'The wording link is off.' }),
    family(helperId) {
      if (!familyChannels[helperId]) familyChannels[helperId] = makeChannel(`family:${helperId}`, { key: `helper-jobs.family-link.${helperId}.v1`, page: 'family.html', keepDays: 14, delay: 2000, snapshot: () => store.familyView(state, helperId), stopped: 'The family page is off.' });
      return familyChannels[helperId];
    },
    all() { return [this.phone, this.tablets, this.backup, this.wording, ...Object.values(familyChannels)]; },
    showDots() {
      const set = (selector, value) => { const el = $(selector); if (el) el.dataset.state = value; };
      set('#phone-dot', this.phone.dot()); set('#tablets-dot', this.tablets.dot()); set('#backup-dot', this.backup.dot()); set('#wording-dot', this.wording.dot());
      $$('[data-family-dot]').forEach(el => { el.dataset.state = familyChannels[el.dataset.familyDot]?.dot() || 'off'; });
    }
  };

  // The wording check from anywhere: a native speaker fixes Hindi or Spanish on their own phone.
  // Only the app's wording is shared (no people); each fix comes back as a command and works here straight away.
  function readFixes() { try { return JSON.parse(localStorage.getItem(I18N.FIX_KEY) || '{}') || {}; } catch (_) { return {}; } }
  function wordingSnapshot() { return { kind: 'wording', fixes: readFixes(), updatedAt: new Date().toISOString() }; }
  function wordingCommand(command) {
    if (command.type !== 'wording' || !['hi', 'es'].includes(command.lang) || !I18N.strings[command.line]) return false;
    const fixes = readFixes(); fixes[command.lang] = fixes[command.lang] || {};
    const text = typeof command.text === 'string' ? command.text.trim().slice(0, 300) : '';
    const entry = { ...(text && text !== I18N.base(command.line, command.lang) ? { text } : {}), ...(command.ok ? { ok: true } : {}) };
    if (Object.keys(entry).length) fixes[command.lang][command.line] = entry; else delete fixes[command.lang][command.line];
    try { localStorage.setItem(I18N.FIX_KEY, JSON.stringify(fixes)); } catch (_) {}
    I18N.loadFixes();
    return true;
  }

  // One pairing screen for every kind of link.
  const PAIR_TEXT = {
    wording: { eyebrow: 'Coordinator · Wording check', title: 'Send the Hindi or Spanish check to a native speaker.', sub: 'They open the link on their own phone, hear each line, fix it and tick it. Each fix comes straight back to this tablet and shows to helpers right away. Only the app’s wording is shared: no people, no records.', scan: 'Scan with their phone', key: 'Or send them this link. Anyone with it can change the wording, so only send it to the person checking.', stop: 'Turn off the wording link', back: 'coordinator', backLabel: 'Coordinator tools', make: 'Make a wording link' },
    phone: { eyebrow: 'Volunteer lead · Lead’s phone', title: 'See Help on your own phone.', sub: 'Help and Stop will also show on your phone, and “I’m here” on the phone closes them here. You can also make matches and mark who is here from the phone. A second lead can scan the same code. The board is locked on this tablet before it is sent: the server cannot read names.', scan: 'Scan with the lead’s phone camera', key: 'Or open this link on the phone. Treat it like a key: only the lead should have it.', stop: 'Stop sending to the phone', back: 'lead-board', backLabel: 'Live board', make: 'Make a pairing code' },
    tablets: { eyebrow: 'Volunteer lead · More tablets', title: 'Add another helper tablet.', sub: 'Helpers can use a second tablet at the same time. It shows the same helpers, jobs and matches, and Help on it reaches this board. Allergy notes, consent records and photos stay on this tablet.', scan: 'Scan with the other tablet’s camera', key: 'Or open this link on the other tablet. Any tablet with it joins this outing, so keep it with the volunteers.', stop: 'Stop sharing with other tablets', back: 'lead-board', backLabel: 'Live board', make: 'Make a pairing code' },
    backup: { eyebrow: 'Coordinator · Laptop backup', title: 'Keep a locked copy on your laptop.', sub: 'Your laptop gets the newest copy of everything on this tablet while the outing runs. It is locked here first: the server cannot read it. If this tablet breaks, download the copy on the laptop and restore it on another tablet.', scan: 'Open on the coordinator’s laptop', key: 'Open this link on your laptop. Only the coordinator should have it. The copy waits on the server, locked, for up to 14 days.', stop: 'Stop the laptop backup', back: 'coordinator', backLabel: 'Coordinator tools', make: 'Make a pairing code' },
    family: { eyebrow: 'Coordinator · Family page', title: 'A page for {name}’s family.', sub: 'Shows only {name}’s stars, badges, certificates, the lead’s kind note and the photo if there is a yes. No kids, no other helpers, no Help notes.', scan: 'Send to the family', key: 'Send this link to the family yourself. Anyone with it can see this page, so only send it to them.', stop: 'Turn off this family page', back: 'coordinator', backLabel: 'Coordinator tools', make: 'Make a family link' }
  };
  const pairing = {
    kind: 'phone', helperId: null,
    channel() { return this.kind === 'family' ? channels.family(this.helperId) : channels[this.kind]; },
    open(kind, helperId) {
      this.kind = kind; this.helperId = helperId || null;
      const text = PAIR_TEXT[kind]; const name = helperId ? helperById(helperId)?.name || 'this helper' : '';
      const fill = value => value.split('{name}').join(name);
      $('#pair-eyebrow').textContent = text.eyebrow; $('#pair-title').textContent = fill(text.title); $('#pair-sub').textContent = fill(text.sub);
      $('#pair-scan').textContent = text.scan; $('#pair-key-note').textContent = text.key; $('#pair-stop').textContent = text.stop; $('#pair-back-label').textContent = text.backLabel;
      $('[data-action="phone-link"]').textContent = text.make;
      $('#pair-qr').dataset.url = '';
      if (window.HelperJobsArt) $('#pair-art').innerHTML = window.HelperJobsArt.draw(kind === 'wording' ? 'note' : kind);
      show('lead-phone-pair'); this.refresh();
    },
    refresh() {
      if (!isActive('lead-phone-pair')) return;
      const channel = this.channel(); const linked = Boolean(channel.link);
      $('#pair-start').hidden = linked; $('#pair-ready').hidden = !linked;
      if (!linked) return;
      const url = channel.url();
      if ($('#pair-qr').dataset.url !== url && window.qrcode) {
        const qr = window.qrcode(0, 'M'); qr.addData(url); qr.make();
        $('#pair-qr').innerHTML = qr.createSvgTag({ cellSize: 6, margin: 3, scalable: true });
        $('#pair-qr').dataset.url = url;
      }
      const who = { phone: 'Phone', tablets: 'A helper tablet', backup: 'Laptop', family: 'Family page', wording: 'The person checking' }[this.kind];
      const seen = channel.seen ? `${who} connected ${Math.max(0, Math.round((Date.now() - channel.seen) / 60000))} min ago.` : this.kind === 'family' ? 'The page updates whenever this tablet changes.' : `Waiting for the ${who.toLowerCase().replace('a helper tablet', 'other tablet')}…`;
      $('#pair-status').textContent = channel.error ? `Not sending right now: ${channel.error} The tablet keeps working.` : `${seen} ${channel.lastSent ? (this.kind === 'backup' ? `Copy sent ${timeOf(new Date(channel.lastSent).toISOString())}.` : 'Sent.') : ''}`;
    }
  };

  // A helper tablet: shows what the main tablet shares, and sends helper actions back.
  const mirror = {
    seq: 0, failures: 0, lastHeard: 0, updatedAt: null, heard: new Set(),
    queue() { return ls.get(KEYS.mirrorQueue) || []; },
    send(event) {
      const queue = this.queue(); queue.push({ id: event.id || eventId(), type: 'event', event: { ...event, id: undefined } }); ls.set(KEYS.mirrorQueue, queue);
      this.applyLocal(event); this.flush();
    },
    // Show the change straight away; the main tablet's next update confirms it.
    applyLocal(event) {
      const assignment = event.assignmentId && state.assignments.find(item => item.id === event.assignmentId);
      if (event.kind === 'start' && assignment && !assignment.startedAt) assignment.startedAt = new Date().toISOString();
      if (event.kind === 'finish' && assignment) assignment.status = 'complete';
      if (event.kind === 'smiley' && event.star) { const helper = helperById(event.helperId); if (helper) helper.stars += 1; }
      ls.set(KEYS.mirrorState, state);
    },
    async flush() {
      if (this.flushing) return; this.flushing = true;
      try {
        for (const item of this.queue()) {
          await Link.sendCommand(mirrorLink, item);
          ls.set(KEYS.mirrorQueue, this.queue().filter(entry => entry.id !== item.id));
        }
      } catch (_) { setTimeout(() => this.flush(), 5000); }
      this.flushing = false; this.status();
    },
    adopt(snapshot) {
      const alerts = (snapshot.alerts || []).map(item => ({ ...item, status: 'open' }));
      const next = { schemaVersion: 1, mirror: true, outing: { id: 'mirror', title: snapshot.title, place: snapshot.place, presentHelpers: (snapshot.helpers || []).map(item => item.id), presentKids: [], schedule: snapshot.schedule || [], scheduleNow: snapshot.scheduleNow || 0 }, helpers: snapshot.helpers || [], kids: snapshot.kids || [], customJobs: snapshot.customJobs || [], volunteers: [], assignments: snapshot.assignments || [], helpAlerts: alerts, audit: [], wrapNotes: {}, practice: [], appliedEvents: [] };
      if (alerts.some(item => !this.heard.has(item.id))) { alerts.forEach(item => this.heard.add(item.id)); chime(); }
      ls.set(KEYS.mirrorState, next);
      this.updatedAt = snapshot.updatedAt;
      reload();
      if (isActive('helper-who')) renderHelpers();
      if (isActive('helper-jobs')) renderJobs();
    },
    status() {
      const el = $('#mirror-state'); if (!el) return;
      const waiting = this.queue().length;
      const stale = this.updatedAt && Date.now() - Date.parse(this.updatedAt) > 120_000;
      el.textContent = this.failures ? `Reconnecting…${waiting ? ` ${waiting} waiting to send.` : ''} Help still works: wave to your volunteer.` : !this.lastHeard ? 'Connecting…' : stale ? 'Main tablet quiet' : waiting ? 'Sending…' : 'Live';
      el.dataset.state = this.failures || stale ? 'off' : 'live';
      // The main tablet has gone quiet for a while: this tablet can take over, from the laptop's locked copy.
      const quiet = (stale || this.failures > 3) && this.lastHeard && Date.now() - this.lastHeard > 120_000 || stale;
      let take = $('#mirror-takeover');
      if (quiet && !take) { $('#mirror-banner').insertAdjacentHTML('beforeend', '<button type="button" class="secondary" id="mirror-takeover" data-action="mirror-takeover">Main tablet stopped? Use this one</button>'); }
      if (!quiet && take) take.remove();
    },
    async loop() {
      for (;;) {
        try {
          const result = await Link.readSnapshot(mirrorLink, this.seq, true);
          this.failures = 0; this.lastHeard = Date.now();
          if (result.snapshot && result.snapshot.kind === 'helpers') { this.seq = result.seq; this.adopt(result.snapshot); }
        } catch (error) {
          this.failures += 1;
          if (error.gone || error.status === 403) { $('#mirror-state').textContent = 'The main tablet stopped sharing. Ask the lead for a new code.'; return; }
          await new Promise(done => setTimeout(done, Math.min(15000, 2000 * this.failures)));
        }
        this.status();
      }
    },
    start() {
      document.body.classList.add('is-mirror');
      $('#mirror-banner').hidden = false;
      $('#mirror-banner').insertAdjacentHTML('beforeend', '<button type="button" class="button-stop" data-action="mirror-leave">Leave this outing</button>');
      Link.sendCommand(mirrorLink, { id: Link.id('hello'), type: 'hello', at: new Date().toISOString() }).catch(() => {});
      this.flush(); this.loop(); setInterval(() => this.status(), 10_000);
      window.addEventListener('online', () => this.flush());
    }
  };

  function refreshScreens() {
    if (isActive('lead-board')) renderLead();
    if (isActive('lead-wrap')) renderWrap();
    if (isActive('coordinator')) renderCoordinator();
    if (isActive('helper-who')) renderHelpers();
  }
  function openHelpNote(alertId) {
    const form = $('#help-note-form');
    form.dataset.noteFor = alertId; form.hidden = false; $('#help-note-text').value = '';
    $('#help-note-text').focus();
  }
  function startTask(job, assignment, practice) {
    selectedJob = job; activeAssignment = assignment; practiceMode = practice; stepIndex = 0; starGiven = false;
    if (assignment && !assignment.startedAt && selectedHelper) helperEvent({ id: eventId(), kind: 'start', helperId: selectedHelper.id, assignmentId: assignment.id });
    renderTask(); show('helper-task');
  }
  function finishTask() {
    const helperId = selectedHelper?.id;
    if (practiceMode) { if (helperId) helperEvent({ id: eventId(), kind: 'practice', helperId, jobId: selectedJob.id }); }
    else if (helperId) helperEvent({ id: eventId(), kind: 'finish', helperId, assignmentId: activeAssignment?.id || null });
    starGiven = false;
    $$('[data-smiley]').forEach(button => button.classList.remove('selected'));
    $('#badge-earned').hidden = true;
    $('#done-eyebrow').textContent = L(practiceMode ? 'Practice done' : 'Job complete');
    $('#done-title').textContent = L(practiceMode ? 'You practised a new job.' : 'You showed up for someone.');
    $('#wish-box').innerHTML = `<p class="wish-title">${esc(L('Next time I’d like to try…'))}</p><div class="wish-row">${jobsList().map(job => `<button type="button" class="wish" data-wish="${job.id}">${icon(job.icon)}<span>${esc(L(job.name))}</span></button>`).join('')}</div>`;
    show('helper-done');
  }
  async function resizePhoto(file, wide) {
    const url = URL.createObjectURL(file);
    try {
      const image = await new Promise((done, fail) => { const img = new Image(); img.onload = () => done(img); img.onerror = fail; img.src = url; });
      const canvas = document.createElement('canvas');
      if (wide) {
        // Step pictures: 4:3, up to 480 px wide.
        const w = Math.min(image.naturalWidth, image.naturalHeight * 4 / 3); const h = w * 3 / 4;
        canvas.width = wide; canvas.height = Math.round(wide * 3 / 4);
        canvas.getContext('2d').drawImage(image, (image.naturalWidth - w) / 2, (image.naturalHeight - h) / 2, w, h, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.75);
      }
      const size = 160; const side = Math.min(image.naturalWidth, image.naturalHeight);
      canvas.width = size; canvas.height = size;
      canvas.getContext('2d').drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, size, size);
      return canvas.toDataURL('image/jpeg', 0.78);
    } finally { URL.revokeObjectURL(url); }
  }

  // A soft two-note chime when someone asks for help, so the volunteers nearby hear it too.
  let audio = null;
  document.addEventListener('pointerdown', () => { if (!audio) { try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { audio = null; } } }, { once: true, capture: true });
  function chime(again) {
    if (device.get().quiet) return;
    try {
      if (!audio) return;
      const at = audio.currentTime;
      (again ? [880, 660, 880] : [660, 880]).forEach((hz, i) => { const o = audio.createOscillator(); const g = audio.createGain(); o.frequency.value = hz; g.gain.setValueAtTime(0.0001, at + i * 0.28); g.gain.exponentialRampToValueAtTime(device.get().outdoor ? 0.6 : 0.25, at + i * 0.28 + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, at + i * 0.28 + 0.26); o.connect(g); g.connect(audio.destination); o.start(at + i * 0.28); o.stop(at + i * 0.28 + 0.3); });
    } catch (_) {}
  }
  // On every screen: who asked for help, and for how long. Helpers read "a volunteer is coming".
  function showAlertBanner(open = state.helpAlerts.filter(item => item.status === 'open')) {
    const banner = $('#alert-banner'); if (!banner) return;
    const show = open.length > 0 && !isActive('lead-board');
    banner.hidden = !show;
    if (!show) return;
    const leadSide = /^(lead-|coordinator)/.test($('.screen.active')?.id || '');
    const items = open.map(alert => { const name = helperById(alert.helperId)?.name || 'A helper'; const mins = Math.floor((Date.now() - Date.parse(alert.createdAt)) / 60000); return `<span><b>${esc(name)}</b> ${alert.kind === 'stop' ? 'wants to stop' : alert.kind === 'break' ? 'wants a break' : 'asked for help'}${mins >= 1 ? ` · ${mins} min` : ''}</span>`; }).join('');
    banner.innerHTML = `${icon('bell-ringing')}<div>${items}<small>${leadSide ? 'Answer it on the live board.' : 'A volunteer is coming.'}</small></div>${leadSide && !MIRROR ? '<button type="button" class="secondary" data-action="lead-board">Live board</button>' : ''}`;
  }

  // During an outing the app does not change under people: new versions wait until wrap-up.
  const swState = { live: false };
  // First open in a browser tab on a phone or tablet: show how to put Helper Jobs on the home screen, for this device.
  let installPrompt = null;
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; setupInstallCard(); });
  window.addEventListener('appinstalled', () => { ls.set('helper-jobs.install-done.v1', true); setupInstallCard(); });
  function setupInstallCard() {
    const card = $('#install-card'); if (!card) return;
    const standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
    const touch = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || navigator.maxTouchPoints > 1;
    if (NATIVE || MIRROR || standalone || !touch || ls.get('helper-jobs.install-dismissed.v1') || ls.get('helper-jobs.install-done.v1')) { card.hidden = true; return; }
    const ua = navigator.userAgent;
    const apple = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const notSafari = apple && /CriOS|FxiOS|EdgiOS|GSA\//.test(ua);
    const step = (ic, html) => `<li><span class="install-step-icon">${icon(ic)}</span><span>${html}</span></li>`;
    let steps;
    if (installPrompt) steps = `<button type="button" class="primary" data-action="install-now">${icon('download')}Install Helper Jobs</button>`;
    else if (apple && notSafari) steps = `<ol>${step('link', 'Open this page in <b>Safari</b> (copy the address, paste it in Safari).')}${step('upload', 'Tap <b>Share</b> <span aria-hidden="true">⬆︎</span>.')}${step('home', 'Tap <b>Add to Home Screen</b>, then <b>Add</b>.')}</ol>`;
    else if (apple) steps = `<ol>${step('upload', 'Tap <b>Share</b> <span aria-hidden="true">⬆︎</span> at the top or bottom of Safari.')}${step('home', 'Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b>.')}${step('device-tablet', 'Open Helper Jobs from its new icon. It opens full screen, like an app.')}</ol>`;
    else steps = `<ol>${step('settings', 'Tap <b>⋮</b> at the top of Chrome.')}${step('home', 'Tap <b>Add to Home screen</b> (or <b>Install app</b>), then <b>Install</b>.')}${step('device-tablet', 'Open Helper Jobs from its new icon. It opens full screen, like an app.')}</ol>`;
    card.innerHTML = `<div class="install-head"><span class="install-icon" aria-hidden="true">h.</span><div><h2 id="install-title">Put Helper Jobs on the home screen</h2><p>Then it opens like an app, full screen, and works without internet.</p></div></div>${steps}<button type="button" class="install-later" data-action="install-later">Not now</button>`;
    card.hidden = false;
  }

  // Keep the screen on while an outing is live: the app does it natively; a browser uses the Wake Lock API.
  const wake = {
    lock: null, want: false,
    supported: () => NATIVE || 'wakeLock' in navigator,
    async set(on) {
      this.want = on;
      if (NATIVE) return window.HelperJobsNative.keepAwake(on);
      if (!('wakeLock' in navigator)) return;
      if (on && !this.lock && document.visibilityState === 'visible') {
        try { this.lock = await navigator.wakeLock.request('screen'); this.lock.addEventListener('release', () => { this.lock = null; }); } catch (_) {}
      } else if (!on && this.lock) { const held = this.lock; this.lock = null; held.release().catch(() => {}); }
    }
  };
  document.addEventListener('visibilitychange', () => { if (wake.want && document.visibilityState === 'visible') wake.set(true); });
  function swOuting(live) {
    swState.live = live; ls.set('helper-jobs.outing-live.v1', live ? Date.now() : 0);
    wake.set(live);
    if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.controller.postMessage({ type: 'outing', live });
  }
  { const since = ls.get('helper-jobs.outing-live.v1'); swState.live = Boolean(since) && Date.now() - since < 10 * 3600_000; }
  if (swState.live) wake.set(true);

  // This tablet's own settings (not part of the outing records).
  const device = {
    get() { return ls.get('helper-jobs.device.v1') || {}; },
    set(patch) { ls.set('helper-jobs.device.v1', { ...this.get(), ...patch }); this.apply(); },
    apply() { document.body.classList.toggle('helper-only', Boolean(this.get().helperOnly) && !MIRROR); document.body.classList.toggle('outdoor', Boolean(this.get().outdoor)); }
  };
  device.apply();
  // Helper-only mode: the lead gets in by holding the "h." for 2 seconds (or holding Enter on it).
  let holdTimer = null;
  const brand = $('header .brand');
  const holdStart = () => { if (!document.body.classList.contains('helper-only') || holdTimer) return; brand.classList.add('holding'); holdTimer = setTimeout(() => { holdTimer = null; brand.classList.remove('holding'); show('lead-pin'); startLeadPin(); }, 2000); };
  const holdEnd = () => { clearTimeout(holdTimer); holdTimer = null; brand.classList.remove('holding'); };
  brand.addEventListener('pointerdown', holdStart); ['pointerup', 'pointerleave', 'pointercancel'].forEach(name => brand.addEventListener(name, holdEnd));
  brand.addEventListener('contextmenu', event => { if (document.body.classList.contains('helper-only')) event.preventDefault(); });
  brand.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { if (!event.repeat) holdStart(); if (document.body.classList.contains('helper-only')) event.preventDefault(); } });
  brand.addEventListener('keyup', holdEnd);
  // Left on the job list or the "done" screen for 2 minutes, the tablet goes back to "Who are you today?".
  // A helper in the middle of a job is never interrupted.
  let lastTouch = Date.now();
  ['pointerdown', 'keydown'].forEach(name => document.addEventListener(name, () => { lastTouch = Date.now(); }, true));
  setInterval(() => {
    if (Date.now() - lastTouch < 120_000) return;
    if (isActive('helper-jobs') || isActive('helper-done')) { selectedHelper = null; show('helper-who'); renderHelpers(); }
  }, 15_000);

  document.addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'helper-entry') { show('helper-who'); renderHelpers(); }
    else if (action === 'lead-entry') { if (MIRROR) return toast('Lead tools are on the main tablet.'); show('lead-pin'); startLeadPin(); }
    else if (action === 'helper-jobs') { show('helper-jobs'); applyHelperPrefs(selectedHelper && helperById(selectedHelper.id)); renderJobs(); }
    else if (action === 'home') { show('home'); }
    else if (action === 'lead-board') { show('lead-board'); renderLead(); }
    else if (action === 'lead-setup') { show('lead-setup'); renderAssignmentForm(); }
    else if (action === 'coordinator') { show('coordinator-pin'); startCoordinatorPin(); }
    else if (action === 'read') readCurrent();
    else if (action === 'next') { if (stepIndex < currentSteps().length - 1) { stepIndex += 1; renderTask(); } else finishTask(); }
    else if (action === 'help') requestHelp();
    // Stopping goes back to the start screen, never to the lead's board.
    else if (action === 'stop-task') { requestHelp('stop'); window.clearInterval(talkTimer); selectedJob = null; activeAssignment = null; practiceMode = false; show('home'); }
    else if (action === 'wrap') { show('lead-wrap'); renderWrap(); }
    else if (action === 'finish-outing') {
      const count = store.headcount(state);
      if (!count.done) { toast(`Mark every kid first: ${count.missing.map(kid => kid.firstName).join(', ')}.`); $(`[data-headcount="${count.missing[0].id}"]`)?.focus(); return; }
      const fb = $('#wrap-feedback form'); if (fb) { const result = saveFeedback(fb); if (!result.ok && !/Pick a face/.test(result.reason)) return toast(result.reason); }
      saveWrapNotes(); swOuting(false); show('home'); toast('Outing finished. Every kid is marked. Thank you.');
    }
    else if (action === 'schedule-next' || action === 'schedule-back') { store.moveSchedule(state, action === 'schedule-next' ? 1 : -1, 'lead'); reload(); renderLead(); }
    else if (action === 'schedule-add') { const list = readScheduleEditor(); if (list.length >= 8) return toast('Up to 8 parts of the day.'); renderScheduleEditor([...list, { icon: 'star', label: '', time: '' }]); $$('[name="s-label"]').at(-1).focus(); }
    else if (action === 'schedule-remove') { event.target.closest('[data-schedule-row]').remove(); }
    else if (action === 'need-break') { if (!selectedHelper) return; helperEvent({ id: eventId(), kind: 'break', helperId: selectedHelper.id }); window.clearInterval(talkTimer); show('helper-break'); }
    else if (action === 'break-done') { show('helper-task'); renderTask(); }
    else if (action === 'practice-help') { $('#practice-help-done').hidden = true; $('#practice-help-try').hidden = false; show('helper-practice-help'); }
    else if (action === 'practice-help-press') { $('#practice-help-done').hidden = false; $('#practice-help-try').hidden = true; if (selectedHelper) helperEvent({ id: eventId(), kind: 'tried', helperId: selectedHelper.id }); }
    else if (action === 'job-step-add') { if ($$('[data-job-step]').length >= 8) return toast('Up to 8 steps.'); $('#job-steps').insertAdjacentHTML('beforeend', jobStepRow()); $$('[name="j-title"]').at(-1).focus(); }
    else if (action === 'job-step-remove') { event.target.closest('[data-job-step]').remove(); }
    else if (action === 'job-form-clear') { $('#job-steps').innerHTML = ''; renderJobMaker(); }
    else if (action === 'tick-all' || action === 'tick-none') { $$('#outing-form input[type="checkbox"]').forEach(box => { box.checked = action === 'tick-all'; }); }
    else if (action === 'reset-lead-pin') { if (window.confirm('Reset the lead PIN? The lead chooses a new one next time.')) { const pins = readPins(); delete pins.lead; savePins(pins); toast('Lead PIN reset.'); } }
    else if (action === 'forgot-pin') { $('#recover-form').hidden = false; $('#recover-note').hidden = Boolean(readPins().recovery); $('#recover-form input[name="words"]').focus(); }
    else if (action === 'feedback') { show('feedback'); $('#feedback-box').innerHTML = feedbackForm(null); }
    else if (action === 'feedback-csv') { download(`helper-jobs-feedback-${state.outing.date || 'outing'}.csv`, store.feedbackCsv(state), 'text/csv'); toast('Feedback downloaded. It has no names.'); }
    else if (action === 'phone-pair') pairing.open('phone');
    else if (action === 'tablets-pair') pairing.open('tablets');
    else if (action === 'backup-pair') pairing.open('backup');
    else if (action === 'wording-pair') pairing.open('wording');
    else if (action === 'install-later') { ls.set('helper-jobs.install-dismissed.v1', true); setupInstallCard(); }
    else if (action === 'install-now' && installPrompt) { const promptEvent = installPrompt; installPrompt = null; promptEvent.prompt(); promptEvent.userChoice.then(choice => { if (choice.outcome === 'accepted') ls.set('helper-jobs.install-done.v1', true); setupInstallCard(); }).catch(() => setupInstallCard()); }
    else if (action === 'pair-back') { const back = PAIR_TEXT[pairing.kind].back; show(back); back === 'coordinator' ? renderCoordinator() : renderLead(); }
    else if (action === 'phone-link') pairing.channel().start();
    else if (action === 'phone-unlink') pairing.channel().stop();
    else if (action === 'phone-copy') { const url = pairing.channel().url(); (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => toast('Link copied. Send it only to the person it is for.'), () => toast(url)); }
    else if (action === 'snacks') toast('Snack check: “snack okay” or “no snack” comes from the coordinator. Only a coordinator may change it.');
    else if (action === 'skip-note') { $('#help-note-form').hidden = true; }
    else if (action === 'summary') { download(`helper-jobs-summary-${state.outing.date || 'outing'}.csv`, store.outingSummary(state, jobsList()), 'text/csv'); toast('Summary downloaded. It has no kid details.'); }
    else if (action === 'pin-app' || action === 'unpin-app') {
      const pinning = action === 'pin-app';
      (pinning ? window.HelperJobsNative.pinApp() : window.HelperJobsNative.unpinApp())
        .then(() => window.HelperJobsNative.pinState()).then(result => { deviceStatus.pinned = Boolean(result.pinned); renderPinCard(); renderDeviceChecks(); toast(pinning ? 'Helper Jobs is pinned to this screen.' : 'Helper Jobs is unpinned.'); })
        .catch(() => toast('This tablet could not pin the app.'));
    }
    else if (action === 'fresh-start') { if (window.confirm(FRESH_QUESTION)) { channels.all().forEach(channel => channel.stop(true)); clearTablet(); location.replace(location.pathname); } }
    else if (action === 'mirror-takeover') { if (window.confirm('Make this the main tablet? It leaves the old outing. Then choose PINs and restore the newest locked copy from the coordinator’s laptop.')) { clearTablet(); ls.set('helper-jobs.takeover.v1', true); location.replace(location.pathname); } }
    else if (action === 'takeover-done') { ls.drop('helper-jobs.takeover.v1'); $('#takeover-card').remove(); }
    else if (action === 'mirror-leave') { if (window.confirm('Leave this outing on this tablet? It stops showing the main tablet’s helpers.')) { clearTablet(); location.replace(location.pathname); } }

    const helperButton = event.target.closest('[data-helper]');
    if (helperButton) { selectedHelper = helperById(helperButton.dataset.helper); show('helper-jobs'); applyHelperPrefs(selectedHelper); $('#helper-greeting').textContent = L('Hi {name}. Choose one picture. Your volunteer is nearby.', { name: selectedHelper.name }); renderJobs(); }
    const jobButton = event.target.closest('[data-job]');
    if (jobButton) {
      const job = jobsList().find(item => item.id === jobButton.dataset.job);
      const helper = selectedHelper && helperById(selectedHelper.id);
      if (!helper?.unlockedJobs.includes(job.id)) {
        if (store.practiceJobs(helper, state).includes(job.id)) return startTask(job, null, true);
        return toast('This job unlocks after more outings and coordinator approval.');
      }
      const assignment = openAssignment(helper.id, job.id);
      // Jobs with kids only start once the lead has matched the helper, a kid and a nearby volunteer.
      if (job.needsVolunteer && !assignment) return toast(L('Ask your lead to start this with you.'));
      startTask(job, assignment, false);
    }
    const wish = event.target.closest('[data-wish]');
    if (wish && selectedHelper) { $$('[data-wish]').forEach(b => b.classList.toggle('selected', b === wish)); helperEvent({ id: eventId(), kind: 'wish', helperId: selectedHelper.id, jobId: wish.dataset.wish }); toast(L('Thank you. Your coordinator will see it.')); }
    const smile = event.target.closest('[data-smiley]');
    if (smile && selectedHelper) {
      $$('[data-smiley]').forEach(button => button.classList.remove('selected')); smile.classList.add('selected');
      const badge = $('#badge-earned');
      if (practiceMode) { badge.hidden = false; $('#badge-title').textContent = L('Practice done'); $('#badge-description').textContent = L('Take your time with this new job.'); return; }
      // One star per finished job, however many times a smiley is tapped.
      helperEvent({ id: eventId(), kind: 'smiley', helperId: selectedHelper.id, assignmentId: activeAssignment?.id || null, smiley: smile.dataset.smiley, star: !starGiven });
      starGiven = true; badge.hidden = false;
      const badges = MIRROR ? helperById(selectedHelper.id)?.badges || [] : store.badgesForHelper(state, selectedHelper.id).map(item => item.name);
      $('#badge-title').textContent = badges.at(-1) || L('Star earned');
      $('#badge-description').textContent = L(badges.length ? 'You reached a new badge.' : 'You earned a star for helping.');
    }
    const alertButton = event.target.closest('[data-alert]');
    if (alertButton) { const id = alertButton.dataset.alert; store.acknowledgeAlert(state, id); reload(); renderLead(); openHelpNote(id); }
    const saveVol = event.target.closest('[data-save-vol]');
    if (saveVol) { const id = saveVol.dataset.saveVol; const result = store.changeVolunteer(state, id, $(`[data-change-vol="${id}"]`).value, 'lead'); if (!result.ok) return toast(result.reason); reload(); renderLead(); toast('Volunteer changed.'); }
    const endJob = event.target.closest('[data-end-job]');
    if (endJob) { if (!window.confirm('End this job now? The helper goes back to choosing a job.')) return; const result = store.endAssignment(state, endJob.dataset.endJob, 'lead'); if (!result.ok) return toast(result.reason); reload(); renderLead(); toast('Job ended.'); }
    const editJob = event.target.closest('[data-edit-job]');
    if (editJob) { renderJobMaker((state.customJobs || []).find(job => job.id === editJob.dataset.editJob)); $('#job-form').scrollIntoView({ block: 'start' }); }
    const removeJob = event.target.closest('[data-remove-job]');
    if (removeJob) { if (!window.confirm('Remove this job? Helpers who could do it lose it, and its pictures go too.')) return; const result = store.removeCustomJob(state, removeJob.dataset.removeJob, 'coordinator'); if (!result.ok) return toast(result.reason); reload(); renderCoordinator(); toast('Job removed.'); }
    const exportBtn = event.target.closest('[data-export-kind]');
    if (exportBtn) { const data = store.exportPerson(state, exportBtn.dataset.exportKind, exportBtn.dataset.exportId); if (data) { download(`helper-jobs-${exportBtn.dataset.exportKind}-${(data.person.name || data.person.firstName || 'record').toLowerCase()}.json`, JSON.stringify(data, null, 2), 'application/json'); toast('Downloaded. Other people appear only as “a kid” or “a helper”.'); } }
    const volRemove = event.target.closest('[data-remove-vol]');
    if (volRemove) { const result = store.removeVolunteer(state, volRemove.dataset.removeVol, 'coordinator'); if (!result.ok) return toast(result.reason); reload(); renderCoordinator(); toast('Volunteer removed.'); }
    const breakButton = event.target.closest('[data-break]');
    if (breakButton) { store.offerBreak(state, breakButton.dataset.break); reload(); renderLead(); toast('Noted. Their next reminder comes after the next job starts.'); }
    const headButton = event.target.closest('[data-headcount]');
    if (headButton) {
      const kidId = headButton.dataset.headcount; const current = state.outing.headcount?.[kidId]?.status;
      store.setReturn(state, kidId, current === headButton.dataset.value ? null : headButton.dataset.value, 'lead'); reload(); renderWrap();
      $(`[data-headcount="${kidId}"][data-value="${headButton.dataset.value}"]`)?.focus();
    }
    const snackButton = event.target.closest('[data-snack-kid]');
    if (snackButton) {
      const kid = state.kids.find(item => item.id === snackButton.dataset.snackKid);
      const allow = snackButton.dataset.snackValue === 'true';
      if (allow && kid && hasAllergy(kid) && !window.confirm(`${kid.firstName}'s record says allergy: ${kid.allergy}. Allow snacks anyway? Only do this if the parent has said which snacks are safe.`)) return;
      const result = store.setSnackPermission(state, snackButton.dataset.snackKid, allow, 'coordinator');
      if (result.ok) { reload(); renderCoordinator(); }
    }
    const unlockButton = event.target.closest('[data-unlock-helper]');
    if (unlockButton) { const result = store.unlockJob(state, unlockButton.dataset.unlockHelper, unlockButton.dataset.unlockJob, 'coordinator'); if (result.ok) { reload(); renderCoordinator(); toast('Job unlock approved.'); } }
    const removeButton = event.target.closest('[data-remove-kind]');
    if (removeButton) {
      const kind = removeButton.dataset.removeKind; const recordId = removeButton.dataset.removeId;
      const record = kind === 'helper' ? helperById(recordId) : state.kids.find(item => item.id === recordId);
      if (!record || !window.confirm(`Remove ${record.name || record.firstName} from this tablet? Their history${kind === 'helper' ? ', notes' : ''} and photo are removed too. This can’t be undone.`)) return;
      if (kind === 'helper' && familyChannels[recordId]) familyChannels[recordId].stop(true);
      const result = store.removePerson(state, kind, recordId, 'coordinator');
      if (result.ok) { reload(); renderCoordinator(); toast(`${record.name || record.firstName} was removed.`); }
    }
    const stepRemove = event.target.closest('[data-step-photo-remove]');
    if (stepRemove) { store.setStepPhoto(state, stepRemove.dataset.stepPhotoRemove, Number(stepRemove.dataset.stepIndex), null, 'coordinator'); reload(); renderCoordinator(); toast('Picture removed.'); }
    const photoRemove = event.target.closest('[data-photo-remove]');
    if (photoRemove) { store.setPhoto(state, photoRemove.dataset.photoRemove, photoRemove.dataset.photoId, null, 'coordinator'); reload(); renderCoordinator(); toast('Photo removed from this tablet.'); }
    const familyButton = event.target.closest('[data-family]');
    if (familyButton && !familyButton.disabled) pairing.open('family', familyButton.dataset.family);
    const retentionButton = event.target.closest('[data-action="retention"]');
    if (retentionButton) { store.setRetention(state, { deletePhotosAfterDays: 30, keepOperationalNotesAfterDays: 30 }, 'coordinator'); store.applyRetention(state); reload(); renderCoordinator(); toast('Photos, Help alerts, notes and history older than 30 days will be cleared from this tablet.'); }
    const rating = event.target.closest('[data-rating]');
    if (rating) { const assignment = state.assignments.filter(item => item.helperId === rating.dataset.rating).at(-1); if (assignment) { assignment.leadRating = rating.dataset.value; store.mutate(state, 'lead_rating_recorded', { assignmentId: assignment.id, rating: rating.dataset.value }); reload(); toast('Wrap-up rating saved.'); } else toast('No job to rate yet for this helper.'); }
  });

  document.addEventListener('change', async event => {
    const stepInput = event.target.closest('[data-step-photo]');
    if (stepInput && stepInput.files && stepInput.files[0]) {
      const jobId = stepInput.dataset.stepPhoto;
      try {
        const dataUrl = await resizePhoto(stepInput.files[0], 480);
        const result = store.setStepPhoto(state, jobId, Number(stepInput.dataset.stepIndex), dataUrl, 'coordinator');
        if (!result.ok) return toast(result.reason);
        reload(); renderCoordinator(); $(`[data-step-photo="${jobId}"]`)?.closest('details')?.setAttribute('open', ''); toast('Picture saved for this step.');
      } catch (_) { toast('That picture could not be used. Try another.'); }
      return;
    }
    const input = event.target.closest('[data-photo-kind]');
    if (!input || !input.files || !input.files[0]) return;
    try {
      const dataUrl = await resizePhoto(input.files[0]);
      const result = store.setPhoto(state, input.dataset.photoKind, input.dataset.photoId, dataUrl, 'coordinator');
      if (!result.ok) return toast(result.reason);
      reload(); renderCoordinator(); toast('Photo saved on this tablet only. It is never sent to the lead’s phone or other tablets.');
    } catch (_) { toast('That photo could not be used. Try another.'); }
  });

  document.addEventListener('submit', async event => {
    const form = event.target;
    if (form.id === 'add-helper-form' || form.id === 'add-kid-form') {
      event.preventDefault();
      const data = new FormData(form);
      const result = form.id === 'add-helper-form'
        ? store.addHelper(state, { name: data.get('name'), photo: data.get('photo'), language: data.get('language'), consent: data.get('consent') === 'on' }, 'coordinator')
        : store.addKid(state, { firstName: data.get('firstName'), photo: data.get('photo'), safeTips: String(data.get('safeTips') || '').split(',').map(item => item.trim()).filter(Boolean), allergy: data.get('allergy'), parentConsent: data.get('parentConsent') === 'on' }, 'coordinator');
      if (!result.ok) return toast(result.reason);
      form.reset(); reload(); renderCoordinator();
      toast(result.helper ? `${result.helper.name} was added.${result.helper.consent ? '' : ' Record their yes before they take a job.'}` : `${result.kid.firstName} was added with “no snack”.${result.kid.parentConsent ? '' : ' Record a parent’s yes before any kid job.'}`);
      return;
    }
    if (form.matches('[data-feedback-form]')) {
      event.preventDefault();
      const result = saveFeedback(form);
      toast(result.ok ? 'Thank you. Saved for the coordinator.' : result.reason);
      return;
    }
    if (form.id === 'device-form') {
      event.preventDefault();
      const data = new FormData(form);
      device.set({ helperOnly: data.get('helperOnly') === 'on', outdoor: data.get('outdoor') === 'on', quiet: data.get('quiet') === 'on' });
      toast(device.get().helperOnly ? 'Helper-only mode is on. Hold the h. for 2 seconds to get back to lead tools.' : 'Helper-only mode is off.');
      return;
    }
    if (form.id === 'recover-form') {
      event.preventDefault();
      const data = new FormData(form); const pins = readPins();
      if (!pins.recovery) return toast('No recovery words were set on this tablet.');
      const wait = lockedOut('coordinator'); if (wait) return toast(`Too many tries. Wait ${wait} seconds.`);
      if ((await wordsHash(String(data.get('words')), pins.recovery.salt)).hash !== pins.recovery.hash) return toast(await wrongPin('coordinator'));
      if (!/^\d{4}$/.test(String(data.get('pin'))) || data.get('pin') !== data.get('pin2')) return toast('Type the same 4 numbers twice.');
      if (pins.lead && await hashPin('lead', data.get('pin')) === pins.lead) return toast('Use a different PIN from the lead PIN.');
      pins.coordinator = await hashPin('coordinator', data.get('pin')); savePins(pins); form.reset(); form.hidden = true;
      toast('New coordinator PIN saved.'); show('coordinator'); renderCoordinator(); return;
    }
    if (form.id === 'job-form') {
      event.preventDefault();
      const data = new FormData(form);
      const steps = $$('[data-job-step]').map(row => ({ icon: row.querySelector('[name="j-icon"]').value, title: row.querySelector('[name="j-title"]').value, text: row.querySelector('[name="j-text"]').value }));
      const result = store.saveCustomJob(state, { id: data.get('jobId') || undefined, name: data.get('name'), desc: data.get('desc'), icon: data.get('icon'), level: data.get('level'), needsVolunteer: data.get('needsVolunteer') === 'on', steps }, 'coordinator');
      if (!result.ok) return toast(result.reason);
      $('#job-steps').innerHTML = ''; reload(); renderCoordinator(); toast(`“${result.job.name}” saved. Unlock it for helpers below their names.`);
      return;
    }
    if (form.id === 'add-volunteer-form') {
      event.preventDefault();
      const result = store.addVolunteer(state, { name: new FormData(form).get('name') }, 'coordinator');
      if (!result.ok) return toast(result.reason);
      form.reset(); reload(); renderCoordinator(); toast(`${result.volunteer.name} was added.`); return;
    }
    if (form.id === 'help-note-form') {
      event.preventDefault();
      const result = store.noteAlert(state, form.dataset.noteFor, $('#help-note-text').value);
      if (!result.ok) return toast(result.reason);
      form.hidden = true; reload(); toast('Note saved for the coordinator.');
      return;
    }
    if (form.id === 'copy-form') {
      event.preventDefault();
      const words = new FormData(form).get('passphrase');
      if (String(words).length < 8) return toast('Use at least 8 letters.');
      const locked = await Link.lockWithPassphrase(JSON.parse(store.recoveryExport(state)), words);
      download(`helper-jobs-copy-${state.outing.date || 'outing'}.hjcopy`, JSON.stringify(locked), 'application/json');
      form.reset(); toast('Locked copy downloaded. Keep the words somewhere safe: without them, the copy can’t be opened.');
      return;
    }
    if (form.id === 'restore-form') {
      event.preventDefault();
      const data = new FormData(form); const file = data.get('file');
      try {
        const parsed = JSON.parse(await file.text());
        const payload = parsed.kind === 'helper-jobs-locked-copy' ? await Link.unlockWithPassphrase(parsed, data.get('passphrase')) : parsed;
        if (!payload || !payload.state || payload.state.schemaVersion !== 1) throw new Error('This is not a Helper Jobs copy.');
        if (!window.confirm(`Replace everything on this tablet with the copy from ${timeOf(payload.exportedAt || payload.savedAt) || 'that file'}?`)) return;
        store.recoveryImport({ state: payload.state, outbox: payload.outbox || [] });
        form.reset(); reload(); renderCoordinator(); toast('Restored from the copy.');
      } catch (error) { toast(error.message || 'That copy could not be opened.'); }
      return;
    }
    const kidForm = form.closest('[data-kid-form]');
    const helperForm = form.closest('[data-helper-form]');
    if (!kidForm && !helperForm) return;
    event.preventDefault();
    const data = new FormData(form);
    const on = name => data.get(name) === 'on';
    const result = kidForm
      ? store.updateKid(state, kidForm.dataset.kidForm, { firstName: data.get('firstName'), photo: data.get('photo'), safeTips: String(data.get('safeTips')).split(',').map(item => item.trim()).filter(Boolean), allergy: data.get('allergy'), parentConsent: on('parentConsent'), photoConsent: on('photoConsent') }, 'coordinator')
      : store.updateHelper(state, helperForm.dataset.helperForm, { name: data.get('name'), photo: data.get('photo'), language: data.get('language'), voiceEnabled: on('voiceEnabled'), slowVoice: on('slowVoice'), bigText: on('bigText'), contrast: on('contrast'), consent: on('consent'), photoConsent: on('photoConsent'), familyConsent: on('familyConsent') }, 'coordinator');
    if (!result.ok) return toast(result.reason);
    if (helperForm && !on('familyConsent') && familyChannels[helperForm.dataset.helperForm]?.link) familyChannels[helperForm.dataset.helperForm].stop(true);
    reload(); renderCoordinator(); toast('Coordinator record saved.');
  });
  $('#assignment-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = store.saveAssignment(state, { helperId: form.get('assignment-helper'), kidId: form.get('assignment-kid') || undefined, jobId: form.get('assignment-job'), nearbyVolunteerId: form.get('assignment-volunteer') || undefined, startTime: new Date().toISOString() });
    if (!result.ok) return toast(result.reason);
    reload(); toast('Safe assignment saved.'); show('lead-board'); renderLead();
  });
  $('#outing-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const outingResult = store.updateOuting(state, { place: form.get('place'), date: form.get('date'), leadVolunteer: form.get('leadVolunteer') }, 'lead');
    if (!outingResult.ok) return toast(outingResult.reason);
    for (const helper of state.helpers) store.setPresence(state, 'helper', helper.id, form.getAll('helper-present').includes(helper.id), 'lead');
    for (const kid of state.kids) store.setPresence(state, 'kid', kid.id, form.getAll('kid-present').includes(kid.id), 'lead');
    for (const vol of state.volunteers) store.setPresence(state, 'volunteer', vol.id, form.getAll('volunteer-present').includes(vol.id), 'lead');
    const plan = readScheduleEditor(); if (plan.length) store.setSchedule(state, plan, 'lead');
    swOuting(true);
    reload(); show('lead-board'); renderLead();
  });
  $('#coordinator-form').addEventListener('submit', event => { event.preventDefault(); submitCoordinatorPin(); });
  $('#pin-pad').innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'clear', 0, 'enter'].map(value => `<button type="button" data-pin="${value}" ${value === 'clear' ? 'aria-label="Delete last number"' : ''}>${value === 'clear' ? '⌫' : value === 'enter' ? 'Enter' : value}</button>`).join('');
  $('#pin-pad').addEventListener('click', event => {
    const value = event.target.closest('[data-pin]')?.dataset.pin;
    if (value === undefined) return;
    if (value === 'clear') pin = pin.slice(0, -1);
    else if (value === 'enter') { enterLeadPin(); return; }
    else if (pin.length < 4) pin += value;
    renderPin();
  });

  // Pictures for the fixed parts of the page.
  $$('[data-icon]').forEach(element => { element.innerHTML = icon(element.dataset.icon); });
  $$('[data-art]').forEach(element => { element.innerHTML = window.HelperJobsArt ? window.HelperJobsArt.draw(element.dataset.art) : ''; });
  $('.hj-read-icon').innerHTML = icon('volume');
  $('.done-mark').innerHTML = icon('star');
  $('.badge-star').innerHTML = icon('award');
  renderHelpers(); renderJobs(); renderLead();
  if (!MIRROR && ls.get('helper-jobs.takeover.v1')) $('#home .landing-hero-text').insertAdjacentHTML('afterbegin', `<div class="takeover-card" id="takeover-card"><h2>${icon('device-tablet')}This tablet is taking over</h2><ol><li>Tap “I’m the volunteer lead” and choose a lead PIN.</li><li>Open Coordinator tools and choose a coordinator PIN.</li><li>Restore from a copy: the newest locked copy from the coordinator’s laptop.</li></ol><button type="button" class="button button-secondary" data-action="takeover-done">Done</button></div>`);
  if (MIRROR) mirror.start();
  else {
    setupInstallCard();
    channels.phone.load(); channels.tablets.load(); channels.backup.load(); channels.wording.load();
    try { Object.keys(localStorage).map(key => /^helper-jobs\.family-link\.(.+)\.v1$/.exec(key)).filter(Boolean).forEach(match => channels.family(match[1]).load()); } catch (_) {}
    channels.showDots();
    // A heartbeat, so linked devices can tell the tablet is still on; and break reminders appear on time.
    setInterval(() => { channels.all().forEach(channel => { if (channel.link && channel !== channels.backup) channel.publish(); }); if (isActive('lead-board')) renderLead(); }, 30_000);
    setInterval(escalate, 15_000);
    window.addEventListener('online', () => channels.all().forEach(channel => channel.schedule(0)));
  }
  window.addEventListener('online', () => { toast('Back online.'); });
})();
