// The family page: one helper's stars, badges, certificates and photo. Nothing about kids or other helpers.
(function () {
  const Link = window.HelperJobsLink;
  const KEY = 'helper-jobs.family-view.v1';
  const LAST = 'helper-jobs.family-last.v1';
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const get = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } };
  const set = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };

  // Words on this page in English, Hindi and Spanish. A Hindi or Spanish speaker should check them before a real outing.
  const W = {
    connecting: ['Connecting…', 'जुड़ रहा है…', 'Conectando…'],
    noLink: ['No link', 'लिंक नहीं', 'Sin enlace'],
    askTitle: ['Ask the coordinator for your link.', 'अपना लिंक कोऑर्डिनेटर से माँगिए।', 'Pide tu enlace a la coordinadora.'],
    askSub: ['The coordinator makes a family page for each helper who says yes. It opens from the link they send you.', 'जो हेल्पर हाँ कहते हैं, उनके लिए कोऑर्डिनेटर परिवार का पेज बनाते हैं। यह उनके भेजे लिंक से खुलता है।', 'La coordinadora hace una página familiar para cada ayudante que dice que sí. Se abre con el enlace que te envía.'],
    eyebrow: ['Family page · Helper Jobs', 'परिवार का पेज · हेल्पर जॉब्स', 'Página familiar · Helper Jobs'],
    meta: ['Level {n} helper at {place} Sunday outings', '{place} के रविवार आउटिंग में लेवल {n} हेल्पर', 'Ayudante de nivel {n} en las salidas de domingo de {place}'],
    stars: ['stars', 'तारे', 'estrellas'], jobsDone: ['jobs done', 'काम पूरे', 'trabajos hechos'], badges: ['badges', 'बैज', 'insignias'],
    lead: ['The volunteer lead', 'वॉलंटियर लीड', 'La persona voluntaria a cargo'],
    hJobs: ['Jobs done', 'पूरे किए काम', 'Trabajos hechos'], hCerts: ['Badges and certificates', 'बैज और सर्टिफ़िकेट', 'Insignias y certificados'],
    noJobs: ['No jobs finished yet.', 'अभी कोई काम पूरा नहीं हुआ।', 'Todavía no hay trabajos terminados.'],
    noCerts: ['Certificates appear here after the first finished job.', 'पहला काम पूरा होने के बाद सर्टिफ़िकेट यहाँ दिखेंगे।', 'Los certificados aparecen aquí después del primer trabajo terminado.'],
    thanks: ['A thank-you', 'आभार पत्र', 'Un agradecimiento'], badge: ['Badge', 'बैज', 'Insignia'],
    print: ['Print this certificate', 'यह सर्टिफ़िकेट प्रिंट करें', 'Imprimir este certificado'],
    privacy: ['This page shows only this helper’s own stars, badges and photo. It never shows the kids, other helpers or what happened when someone asked for help. The coordinator can turn it off at any time.', 'यह पेज सिर्फ़ इसी हेल्पर के तारे, बैज और फ़ोटो दिखाता है। यह बच्चों, दूसरे हेल्पर, या मदद माँगने पर क्या हुआ, कभी नहीं दिखाता। कोऑर्डिनेटर इसे कभी भी बंद कर सकते हैं।', 'Esta página solo muestra las estrellas, insignias y foto de este ayudante. Nunca muestra a los niños, a otros ayudantes ni lo que pasó cuando alguien pidió ayuda. La coordinadora puede apagarla en cualquier momento.'],
    forget: ['Stop showing this page on this device', 'इस डिवाइस पर यह पेज दिखाना बंद करें', 'Dejar de mostrar esta página en este dispositivo'],
    live: ['Up to date', 'ताज़ा', 'Al día'], saved: ['Saved copy', 'सेव की हुई कॉपी', 'Copia guardada'], notShared: ['Not shared yet', 'अभी साझा नहीं', 'Aún no compartida'],
    off: ['Link turned off', 'लिंक बंद है', 'Enlace apagado'], again: ['Reconnecting…', 'फिर से जुड़ रहा है…', 'Reconectando…'],
    'Thank You': ['Thank You', 'धन्यवाद', 'Gracias'],
    thankLine: ['for {n} stars of helping at Pragnya outings', 'प्रज्ञा आउटिंग में मदद के {n} तारों के लिए', 'por {n} estrellas de ayuda en las salidas de Pragnya'],
    thankLine1: ['for 1 star of helping at Pragnya outings', 'प्रज्ञा आउटिंग में मदद के 1 तारे के लिए', 'por 1 estrella de ayuda en las salidas de Pragnya'],
    badgeLine: ['for finishing {n} {job} jobs', '{n} बार {job} का काम पूरा करने के लिए', 'por terminar {n} trabajos de {job}'],
    'Snack Star': ['Snack Star', 'नाश्ता स्टार', 'Estrella de merienda'], 'Great Buddy': ['Great Buddy', 'बढ़िया साथी', 'Gran compañero'],
    'Super Talker': ['Super Talker', 'बातों का उस्ताद', 'Gran conversador'], 'Line Leader': ['Line Leader', 'लाइन लीडर', 'Guía de la fila'],
    lang: ['Language', 'भाषा', 'Idioma']
  };
  const I18N = window.HelperJobsI18n;
  const LANG_KEY = 'helper-jobs.family-lang.v1';
  const idx = { en: 0, hi: 1, es: 2 };
  let lang = (() => { try { return localStorage.getItem(LANG_KEY) || ''; } catch (_) { return ''; } })();
  const w = (key, vars) => { let out = (W[key] || [key])[idx[lang] || 0] || W[key][0]; for (const [k, v] of Object.entries(vars || {})) out = out.split(`{${k}}`).join(String(v)); return out; };
  const jobName = name => (I18N && lang !== 'en' ? I18N.t(name, lang) : name);
  function applyStatic() {
    document.documentElement.lang = lang || 'en';
    document.querySelectorAll('[data-w]').forEach(el => { el.textContent = w(el.dataset.w); });
    document.querySelectorAll('[data-lang]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.lang === (lang || 'en'))));
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-lang]');
    if (!button) return;
    lang = button.dataset.lang; try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
    applyStatic(); render(); if (lastStatus) status(lastStatus[0], lastStatus[1]);
  });
  let lastStatus = null;
  let link = Link.fromFragment(location.hash);
  if (link) { set(KEY, link); history.replaceState(null, '', location.pathname); } else link = get(KEY);
  if (!link || !Link.available()) { lang = lang || 'en'; applyStatic(); $('#family-missing').hidden = false; status('noLink', 'off'); return; }
  $('#family-board').hidden = false;
  const icon = name => window.HelperJobsIcons.icon(name);
  document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = icon(el.dataset.icon); });
  document.querySelectorAll('[data-art]').forEach(el => { el.innerHTML = window.HelperJobsArt.draw(el.dataset.art); });
  const JOB_ICONS = { 'Snack Helper': 'apple', 'Walk Leader': 'walk', 'Clean-Up Crew': 'basket', 'Play Partner': 'puzzle', 'Talk Friend': 'message-circle', 'Buddy': 'heart-handshake' };
  let view = get(LAST);
  let seq = 0, failures = 0;
  function render() {
    if (!view) return;
    if (!lang) { lang = view.lang && idx[view.lang] !== undefined ? view.lang : 'en'; applyStatic(); }
    $('#family-name').textContent = view.name;
    $('#family-photo').innerHTML = view.photoData && /^data:image\/jpeg;base64,/.test(view.photoData) ? `<img src="${esc(view.photoData)}" alt="" />` : esc(view.photo);
    $('#family-meta').textContent = w('meta', { n: view.level, place: view.place || 'Pragnya' });
    const total = Object.values(view.jobs || {}).reduce((sum, n) => sum + n, 0);
    $('#family-summary').innerHTML = `<div>${icon('star')}<strong>${view.stars}</strong><span>${w('stars')}</span></div><div>${icon('checklist')}<strong>${total}</strong><span>${w('jobsDone')}</span></div><div class="alert-summary">${icon('award')}<strong>${(view.badges || []).length}</strong><span>${w('badges')}</span></div>`;
    $('#family-note').hidden = !view.note;
    $('#family-note').innerHTML = view.note ? `<p>“${esc(view.note)}”</p><cite>${w('lead')}</cite>` : '';
    $('#family-jobs').innerHTML = Object.entries(view.jobs || {}).map(([name, n]) => `<div class="family-job"><span class="family-job-icon">${icon(JOB_ICONS[name] || 'star')}</span><div><strong>${n}</strong><span>${esc(jobName(name))}</span></div></div>`).join('') || `<p class="phone-calm">${w('noJobs')}</p>`;
    $('#family-certs').innerHTML = (view.certificates || []).map((cert, i) => `<article class="coordinator-card family-cert"><span class="cert-medal">${icon(cert.title === 'Thank You' ? 'heart' : 'medal')}</span><p class="eyebrow">${cert.title === 'Thank You' ? w('thanks') : w('badge')}</p><h3>${esc(certTitle(cert))}</h3><p>${esc(certLine(cert))}</p><button type="button" class="secondary" data-cert="${i}">${w('print')}</button></article>`).join('') || `<p class="phone-calm">${w('noCerts')}</p>`;
  }
  function status(key, state) { lastStatus = [key, state]; const el = $('#family-status'); el.textContent = w(key); el.dataset.state = state; }
  const certTitle = cert => (W[cert.title] ? w(cert.title) : cert.title);
  const certLine = cert => {
    if (lang === 'en' || cert.count === undefined) return cert.line;
    if (cert.title === 'Thank You') return cert.count === 1 ? w('thankLine1') : w('thankLine', { n: cert.count });
    return w('badgeLine', { n: cert.count, job: jobName(cert.job) });
  };
  async function loop() {
    for (;;) {
      try {
        const result = await Link.readSnapshot(link, seq, true);
        failures = 0;
        if (result.snapshot) { seq = result.seq; view = result.snapshot; set(LAST, view); render(); }
        status('live', 'live');
      } catch (error) {
        failures += 1;
        if (error.gone) { status(view ? 'saved' : 'notShared', 'stale'); return; }
        if (error.status === 403) { status('off', 'off'); return; }
        status('again', 'off');
        await new Promise(done => setTimeout(done, Math.min(30000, 3000 * failures)));
      }
    }
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-cert]');
    if (!button || !view) return;
    const cert = view.certificates[Number(button.dataset.cert)];
    $('#print-area').innerHTML = HelperJobsCertificate.html({ name: view.name, title: certTitle(cert), line: certLine(cert), place: view.place, date: view.date });
    window.print();
  });
  $('#family-forget').addEventListener('click', () => { localStorage.removeItem(KEY); localStorage.removeItem(LAST); location.replace('./family.html'); });
  if (lang) applyStatic(); else if (!view) { lang = 'en'; applyStatic(); }
  status('connecting', 'off'); render(); loop();
})();
