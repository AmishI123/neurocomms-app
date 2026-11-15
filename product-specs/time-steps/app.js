(() => {
  'use strict';
  const KEY = 'show-me-time-steps.v1';
  const fields = ['appointment','label','preparation','travel','spare','display'];
  const el = id => document.querySelector(`#${id}`);
  const state = { result: null };
  const read = () => Object.fromEntries(fields.map(id => [id, el(id).value]));
  const write = data => fields.forEach(id => { if (data[id] !== undefined) el(id).value = data[id]; });
  const validSaved = data => data && typeof data === 'object' && !Array.isArray(data) && fields.every(id => typeof data[id] === 'string') && (data.display === '12' || data.display === '24') && (!data.appointment || !Number.isNaN(new Date(data.appointment).getTime())) && ['preparation','travel'].every(id => /^\d+$/.test(data[id]) && Number(data[id]) <= 1440) && (!data.spare || (/^\d+$/.test(data.spare) && Number(data.spare) <= 1440));
  const minutes = (id, required = true) => { const raw = el(id).value.trim(); if (!raw && !required) return 0; if (!/^\d+$/.test(raw)) throw new Error(`${el(id).previousElementSibling.textContent} must be a whole number of minutes.`); const value = Number(raw); if (value < 0 || value > 1440) throw new Error(`${el(id).previousElementSibling.textContent} must be between 0 and 1440 minutes.`); return value; };
  const format = date => date.toLocaleString(undefined, {weekday:'short', month:'short', day:'numeric', year:'numeric', hour:'numeric', minute:'2-digit', hour12:el('display').value === '12'});
  function calculate() {
    const rawDate = el('appointment').value;
    if (!rawDate) throw new Error('Choose an appointment date and time.');
    const appointment = new Date(rawDate);
    if (Number.isNaN(appointment.getTime())) throw new Error('Choose a valid appointment date and time.');
    const preparation = minutes('preparation'); const travel = minutes('travel'); const spare = minutes('spare', false);
    const leave = new Date(appointment.getTime() - (travel + spare) * 60000);
    const start = new Date(leave.getTime() - preparation * 60000);
    if ([appointment, leave, start].some(date => date.getTimezoneOffset() !== appointment.getTimezoneOffset())) throw new Error('This version cannot safely calculate across a daylight-saving time change. Try a time that stays within one offset.');
    state.result = {appointment, leave, start, preparation, travel, spare};
    render();
  }
  function render() {
    const result = el('result');
    if (!state.result) { result.innerHTML = '<div class="empty"><p>Enter the appointment and minutes, then choose “Show my time steps.”</p></div>'; return; }
    const r = state.result; const label = el('label').value.trim();
    result.innerHTML = `<p class="result-meta">${label ? `${escapeHtml(label)} · ` : ''}These times use the minutes you entered.</p><div class="steps"><article class="step"><p class="step-label">Start preparing</p><h3>${format(r.start)}</h3><p>Begin getting ready.</p></article><article class="step"><p class="step-label">Leave</p><h3>${format(r.leave)}</h3><p>Travel for ${r.travel} minutes and keep ${r.spare} minutes spare.</p></article><article class="step"><p class="step-label">Appointment</p><h3>${format(r.appointment)}</h3><p>Arrive for the appointment.</p></article></div><p class="formula"><strong>Visible calculation:</strong> appointment minus travel (${r.travel}) minus spare (${r.spare}) minus preparation (${r.preparation}) = start preparing.</p>`;
  }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function example() { write({appointment:'2026-09-18T10:00', label:'Example appointment', preparation:'20', travel:'30', spare:'10', display:'24'}); try { calculate(); el('save-status').textContent = 'Example loaded. Change it so it fits you.'; } catch (error) { showError(error); } }
  function showError(error) { state.result = null; el('result').innerHTML = `<div class="warning" role="alert">${escapeHtml(error.message)}</div>`; }
  function save() { try { calculate(); localStorage.setItem(KEY, JSON.stringify(read())); el('save-status').textContent = 'Saved on this device.'; } catch (error) { showError(error); el('save-status').textContent = 'Not saved.'; } }
  function load() { try { const raw = localStorage.getItem(KEY); if (!raw) return; const data = JSON.parse(raw); if (!validSaved(data)) throw new Error('bad save'); write(data); el('save-status').textContent = 'Saved calculation loaded from this device.'; } catch { el('save-status').textContent = 'Saved calculation could not be read. Start a new one.'; } }
  function remove() { if (!localStorage.getItem(KEY)) { el('save-status').textContent = 'There is no saved calculation.'; return; } if (!window.confirm('Delete the calculation saved on this device?')) return; localStorage.removeItem(KEY); el('save-status').textContent = 'Saved calculation deleted.'; }
  el('example').addEventListener('click', example); el('calculate').addEventListener('click', () => { try { calculate(); el('save-status').textContent = 'Not saved'; } catch (error) { showError(error); } }); el('save').addEventListener('click', save); el('delete').addEventListener('click', remove); el('print').addEventListener('click', () => window.print()); fields.forEach(id => el(id).addEventListener('input', () => { if (state.result) { try { calculate(); } catch (error) { showError(error); } } })); load();
})();
