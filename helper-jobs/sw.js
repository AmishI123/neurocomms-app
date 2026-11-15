// Network first, so a tablet always gets the newest version when it is online;
// the saved copy is used only when there is no internet.
const CACHE = 'helper-jobs-shell-v16';
// While an outing is running (the lead started the board and has not finished wrap-up), pages come from
// the saved copy first, so nothing changes under the helpers. The flag lasts at most 10 hours.
const FLAGS = 'helper-jobs-flags';
let liveUntil = null;
async function readLive() { try { const r = await (await caches.open(FLAGS)).match('./__live'); liveUntil = r ? Number(await r.text()) : 0; } catch (_) { liveUntil = 0; } }
self.addEventListener('message', event => {
  if (!event.data || event.data.type !== 'outing') return;
  liveUntil = event.data.live ? Date.now() + 10 * 3600_000 : 0;
  event.waitUntil(caches.open(FLAGS).then(cache => cache.put('./__live', new Response(String(liveUntil)))));
});
const SHELL = [
  './', './index.html', './base.css', './experience.css', './theme-atlas.css', './styles.css', './icons.js', './native.js', './link.js', './vendor/qrcode.js', './data.js', './i18n.js', './art.js', './store.js', './app.js', './certificate.js', './certificate.html', './print-cards.html', './print-cards.js', './print.css', './tablet-setup.html', './rehearsal.html', './people-sheets.html', './helper-card.html', './progress.html', './report.html', './report.js', './wording.html', './wording.js',
  './lead-phone.html', './lead-phone.js', './family.html', './family.js', './backup.html', './backup.js', './icon.svg', './icon-192.png', './icon-512.png', './lead-phone.webmanifest', './app.webmanifest', './fraunces-normal.woff2', './fraunces-italic.woff2'
];
// A new version waits while an outing is running, and takes over once it ends.
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(readLive).then(() => { if (!(Date.now() < liveUntil)) return self.skipWaiting(); })));
self.addEventListener('activate', event => event.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE && key !== FLAGS).map(key => caches.delete(key)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  // The live link is never cached: it must always be fresh, or fail and say so.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/') || url.pathname === '/healthz' || /\.(mp4|vtt)$/.test(url.pathname)) return;
  const network = () => fetch(event.request).then(response => {
    if (response.ok && response.status === 200) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
    return response;
  }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')));
  event.respondWith((async () => {
    if (liveUntil === null) await readLive();
    if (Date.now() < liveUntil) { const cached = await caches.match(event.request, { ignoreSearch: false }); if (cached) return cached; }
    return network();
  })());
});

// The lead's phone is woken for Help and Stop. The alert carries no names: tapping it opens the board,
// which the phone unlocks with its own key.
self.addEventListener('push', event => {
  event.waitUntil(self.registration.showNotification('Helper Jobs · someone needs you', {
    body: 'A helper pressed Help or Stop. Tap to see who.',
    icon: './icon-192.png', badge: './icon-192.png', tag: 'helper-jobs-help', renotify: true, requireInteraction: true,
    vibrate: [300, 120, 300, 120, 300]
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const open = list.find(client => /lead-phone\.html/.test(client.url));
    return open ? open.focus() : self.clients.openWindow('./lead-phone.html');
  }));
});
