// One certificate, ready to print: used on the tablet (coordinator) and on the family page.
(function (root) {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const day = iso => { const d = iso ? new Date(`${String(iso).slice(0, 10)}T12:00:00`) : new Date(); return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' }); };
  function html(input) {
    const star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.8z"/></svg>';
    return `<article class="cert-sheet"><div class="cert-inner">
      <p class="cert-brand"><span class="mark">h.</span> Helper Jobs · Pragnya Sunday outings</p>
      <div class="cert-star">${star}</div>
      <p class="cert-kicker">${input.title === 'Thank You' ? 'A thank-you' : 'Badge certificate'}</p>
      <h1 class="cert-title">${esc(input.title)}</h1>
      <p class="cert-for">This is for</p>
      <p class="cert-name">${esc(input.name)}</p>
      <p class="cert-line">${esc(input.line)}</p>
      <div class="cert-foot"><div><span class="cert-rule"></span><small>Coordinator</small></div><div><b>${esc(input.place || 'Pragnya')}</b><small>${esc(day(input.date))}</small></div></div>
    </div></article>`;
  }
  root.HelperJobsCertificate = { html };
})(window);
