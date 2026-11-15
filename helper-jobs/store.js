(function (root) {
  // A helper tablet linked to the main tablet keeps its own copy under different names.
  let KEY = 'helper-jobs.state.v1';
  let OUTBOX = 'helper-jobs.outbox.v1';
  function useKeys(stateKey, outboxKey) { KEY = stateKey; OUTBOX = outboxKey; }
  const data = root.HelperJobsData || require('./data.js');
  const clone = value => JSON.parse(JSON.stringify(value));
  const now = () => new Date().toISOString();
  const id = prefix => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  function initialState() {
    return {
      schemaVersion: 1,
      outing: clone(data.fixtures.outing),
      helpers: clone(data.fixtures.helpers),
      kids: clone(data.fixtures.kids),
      volunteers: clone(data.fixtures.volunteers),
      assignments: [],
      helpAlerts: [],
      audit: [],
      wrapNotes: {},
      practice: [],
      appliedEvents: [],
      lastUpdated: now()
    };
  }

  function storage() { return root.localStorage; }
  function loadState() {
    if (!storage()) return initialState();
    try {
      const saved = JSON.parse(storage().getItem(KEY) || 'null');
      if (!saved || saved.schemaVersion !== 1) return initialState();
      // Older saved outings: add what newer versions expect.
      if (!saved.mirror && !Array.isArray(saved.outing.schedule)) { saved.outing.schedule = clone(data.fixtures.outing.schedule || []); saved.outing.scheduleNow = 0; }
      return saved;
    } catch (_) { return initialState(); }
  }
  function saveState(state) {
    state.lastUpdated = now();
    if (storage()) storage().setItem(KEY, JSON.stringify(state));
    return state;
  }
  function mutate(state, type, payload) {
    state.audit.push({ id: id('audit'), type, payload: clone(payload), at: now() });
    saveState(state);
    queueMutation({ id: id('mutation'), type, payload: clone(payload), at: now() });
    return state;
  }
  function readOutbox() {
    if (!storage()) return [];
    try { return JSON.parse(storage().getItem(OUTBOX) || '[]'); } catch (_) { return []; }
  }
  function queueMutation(mutation) {
    const outbox = readOutbox();
    if (!outbox.some(item => item.id === mutation.id)) outbox.push(mutation);
    if (storage()) storage().setItem(OUTBOX, JSON.stringify(outbox));
    return outbox;
  }
  function acknowledgeMutation(mutationId) {
    const remaining = readOutbox().filter(item => item.id !== mutationId);
    if (storage()) storage().setItem(OUTBOX, JSON.stringify(remaining));
    return remaining;
  }
  async function syncOutbox(send) {
    const pending = readOutbox();
    const result = { sent: [], pending: [], conflicts: [] };
    for (const mutation of pending) {
      try {
        const response = await send(mutation);
        if (response && Array.isArray(response.conflicts)) result.conflicts.push(...response.conflicts);
        if (response && response.accepted === false) { result.pending.push(mutation); continue; }
        acknowledgeMutation(mutation.id);
        result.sent.push(mutation.id);
      } catch (_) { result.pending.push(mutation); }
    }
    return result;
  }
  function acknowledgeAlert(state, alertId) {
    const alert = state.helpAlerts.find(item => item.id === alertId);
    if (alert) { alert.status = 'acknowledged'; alert.acknowledgedAt = now(); }
    return mutate(state, 'help_acknowledged', { alertId });
  }
  function createAlert(state, helperId, kind) {
    const existing = state.helpAlerts.find(item => item.helperId === helperId && item.kind === kind && item.status === 'open');
    if (existing) return state;
    const alert = { id: id('help'), outingId: state.outing.id, helperId, kind, status: 'open', createdAt: now() };
    state.helpAlerts.push(alert);
    return mutate(state, 'help_requested', alert);
  }
  function validateAssignment(state, assignment) {
    const helper = state.helpers.find(item => item.id === assignment.helperId);
    const kid = state.kids.find(item => item.id === assignment.kidId);
    const job = jobList(state).find(item => item.id === assignment.jobId);
    const volunteersHere = state.outing.presentVolunteers || [];
    const volunteer = state.volunteers.find(item => item.id === assignment.nearbyVolunteerId && item.nearby !== false && (!volunteersHere.length || volunteersHere.includes(item.id)));
    if (!helper || !job) return { ok: false, reason: 'Choose a real helper and job.' };
    if (job.needsVolunteer && !kid) return { ok: false, reason: 'A kid is required for this job.' };
    if (!helper.consent || (kid && !kid.consent)) return { ok: false, reason: 'Consent is required before assigning.' };
    if (kid && kid.parentConsent === false) return { ok: false, reason: 'A parent has not said yes yet. Ask the coordinator before this kid’s record is used.' };
    if (!helper.unlockedJobs.includes(job.id)) return { ok: false, reason: 'This job is not unlocked for this helper.' };
    if (job.needsVolunteer && !volunteer) return { ok: false, reason: 'A named nearby volunteer is required.' };
    return { ok: true };
  }
  function saveAssignment(state, assignment) {
    const result = validateAssignment(state, assignment);
    if (!result.ok) return result;
    const record = { id: id('assignment'), status: 'assigned', createdAt: now(), outingDate: state.outing.date || '', ...clone(assignment) };
    state.assignments.push(record);
    mutate(state, 'assignment_created', record);
    return { ok: true, assignment: record };
  }
  function setSnackPermission(state, kidId, allowed, actor) {
    if (actor !== 'coordinator') return { ok: false, reason: 'Only a coordinator can change snack permission.' };
    const kid = state.kids.find(item => item.id === kidId);
    if (!kid) return { ok: false, reason: 'Kid not found.' };
    kid.snackAllowed = Boolean(allowed);
    mutate(state, 'snack_permission_changed', { kidId, allowed: kid.snackAllowed });
    return { ok: true };
  }
  function unlockJob(state, helperId, jobId, actor) {
    if (actor !== 'coordinator') return { ok: false, reason: 'Only a coordinator can approve a job unlock.' };
    const helper = state.helpers.find(item => item.id === helperId);
    const job = jobList(state).find(item => item.id === jobId);
    if (!helper || !job) return { ok: false, reason: 'Helper or job not found.' };
    if (!helper.unlockedJobs.includes(job.id)) helper.unlockedJobs.push(job.id);
    helper.level = Math.max(helper.level, job.level);
    mutate(state, 'job_unlock_approved', { helperId, jobId });
    return { ok: true };
  }
  function reconcile(local, remote) {
    const merged = clone(local);
    const conflicts = [];
    if (!remote || remote.schemaVersion !== 1) return { merged, conflicts: ['Unsupported remote state'] };
    for (const remoteKid of remote.kids || []) {
      const localKid = merged.kids.find(kid => kid.id === remoteKid.id);
      if (!localKid) { merged.kids.push(clone(remoteKid)); continue; }
      if (localKid.snackAllowed !== remoteKid.snackAllowed || localKid.consent !== remoteKid.consent) conflicts.push(`kid:${remoteKid.id}`);
      else Object.assign(localKid, clone(remoteKid));
    }
    merged.assignments = [...merged.assignments, ...(remote.assignments || []).filter(item => !merged.assignments.some(localItem => localItem.id === item.id))];
    merged.helpAlerts = [...merged.helpAlerts, ...(remote.helpAlerts || []).filter(item => !merged.helpAlerts.some(localItem => localItem.id === item.id))];
    return { merged, conflicts };
  }
  function updateHelper(state, helperId, patch, actor) {
    if (actor !== 'coordinator') return { ok: false, reason: 'Only a coordinator can edit helpers.' };
    const helper = state.helpers.find(item => item.id === helperId);
    if (!helper) return { ok: false, reason: 'Helper not found.' };
    if (patch.name !== undefined) helper.name = String(patch.name).trim();
    if (patch.photo !== undefined) helper.photo = String(patch.photo).trim();
    if (patch.voiceEnabled !== undefined) helper.voiceEnabled = Boolean(patch.voiceEnabled);
    if (patch.language !== undefined) helper.language = ['en', 'hi', 'es'].includes(patch.language) ? patch.language : 'en';
    recordYes(helper, patch);
    if (patch.consent !== undefined) helper.consent = Boolean(patch.consent);
    for (const flag of ['photoConsent', 'familyConsent', 'bigText', 'contrast', 'slowVoice']) if (patch[flag] !== undefined) helper[flag] = Boolean(patch[flag]);
    if (helper.photoConsent === false || helper.consent === false) { delete helper.photoData; delete helper.photoAt; }
    mutate(state, 'helper_updated', { helperId, fields: Object.keys(patch) });
    return { ok: true };
  }
  function updateKid(state, kidId, patch, actor) {
    if (actor !== 'coordinator') return { ok: false, reason: 'Only a coordinator can edit kids.' };
    const kid = state.kids.find(item => item.id === kidId);
    if (!kid) return { ok: false, reason: 'Kid not found.' };
    if (patch.firstName !== undefined) kid.firstName = String(patch.firstName).trim();
    if (patch.photo !== undefined) kid.photo = String(patch.photo).trim();
    if (patch.safeTips !== undefined) kid.safeTips = patch.safeTips.slice(0, 3).map(String);
    recordYes(kid, patch);
    if (patch.parentConsent !== undefined) kid.parentConsent = Boolean(patch.parentConsent);
    if (patch.consent !== undefined) kid.consent = Boolean(patch.consent);
    if (patch.allergy !== undefined) kid.allergy = String(patch.allergy);
    if (patch.photoConsent !== undefined) kid.photoConsent = Boolean(patch.photoConsent);
    // Taking back a yes removes the photo straight away.
    if (kid.photoConsent === false || kid.parentConsent === false) { delete kid.photoData; delete kid.photoAt; }
    mutate(state, 'kid_updated', { kidId, fields: Object.keys(patch) });
    return { ok: true };
  }
  function setRetention(state, retention, actor) {
    if (actor !== 'coordinator') return { ok: false, reason: 'Only a coordinator can set retention.' };
    state.outing.retention = retention;
    mutate(state, 'retention_policy_set', { retention });
    return { ok: true };
  }
  function updateOuting(state, patch, actor) {
    if (actor !== 'lead') return { ok: false, reason: 'Only the volunteer lead can set up an outing.' };
    if (patch.place !== undefined) state.outing.place = String(patch.place).trim();
    if (patch.date !== undefined) state.outing.date = String(patch.date);
    if (patch.leadVolunteer !== undefined) state.outing.leadVolunteer = String(patch.leadVolunteer).trim();
    mutate(state, 'outing_updated', { fields: Object.keys(patch) });
    return { ok: true };
  }
  function setPresence(state, kind, recordId, present, actor) {
    if (actor !== 'lead') return { ok: false, reason: 'Only the volunteer lead can mark attendance.' };
    const key = kind === 'helper' ? 'presentHelpers' : kind === 'kid' ? 'presentKids' : kind === 'volunteer' ? 'presentVolunteers' : null;
    if (!key || !(state[`${kind}s`] || []).some(item => item.id === recordId)) return { ok: false, reason: 'Record not found.' };
    const ids = new Set(state.outing[key] || []);
    present ? ids.add(recordId) : ids.delete(recordId);
    state.outing[key] = [...ids];
    mutate(state, 'presence_updated', { kind, recordId, present: Boolean(present) });
    return { ok: true };
  }
  function historyForHelper(state, helperId) {
    return state.assignments.filter(item => item.helperId === helperId).map(item => ({ id: item.id, jobId: item.jobId, kidId: item.kidId, status: item.status, smiley: item.smiley, note: item.leadNote, createdAt: item.createdAt }));
  }
  function badgesForHelper(state, helperId) {
    const completed = state.assignments.filter(item => item.helperId === helperId && item.status === 'complete');
    const definitions = [
      { id: 'snack-star', name: 'Snack Star', jobId: 'snack', threshold: 5 },
      { id: 'great-buddy', name: 'Great Buddy', jobId: 'buddy', threshold: 5 },
      { id: 'super-talker', name: 'Super Talker', jobId: 'talk', threshold: 5 },
      { id: 'line-leader', name: 'Line Leader', jobId: 'walk', threshold: 5 }
    ];
    return definitions.filter(definition => completed.filter(item => item.jobId === definition.jobId).length >= definition.threshold);
  }
  function helperView(state, helperId) {
    const helper = state.helpers.find(item => item.id === helperId);
    if (!helper) return null;
    return { id: helper.id, name: helper.name, photo: helper.photo, level: helper.level, stars: helper.stars, unlockedJobs: helper.unlockedJobs };
  }



  // Jobs: the six built in, plus jobs the coordinator makes for new places (a zoo, a library).
  const JOB_ICONS = ['apple', 'walk', 'basket', 'puzzle', 'message-circle', 'heart-handshake', 'flag', 'map-pin', 'users', 'star', 'bubble', 'trash', 'backpack', 'checklist', 'cards', 'eye', 'droplet', 'hand-sanitizer', 'traffic-lights', 'ear', 'mood-happy', 'thumb-up', 'speakerphone', 'sun', 'coffee', 'photo', 'home', 'help-circle'];
  function jobList(state) { return [...data.jobs, ...((state && state.customJobs) || [])]; }
  function saveCustomJob(state, input, actor) {
    if (actor !== 'coordinator') return { ok: false, reason: 'Only a coordinator can make jobs.' };
    const text = (value, max) => String(value ?? '').trim().slice(0, max);
    const name = text(input.name, 40);
    if (!name) return { ok: false, reason: 'Give the job a name.' };
    const steps = (input.steps || []).map(step => [JOB_ICONS.includes(step.icon) ? step.icon : 'star', text(step.title, 50), text(step.text, 120)]).filter(step => step[1]).slice(0, 8);
    if (steps.length < 2) return { ok: false, reason: 'A job needs at least two steps.' };
    if (!/tap done|you did it/i.test(steps.at(-1)[1])) steps.push(['star', 'Tap Done', 'Tell the volunteer you finished.']);
    state.customJobs = state.customJobs || [];
    const existing = input.id && state.customJobs.find(job => job.id === input.id);
    const job = { id: existing ? existing.id : id('job'), custom: true, name, icon: JOB_ICONS.includes(input.icon) ? input.icon : 'star', level: Math.min(3, Math.max(1, Number(input.level) || 1)), desc: text(input.desc, 80) || 'A job made for this group.', needsVolunteer: Boolean(input.needsVolunteer), steps };
    if (existing) Object.assign(existing, job); else state.customJobs.push(job);
    mutate(state, existing ? 'job_changed' : 'job_made', { jobId: job.id });
    return { ok: true, job };
  }
  function removeCustomJob(state, jobId, actor) {
    if (actor !== 'coordinator') return { ok: false, reason: 'Only a coordinator can remove jobs.' };
    if (state.assignments.some(item => item.jobId === jobId && item.status === 'assigned')) return { ok: false, reason: 'Someone is doing this job now. End it first.' };
    const before = (state.customJobs || []).length;
    state.customJobs = (state.customJobs || []).filter(job => job.id !== jobId);
    if (state.customJobs.length === before) return { ok: false, reason: 'Only jobs you made can be removed.' };
    state.helpers.forEach(helper => { helper.unlockedJobs = helper.unlockedJobs.filter(item => item !== jobId); });
    if (state.stepPhotos) delete state.stepPhotos[jobId];
    mutate(state, 'job_removed', { jobId });
    return { ok: true };
  }
  // Progress across Sundays, and a gentle "might be ready" hint. The coordinator always decides.
  function progressFor(state, helperId) {
    const helper = state.helpers.find(item => item.id === helperId);
    if (!helper) return null;
    const day = item => item.outingDate || String(item.createdAt || '').slice(0, 10);
    const done = state.assignments.filter(item => item.helperId === helperId && item.status === 'complete');
    const sundays = [...new Set(done.map(day))].filter(Boolean).sort();
    const perSunday = sundays.slice(-6).map(date => ({ date, jobs: done.filter(item => day(item) === date).length }));
    const atLevel = done.filter(item => (jobList(state).find(job => job.id === item.jobId) || {}).level === helper.level);
    const hard = done.filter(item => item.smiley === 'hard').length;
    const practice = practiceFor(state, helperId);
    const help = state.helpAlerts.filter(item => item.helperId === helperId && item.kind !== 'break').length;
    const next = jobList(state).filter(job => job.level === helper.level + 1 && !helper.unlockedJobs.includes(job.id));
    const ready = next.map(job => {
      const missing = [];
      if (atLevel.length < 5) missing.push(`${5 - atLevel.length} more level ${helper.level} jobs`);
      if (new Set(atLevel.map(day)).size < 2) missing.push('a second Sunday');
      if (!practice[job.id]) missing.push('a practice run');
      if (done.length && hard / done.length > 1 / 3) missing.push('more jobs that feel okay');
      return { jobId: job.id, name: job.name, mightBeReady: missing.length === 0, missing };
    });
    return { helperId, name: helper.name, level: helper.level, stars: helper.stars, total: done.length, sundays: sundays.length, perSunday, help, practice, ready, wishes: helper.wishes || [] };
  }
  // Every yes is recorded with its date, so it can be reviewed once a year.
  const YES_FIELDS = ['consent', 'parentConsent', 'photoConsent', 'familyConsent'];
  function recordYes(record, patch) {
    record.yesDates = record.yesDates || {};
    for (const field of YES_FIELDS) {
      if (patch[field] === undefined) continue;
      if (patch[field] && !record.yesDates[field]) record.yesDates[field] = now();
      if (!patch[field]) delete record.yesDates[field];
    }
  }
  function yesReviewDue(record, nowMs = Date.now()) {
    return Object.entries(record.yesDates || {}).filter(([, at]) => nowMs - Date.parse(at) > 365 * 86400000).map(([field]) => field);
  }
  // A family asks what we hold: one person's own record and history. Other people appear only as "a kid" or "a helper".
  function exportPerson(state, kind, recordId) {
    const record = (kind === 'helper' ? state.helpers : state.kids).find(item => item.id === recordId);
    if (!record) return null;
    const own = { ...record }; delete own.photoData;
    const history = state.assignments.filter(item => (kind === 'helper' ? item.helperId : item.kidId) === recordId).map(item => ({ job: (jobList(state).find(job => job.id === item.jobId) || {}).name || item.jobId, status: item.status, date: item.outingDate || String(item.createdAt).slice(0, 10), smiley: kind === 'helper' ? item.smiley || null : undefined, with: kind === 'helper' ? (item.kidId ? 'a kid' : null) : 'a helper' }));
    return { kind: 'helper-jobs-person', exportedAt: now(), person: own, hasPhoto: Boolean(record.photoData), history, helpAlerts: kind === 'helper' ? state.helpAlerts.filter(item => item.helperId === recordId).map(item => ({ kind: item.kind, at: item.createdAt, note: item.note || '' })) : [] };
  }

  // Fixing a match on the day: end it, or change the volunteer nearby.
  function endAssignment(state, assignmentId, actor) {
    if (actor !== 'lead') return { ok: false, reason: 'Only the volunteer lead can end a match.' };
    const assignment = state.assignments.find(item => item.id === assignmentId && item.status === 'assigned');
    if (!assignment) return { ok: false, reason: 'That match has already ended.' };
    assignment.status = 'ended'; assignment.endTime = now();
    mutate(state, 'assignment_ended', { assignmentId });
    return { ok: true };
  }
  function changeVolunteer(state, assignmentId, volunteerId, actor) {
    if (actor !== 'lead') return { ok: false, reason: 'Only the volunteer lead can change a match.' };
    const assignment = state.assignments.find(item => item.id === assignmentId && item.status === 'assigned');
    if (!assignment) return { ok: false, reason: 'That match has already ended.' };
    const check = validateAssignment(state, { ...assignment, nearbyVolunteerId: volunteerId });
    if (!check.ok) return check;
    assignment.nearbyVolunteerId = volunteerId;
    mutate(state, 'assignment_volunteer_changed', { assignmentId, volunteerId });
    return { ok: true };
  }
  // Volunteers: the adults who stand near a helper with a kid. First names only.
  function addVolunteer(state, input, actor) {
    if (actor !== 'coordinator') return { ok: false, reason: 'Only a coordinator can add volunteers.' };
    const name = cleanName(input.name);
    if (!name) return { ok: false, reason: 'Type a first name.' };
    const volunteer = { id: id('vol'), name, nearby: true };
    state.volunteers.push(volunteer);
    mutate(state, 'volunteer_added', { volunteerId: volunteer.id });
    return { ok: true, volunteer };
  }
  function removeVolunteer(state, volunteerId, actor) {
    if (actor !== 'coordinator') return { ok: false, reason: 'Only a coordinator can remove volunteers.' };
    if (state.assignments.some(item => item.nearbyVolunteerId === volunteerId && item.status === 'assigned')) return { ok: false, reason: 'This volunteer is in a match now. End the match first.' };
    const before = state.volunteers.length;
    state.volunteers = state.volunteers.filter(item => item.id !== volunteerId);
    if (state.volunteers.length === before) return { ok: false, reason: 'Volunteer not found.' };
    state.outing.presentVolunteers = (state.outing.presentVolunteers || []).filter(item => item !== volunteerId);
    mutate(state, 'volunteer_removed', { volunteerId });
    return { ok: true };
  }

  // People the coordinator adds or removes. New people start with no consent and no snack, so nothing
  // happens until the coordinator records a yes.
  const cleanName = value => String(value ?? '').trim().slice(0, 40);
  const letterFor = (photo, name) => (String(photo || '').trim() || name.charAt(0)).slice(0, 2).toUpperCase();
  function addHelper(state, input, actor) {
    if (actor !== 'coordinator') return { ok: false, reason: 'Only a coordinator can add helpers.' };
    const name = cleanName(input.name);
    if (!name) return { ok: false, reason: 'Type a first name.' };
    const helper = { id: id('helper'), yesDates: input.consent ? { consent: now() } : {}, name, photo: letterFor(input.photo, name), level: 1, consent: Boolean(input.consent), familyConsent: false, voiceEnabled: true, language: ['en', 'hi', 'es'].includes(input.language) ? input.language : 'en', unlockedJobs: ['snack', 'walk', 'cleanup'], stars: 0 };
    state.helpers.push(helper);
    mutate(state, 'helper_added', { helperId: helper.id });
    return { ok: true, helper };
  }
  function addKid(state, input, actor) {
    if (actor !== 'coordinator') return { ok: false, reason: 'Only a coordinator can add kids.' };
    const firstName = cleanName(input.firstName);
    if (!firstName) return { ok: false, reason: 'Type a first name.' };
    const parentConsent = Boolean(input.parentConsent);
    const kid = { id: id('kid'), yesDates: parentConsent ? { parentConsent: now() } : {}, firstName, photo: letterFor(input.photo, firstName), safeTips: (input.safeTips || []).slice(0, 3).map(String), allergy: String(input.allergy || 'none'), snackAllowed: false, snackAllowList: ['water'], snackDenyList: [], parentConsent, consent: parentConsent };
    state.kids.push(kid);
    mutate(state, 'kid_added', { kidId: kid.id });
    return { ok: true, kid };
  }
  // Removing someone also removes their history and photo from this tablet.
  function removePerson(state, kind, recordId, actor) {
    if (actor !== 'coordinator') return { ok: false, reason: 'Only a coordinator can remove people.' };
    const list = kind === 'helper' ? state.helpers : kind === 'kid' ? state.kids : null;
    if (!list || !list.some(item => item.id === recordId)) return { ok: false, reason: 'Record not found.' };
    if (kind === 'helper') {
      state.helpers = state.helpers.filter(item => item.id !== recordId);
      state.assignments = state.assignments.filter(item => item.helperId !== recordId);
      state.helpAlerts = state.helpAlerts.filter(item => item.helperId !== recordId);
      state.practice = (state.practice || []).filter(item => item.helperId !== recordId);
      delete state.wrapNotes[recordId];
      state.outing.presentHelpers = (state.outing.presentHelpers || []).filter(item => item !== recordId);
    } else {
      state.kids = state.kids.filter(item => item.id !== recordId);
      state.assignments.forEach(item => { if (item.kidId === recordId) { delete item.kidId; if (item.status === 'assigned') item.status = 'cancelled'; } });
      state.outing.presentKids = (state.outing.presentKids || []).filter(item => item !== recordId);
      if (state.outing.headcount) delete state.outing.headcount[recordId];
    }
    mutate(state, `${kind}_removed`, { recordId });
    return { ok: true };
  }
  // A real photo only with a yes on record: the helper's own, or a parent's for a kid. Small, and kept on this tablet.
  const PHOTO = /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/;
  function setPhoto(state, kind, recordId, dataUrl, actor) {
    if (actor !== 'coordinator') return { ok: false, reason: 'Only a coordinator can add photos.' };
    const record = (kind === 'helper' ? state.helpers : state.kids).find(item => item.id === recordId);
    if (!record) return { ok: false, reason: 'Record not found.' };
    if (dataUrl === null) { delete record.photoData; delete record.photoAt; mutate(state, 'photo_removed', { kind, recordId }); return { ok: true }; }
    const yes = kind === 'helper' ? record.consent && record.photoConsent : record.parentConsent && record.photoConsent;
    if (!yes) return { ok: false, reason: kind === 'helper' ? 'Tick “Yes to a photo” for this helper first.' : 'Tick “Parent said yes to a photo” first.' };
    if (!PHOTO.test(String(dataUrl)) || String(dataUrl).length > 60000) return { ok: false, reason: 'That photo could not be used. Try another.' };
    record.photoData = dataUrl; record.photoAt = now();
    mutate(state, 'photo_added', { kind, recordId });
    return { ok: true };
  }
  // Head count: every kid here today is marked back with a volunteer, or gone home with family.
  function setReturn(state, kidId, status, actor) {
    if (actor !== 'lead') return { ok: false, reason: 'Only the volunteer lead can do the head count.' };
    if (!state.kids.some(item => item.id === kidId)) return { ok: false, reason: 'Kid not found.' };
    state.outing.headcount = state.outing.headcount || {};
    if (status === 'back' || status === 'family') state.outing.headcount[kidId] = { status, at: now() };
    else delete state.outing.headcount[kidId];
    mutate(state, 'headcount_marked', { kidId, status: status || 'unmarked' });
    return { ok: true };
  }
  function headcount(state) {
    const ids = state.outing.presentKids || [];
    const kids = (ids.length ? state.kids.filter(item => ids.includes(item.id)) : state.kids);
    const marks = state.outing.headcount || {};
    const missing = kids.filter(item => !marks[item.id]);
    return { kids, marks, missing, done: missing.length === 0 };
  }
  // What happened, after the lead answered Help. Only the coordinator sees these notes.
  function noteAlert(state, alertId, note) {
    const alert = state.helpAlerts.find(item => item.id === alertId);
    if (!alert) return { ok: false, reason: 'That Help is no longer on this tablet.' };
    const text = String(note || '').trim().slice(0, 280);
    if (!text) return { ok: false, reason: 'Type a short note, or skip.' };
    alert.note = text; alert.notedAt = now();
    mutate(state, 'help_note_added', { alertId });
    return { ok: true };
  }
  // Break reminder: a helper on the same job for 20 minutes gets offered a break.
  const BREAK_MS = 20 * 60000;
  function needsBreak(assignment, nowMs = Date.now()) {
    if (!assignment || assignment.status !== 'assigned' || !assignment.startedAt) return false;
    if (assignment.breakOfferedAt) return false;
    return nowMs - Date.parse(assignment.startedAt) >= BREAK_MS;
  }
  function startJob(state, assignmentId) {
    const assignment = state.assignments.find(item => item.id === assignmentId);
    if (!assignment || assignment.startedAt) return state;
    assignment.startedAt = now();
    return mutate(state, 'job_started', { assignmentId });
  }
  function offerBreak(state, assignmentId) {
    const assignment = state.assignments.find(item => item.id === assignmentId);
    if (!assignment) return { ok: false };
    assignment.breakOfferedAt = now();
    mutate(state, 'break_offered', { assignmentId });
    return { ok: true };
  }
  // Practice runs: next-level jobs with no kid, just to learn the steps. The coordinator sees them.
  function practiceJobs(helper, state) {
    if (!helper) return [];
    return (state ? jobList(state) : data.jobs).filter(job => !helper.unlockedJobs.includes(job.id) && job.level === helper.level + 1).map(job => job.id);
  }
  function recordPractice(state, helperId, jobId) {
    const helper = state.helpers.find(item => item.id === helperId);
    if (!helper || !practiceJobs(helper, state).includes(jobId)) return { ok: false, reason: 'No practice run for this job yet.' };
    state.practice = state.practice || [];
    state.practice.push({ id: id('practice'), helperId, jobId, at: now() });
    mutate(state, 'practice_done', { helperId, jobId });
    return { ok: true };
  }
  function practiceFor(state, helperId) {
    const counts = {};
    for (const item of state.practice || []) if (item.helperId === helperId) counts[item.jobId] = (counts[item.jobId] || 0) + 1;
    return counts;
  }
  // Finish a job and give its one star. Safe to call twice with the same event (a retry from a helper tablet).
  function finishJob(state, input) {
    state.appliedEvents = state.appliedEvents || [];
    if (input.eventId && state.appliedEvents.includes(input.eventId)) return { ok: true, duplicate: true };
    const helper = state.helpers.find(item => item.id === input.helperId);
    if (!helper) return { ok: false, reason: 'Helper not found.' };
    const assignment = input.assignmentId && state.assignments.find(item => item.id === input.assignmentId);
    if (assignment && assignment.status === 'assigned') { assignment.status = 'complete'; assignment.endTime = now(); }
    if (assignment && input.smiley) assignment.smiley = input.smiley;
    let star = false;
    if (input.star && !(assignment && assignment.starred)) { helper.stars += 1; star = true; if (assignment) assignment.starred = true; }
    if (input.eventId) { state.appliedEvents.push(input.eventId); if (state.appliedEvents.length > 300) state.appliedEvents.splice(0, state.appliedEvents.length - 300); }
    mutate(state, 'job_finished', { helperId: helper.id, assignmentId: assignment ? assignment.id : null, smiley: input.smiley || null });
    return { ok: true, star };
  }
  // Certificates: one per badge, plus a thank-you for every helper who finished a job.
  function certificatesFor(state, helperId) {
    const helper = state.helpers.find(item => item.id === helperId);
    if (!helper) return [];
    const done = state.assignments.filter(item => item.helperId === helperId && item.status === 'complete').length;
    const list = badgesForHelper(state, helperId).map(badge => ({ id: badge.id, title: badge.name, count: badge.threshold, job: data.jobs.find(job => job.id === badge.jobId).name, line: `for finishing ${badge.threshold} ${data.jobs.find(job => job.id === badge.jobId).name} jobs` }));
    if (done || helper.stars) list.unshift({ id: 'thank-you', title: 'Thank You', count: helper.stars, line: `for ${helper.stars} star${helper.stars === 1 ? '' : 's'} of helping at Pragnya outings` });
    return list;
  }
  // What a family sees: their own helper only. No kids, no other helpers, no notes about Help.
  function familyView(state, helperId) {
    const helper = state.helpers.find(item => item.id === helperId);
    if (!helper || !helper.consent || !helper.familyConsent) return null;
    const done = state.assignments.filter(item => item.helperId === helperId && item.status === 'complete');
    const jobs = {};
    for (const item of done) { const job = jobList(state).find(entry => entry.id === item.jobId); if (job) jobs[job.name] = (jobs[job.name] || 0) + 1; }
    return {
      name: helper.name, lang: helper.language || 'en', photo: helper.photo, photoData: helper.photoConsent && helper.photoData ? helper.photoData : null,
      level: helper.level, stars: helper.stars, jobs, badges: badgesForHelper(state, helperId).map(badge => badge.name),
      certificates: certificatesFor(state, helperId), note: state.wrapNotes[helperId] || '', place: state.outing.place, date: state.outing.date, updatedAt: now()
    };
  }


  // The day plan: a few picture steps with times, and which one is happening now.
  function setSchedule(state, items, actor) {
    if (actor !== 'lead') return { ok: false, reason: 'Only the volunteer lead can change the day plan.' };
    const icons = data.scheduleIcons || [];
    const clean = (items || []).slice(0, 8).map((item, i) => ({ id: String(item.id || `step-${i}`).slice(0, 40), icon: icons.includes(item.icon) ? item.icon : 'star', label: String(item.label || '').trim().slice(0, 40), time: /^\d{1,2}:\d{2}$/.test(String(item.time || '')) ? String(item.time) : '' })).filter(item => item.label);
    if (!clean.length) return { ok: false, reason: 'Add at least one part of the day.' };
    state.outing.schedule = clean;
    state.outing.scheduleNow = Math.min(state.outing.scheduleNow || 0, clean.length - 1);
    mutate(state, 'schedule_set', { parts: clean.length });
    return { ok: true };
  }
  function moveSchedule(state, delta, actor) {
    if (actor !== 'lead') return { ok: false, reason: 'Only the volunteer lead can move the day plan.' };
    const list = state.outing.schedule || [];
    if (!list.length) return { ok: false, reason: 'There is no day plan.' };
    const next = Math.max(0, Math.min(list.length - 1, (state.outing.scheduleNow || 0) + delta));
    state.outing.scheduleNow = next;
    mutate(state, 'schedule_moved', { now: next });
    return { ok: true, now: next };
  }
  function scheduleNowNext(state) {
    const list = state.outing.schedule || [];
    const at = Math.min(state.outing.scheduleNow || 0, Math.max(0, list.length - 1));
    return { list, at, now: list[at] || null, next: list[at + 1] || null };
  }
  // A helper's own wish: "next time I'd like to try ...". The coordinator sees it; nothing changes by itself.
  function addWish(state, helperId, jobId) {
    const helper = state.helpers.find(item => item.id === helperId);
    if (!helper || !jobList(state).some(job => job.id === jobId)) return { ok: false };
    helper.wishes = [{ jobId, at: now() }, ...(helper.wishes || []).filter(item => item.jobId !== jobId)].slice(0, 3);
    mutate(state, 'wish_added', { helperId, jobId });
    return { ok: true };
  }
  function markTriedHelp(state, helperId) {
    const helper = state.helpers.find(item => item.id === helperId);
    if (!helper || helper.triedHelp) return { ok: false };
    helper.triedHelp = now();
    mutate(state, 'help_practised', { helperId });
    return { ok: true };
  }
  // Pictures of things and places for a job's steps (never people). Kept small, on the main tablet.
  function setStepPhoto(state, jobId, stepIndex, dataUrl, actor) {
    if (actor !== 'coordinator') return { ok: false, reason: 'Only a coordinator can add step pictures.' };
    const job = jobList(state).find(item => item.id === jobId);
    if (!job || !(stepIndex >= 0 && stepIndex < job.steps.length)) return { ok: false, reason: 'Step not found.' };
    state.stepPhotos = state.stepPhotos || {};
    state.stepPhotos[jobId] = state.stepPhotos[jobId] || {};
    if (dataUrl === null) { delete state.stepPhotos[jobId][stepIndex]; mutate(state, 'step_photo_removed', { jobId, stepIndex }); return { ok: true }; }
    if (!PHOTO.test(String(dataUrl)) || String(dataUrl).length > 140000) return { ok: false, reason: 'That picture could not be used. Try another.' };
    state.stepPhotos[jobId][stepIndex] = dataUrl;
    mutate(state, 'step_photo_added', { jobId, stepIndex });
    return { ok: true };
  }

  // Feedback after an outing: how it went, in a few words. No names, no kid details.
  const MOODS = ['happy', 'okay', 'hard'];
  const ROLES = ['lead', 'volunteer', 'coordinator', 'family'];
  function addFeedback(state, input) {
    const role = ROLES.includes(input.role) ? input.role : null;
    if (!role) return { ok: false, reason: 'Choose who is giving feedback.' };
    const text = value => String(value ?? '').trim().slice(0, 400);
    const entry = { id: id('feedback'), role, day: MOODS.includes(input.day) ? input.day : null, tool: MOODS.includes(input.tool) ? input.tool : null, easier: text(input.easier), harder: text(input.harder), change: text(input.change), outingDate: state.outing.date || '', at: now() };
    if (!entry.day && !entry.tool && !entry.easier && !entry.harder && !entry.change) return { ok: false, reason: 'Pick a face or write a few words first.' };
    state.feedback = state.feedback || [];
    state.feedback.push(entry);
    mutate(state, 'feedback_added', { role, outingDate: entry.outingDate });
    return { ok: true, entry };
  }
  function feedbackCsv(state) {
    const cell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [['Outing date', 'Who', 'The day', 'The app', 'Made it easier', 'Made it harder', 'One thing to change', 'Saved at']];
    for (const item of state.feedback || []) rows.push([item.outingDate, item.role, item.day, item.tool, item.easier, item.harder, item.change, item.at]);
    return rows.map(row => row.map(cell).join(',')).join('\n') + '\n';
  }
  // Clears old Help alerts, notes and history from this tablet, after the days the coordinator set.
  function applyRetention(state, nowMs = Date.now()) {
    const photoDays = state.outing.retention?.deletePhotosAfterDays;
    let photos = 0;
    if (photoDays) {
      const photoCutoff = nowMs - photoDays * 86400000;
      for (const record of [...state.helpers, ...state.kids]) if (record.photoData && Date.parse(record.photoAt || 0) < photoCutoff) { delete record.photoData; delete record.photoAt; photos += 1; }
      if (photos) saveState(state);
    }
    const days = state.outing.retention?.keepOperationalNotesAfterDays;
    if (!days) return photos;
    const cutoff = nowMs - days * 86400000;
    const old = item => Date.parse(item.at || item.createdAt || 0) < cutoff;
    const before = state.helpAlerts.length + state.audit.length;
    state.helpAlerts = state.helpAlerts.filter(item => item.status === 'open' || !old(item));
    state.audit = state.audit.filter(item => !old(item));
    if (state.wrapNotesAt && Date.parse(state.wrapNotesAt) < cutoff) { state.wrapNotes = {}; delete state.wrapNotesAt; }
    const removed = before - state.helpAlerts.length - state.audit.length;
    if (removed) saveState(state);
    return removed + photos;
  }
  // The minimum record for the coordinator to keep: per helper, no kid names, tips or allergies.
  function outingSummary(state, jobList) {
    const cell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [['Helper', 'Level', 'Stars', ...jobList.map(job => `${job.name} done`), 'Happy', 'Okay', 'Hard', 'Practice runs', 'Badges', 'Lead note']];
    for (const helper of state.helpers) {
      const done = state.assignments.filter(item => item.helperId === helper.id && item.status === 'complete');
      const smiles = kind => state.assignments.filter(item => item.helperId === helper.id && item.smiley === kind).length;
      rows.push([helper.name, helper.level, helper.stars, ...jobList.map(job => done.filter(item => item.jobId === job.id).length), smiles('happy'), smiles('okay'), smiles('hard'), (state.practice || []).filter(item => item.helperId === helper.id).length, badgesForHelper(state, helper.id).map(badge => badge.name).join('; '), state.wrapNotes[helper.id] || '']);
    }
    return rows.map(row => row.map(cell).join(',')).join('\n') + '\n';
  }
  function recoveryExport(state) { return JSON.stringify({ exportedAt: now(), state: clone(state), outbox: readOutbox() }, null, 2); }
  function recoveryImport(serialized) {
    const parsed = typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
    if (!parsed || !parsed.state || parsed.state.schemaVersion !== 1) throw new Error('Unsupported recovery file');
    saveState(parsed.state);
    if (storage() && Array.isArray(parsed.outbox)) storage().setItem(OUTBOX, JSON.stringify(parsed.outbox));
    return parsed.state;
  }
  const api = { JOB_ICONS, jobList, saveCustomJob, removeCustomJob, progressFor, yesReviewDue, exportPerson, setSchedule, moveSchedule, scheduleNowNext, addWish, markTriedHelp, setStepPhoto, endAssignment, changeVolunteer, addVolunteer, removeVolunteer, addFeedback, feedbackCsv, useKeys, addHelper, addKid, removePerson, setPhoto, setReturn, headcount, noteAlert, needsBreak, startJob, offerBreak, practiceJobs, recordPractice, practiceFor, finishJob, certificatesFor, familyView, BREAK_MS, applyRetention, outingSummary, initialState, loadState, saveState, mutate, readOutbox, queueMutation, acknowledgeMutation, syncOutbox, acknowledgeAlert, createAlert, validateAssignment, saveAssignment, setSnackPermission, unlockJob, reconcile, updateHelper, updateKid, setRetention, updateOuting, setPresence, historyForHelper, badgesForHelper, helperView, recoveryExport, recoveryImport };
  root.HelperJobsStore = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
