// Paper backup, made from the same jobs and steps as the app, so the two never disagree.
(function () {
  // The six jobs, plus any the coordinator made on this tablet.
  const jobs = window.HelperJobsStore ? window.HelperJobsStore.jobList(window.HelperJobsStore.loadState()) : window.HelperJobsData.jobs;
  const { icon } = window.HelperJobsIcons;
  const { t } = window.HelperJobsI18n;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const select = document.getElementById('card-lang');
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (['en', 'hi', 'es'].includes(fromUrl)) select.value = fromUrl;
  function cards() {
    const lang = select.value; const L = text => t(text, lang);
    document.documentElement.lang = lang;
    document.getElementById('cards').innerHTML = jobs.map(job => `<article class="job-paper">
      <header><span class="jp-icon">${icon(job.icon)}</span><div><p class="jp-level">${esc(L('Level {n}').replace('{n}', job.level))}${job.needsVolunteer ? ' · with a volunteer' : ''}</p><h2>${esc(L(job.name))}</h2><p class="jp-desc">${esc(L(job.desc))}</p></div></header>
      <ol>${job.steps.map(step => `<li><span class="jp-step-icon">${icon(step[0])}</span><span><b>${esc(L(step[1]))}</b><small>${esc(L(step[2]))}</small></span></li>`).join('')}</ol>
      <footer>${job.id === 'snack' ? '<b>No snack card? Give no food. Ask the volunteer.</b>' : '<b>Need help? Wave to your volunteer.</b>'} <span>Stopping is always okay.</span></footer>
    </article>`).join('');
  }
  const blankRows = (n, cols) => Array.from({ length: n }, () => `<tr>${cols.map(() => '<td></td>').join('')}</tr>`).join('');
  document.getElementById('if-the-tablet-stops').innerHTML = `
    <div class="sheet-page">
      <p class="paper-kicker">Helper Jobs · for the volunteer lead</p>
      <h1>If the tablet stops</h1>
      <p class="paper-lede">The outing keeps going. Nothing about safety depends on the tablet: a named volunteer is still next to every helper who is with a kid.</p>
      <ol class="paper-steps">
        <li><b>Say it out loud.</b> “The tablet is off. Help is the same: wave or call your volunteer.”</li>
        <li><b>Hand out the job cards.</b> One card per helper. Only jobs they already do on the tablet.</li>
        <li><b>Write each match below.</b> Helper, kid, job, the volunteer next to them, and the time.</li>
        <li><b>Snacks: only from the coordinator’s list.</b> If you are not sure, no snack.</li>
        <li><b>Head count at the end.</b> Tick every kid: back with a volunteer, or home with family.</li>
        <li><b>After the outing.</b> Type the matches into the tablet, or restore the newest locked copy from the coordinator’s laptop.</li>
      </ol>
    </div>
    <div class="sheet-page">
      <p class="paper-kicker">Paper match sheet</p>
      <h1>Who is with whom</h1>
      <table class="paper-table"><thead><tr><th>Time</th><th>Helper</th><th>Kid (first name)</th><th>Job</th><th>Volunteer next to them</th></tr></thead><tbody>${blankRows(12, [1, 2, 3, 4, 5])}</tbody></table>
      <h2>Head count</h2>
      <table class="paper-table"><thead><tr><th>Kid (first name)</th><th>Back with a volunteer</th><th>Home with family</th><th>Time</th></tr></thead><tbody>${blankRows(10, [1, 2, 3, 4])}</tbody></table>
      <p class="paper-small">Keep this sheet with the coordinator. Shred it once the tablet has the matches.</p>
    </div>`;
  select.addEventListener('change', cards);
  cards();
})();
