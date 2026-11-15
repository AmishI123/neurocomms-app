// When Helper Jobs runs as the Android or iOS app, this connects the web pages to the device:
// read aloud, printing, saving files, keeping the screen on, pinning the app, and the back button.
// In a normal web browser it does nothing.
(function (root) {
  const cap = root.Capacitor;
  const isNative = Boolean(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform());
  const platform = isNative && typeof cap.getPlatform === 'function' ? cap.getPlatform() : 'web';
  const PUBLIC = 'https://helper-jobs.onrender.com';
  const LIVE = 'https://helper-jobs-live.onrender.com';
  const call = (method, options = {}) => (isNative && typeof cap.nativePromise === 'function'
    ? cap.nativePromise('HelperJobsDevice', method, options)
    : Promise.reject(new Error('Not running as the app.')));

  const api = {
    isNative, platform, PUBLIC,
    publicBase: () => (isNative ? PUBLIC : null),
    keepAwake(on) { if (isNative) call('keepAwake', { on: Boolean(on) }).catch(() => {}); },
    pinApp: () => call('pinApp'),
    unpinApp: () => call('unpinApp'),
    pinState: () => (isNative ? call('pinState') : Promise.resolve({ supported: false, pinned: false })),
    onBack() {
      // Android's back button never closes the app in the middle of an outing.
      const page = (root.location.pathname.split('/').pop() || 'index.html');
      if (page !== 'index.html' && page !== '') { root.location.href = 'index.html'; return; }
      const back = root.document.querySelector('.screen.active .back-button, .screen.active [data-action="home"]');
      if (back && back.offsetParent !== null) back.click();
    }
  };
  root.HelperJobsNative = api;
  if (!isNative) return;

  const doc = root.document;
  doc.documentElement.classList.add('is-native', `is-${platform}`);
  // The app's pages live on the device, so the live link and shared links point at the public site.
  for (const [name, content] of [['helper-jobs-api', LIVE], ['helper-jobs-public', PUBLIC]]) {
    if (!doc.querySelector(`meta[name="${name}"]`)) { const meta = doc.createElement('meta'); meta.name = name; meta.content = content; doc.head.appendChild(meta); }
  }

  // Read aloud: Android's web view has no voices of its own, so the device's voice engine reads.
  if (!('speechSynthesis' in root)) {
    let voices = [];
    const listeners = [];
    class Utterance { constructor(text) { this.text = String(text || ''); this.lang = 'en-US'; this.rate = 1; this.voice = null; this.onend = null; this.onerror = null; } }
    const synth = {
      speaking: false,
      onvoiceschanged: null,
      getVoices: () => voices,
      speak(u) {
        synth.speaking = true;
        call('speak', { text: u.text, lang: (u.voice && u.voice.lang) || u.lang || 'en-US', rate: Number(u.rate) || 1 })
          .then(() => { synth.speaking = false; if (u.onend) u.onend({}); })
          .catch(error => { synth.speaking = false; if (u.onerror) u.onerror({ error: String(error && error.message || error) }); });
      },
      cancel() { synth.speaking = false; call('stopSpeaking').catch(() => {}); },
      pause() {}, resume() {},
      addEventListener(type, fn) { if (type === 'voiceschanged') listeners.push(fn); },
      removeEventListener(type, fn) { const i = listeners.indexOf(fn); if (i >= 0) listeners.splice(i, 1); }
    };
    root.SpeechSynthesisUtterance = Utterance;
    root.speechSynthesis = synth;
    call('voices').then(result => {
      voices = (result && result.voices || []).map(v => ({ lang: v.lang, name: v.name || v.lang, localService: true, default: false, voiceURI: v.lang }));
      if (synth.onvoiceschanged) synth.onvoiceschanged({});
      listeners.forEach(fn => { try { fn({}); } catch (_) {} });
    }).catch(() => {});
  }

  // Printing goes to the device's print screen (a printer, or "Save as PDF").
  root.print = () => { call('print', { name: doc.title || 'Helper Jobs' }).catch(() => {}); };

  // Saving a file opens the share sheet, so it can go to Files, Drive, email or WhatsApp.
  const toBase64 = blob => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1] || ''); reader.onerror = reject; reader.readAsDataURL(blob); });
  async function saveLink(a) {
    const blob = await (await fetch(a.href)).blob();
    await call('saveFile', { name: a.download || 'helper-jobs-file', mime: blob.type || 'application/octet-stream', data: await toBase64(blob) });
  }
  const isFileLink = a => a && a.hasAttribute('download') && /^(blob|data):/.test(a.href || '');
  const nativeClick = root.HTMLAnchorElement.prototype.click;
  root.HTMLAnchorElement.prototype.click = function () { if (isFileLink(this)) { saveLink(this).catch(() => {}); return; } return nativeClick.call(this); };

  doc.addEventListener('click', event => {
    const a = event.target.closest && event.target.closest('a[href]');
    if (!a) return;
    if (isFileLink(a)) { event.preventDefault(); saveLink(a).catch(() => {}); return; }
    const href = a.getAttribute('href') || '';
    // The slides, handout and video are not inside the app: open them on the public site.
    if (/^(\.\/)?presentation(\/|\.html|$)/.test(href) || /^(\.\/)?handout\.html/.test(href)) {
      event.preventDefault(); root.location.href = `${PUBLIC}/${href.replace(/^\.\//, '')}`; return;
    }
    // Pages that open in a new tab in a browser open in place in the app (the back button returns).
    if (a.target === '_blank' && a.origin === root.location.origin) { event.preventDefault(); root.location.href = a.href; }
  }, true);
})(typeof window !== 'undefined' ? window : globalThis);
