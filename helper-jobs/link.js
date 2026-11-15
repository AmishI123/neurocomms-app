// The live link between the outing tablet and the lead's phone.
// Everything is locked (AES-GCM) with a key made on the tablet before it is sent. The key reaches the
// phone only inside the pairing link's #fragment, which is never sent to any server.
(function (root) {
  const subtle = () => root.crypto && root.crypto.subtle;
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const b64 = bytes => { let s = ''; new Uint8Array(bytes).forEach(b => { s += String.fromCharCode(b); }); return (root.btoa ? root.btoa(s) : Buffer.from(s, 'binary').toString('base64')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64 = text => { const s = (root.atob ? root.atob : t => Buffer.from(t, 'base64').toString('binary'))(text.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((text.length + 3) % 4)); return Uint8Array.from(s, c => c.charCodeAt(0)); };
  const random = n => { const bytes = new Uint8Array(n); root.crypto.getRandomValues(bytes); return bytes; };
  const digest = async text => new Uint8Array(await subtle().digest('SHA-256', enc.encode(text)));
  const hex = bytes => [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');

  function apiBase() {
    const meta = root.document && root.document.querySelector('meta[name="helper-jobs-api"]');
    if (meta && meta.content) return meta.content.replace(/\/$/, '');
    const host = root.location ? root.location.hostname : '';
    if (host === 'helper-jobs.onrender.com') return 'https://helper-jobs-live.onrender.com';
    return root.location ? root.location.origin : '';
  }
  // Where shared links (the lead's phone, a second tablet, a family page) should open. In the app, that is the public site.
  function publicBase(fallback) {
    const meta = root.document && root.document.querySelector('meta[name="helper-jobs-public"]');
    if (meta && meta.content) return meta.content.replace(/\/$/, '');
    return fallback;
  }
  const available = () => Boolean(subtle() && root.fetch);

  async function keys(link) {
    if (link._keys) return link._keys;
    const authToken = b64(await digest(`helper-jobs-auth:${link.key}`));
    const authHash = hex(await digest(authToken));
    const aes = await subtle().importKey('raw', await digest(`helper-jobs-lock:${link.key}`), 'AES-GCM', false, ['encrypt', 'decrypt']);
    Object.defineProperty(link, '_keys', { value: { authToken, authHash, aes }, enumerable: false });
    return link._keys;
  }
  async function lock(link, value) {
    const { aes } = await keys(link);
    const iv = random(12);
    const data = await subtle().encrypt({ name: 'AES-GCM', iv }, aes, enc.encode(JSON.stringify(value)));
    return { iv: b64(iv), data: b64(data) };
  }
  async function unlock(link, blob) {
    const { aes } = await keys(link);
    const data = await subtle().decrypt({ name: 'AES-GCM', iv: unb64(blob.iv) }, aes, unb64(blob.data));
    return JSON.parse(dec.decode(data));
  }
  async function call(link, method, path, body, signal) {
    const { authToken } = await keys(link);
    const response = await root.fetch(`${link.api}/api/rooms/${link.roomId}${path}`, { method, signal, headers: { 'content-type': 'application/json', 'x-room-auth': authToken }, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw Object.assign(new Error(data.error || 'The live link did not answer.'), { status: response.status, gone: Boolean(data.gone) });
    return data;
  }

  const api = {
    available,
    apiBase,
    publicBase,
    newLink(base = apiBase()) { return { roomId: b64(random(18)), key: b64(random(32)), api: base, createdAt: new Date().toISOString() }; },
    // size 'large' is for backup rooms; keepDays lets family and backup links wait between outings.
    async register(link) { const { authHash } = await keys(link); return call(link, 'PUT', '', { authHash, ...(link.size ? { size: link.size } : {}), ...(link.keepDays ? { keepDays: link.keepDays } : {}) }); },
    async pushSnapshot(link, snapshot) { return call(link, 'PUT', '/snapshot', await lock(link, snapshot)); },
    async readSnapshot(link, after = 0, wait = false, signal) {
      const result = await call(link, 'GET', `/snapshot?after=${after}${wait ? '&wait=1' : ''}`, null, signal);
      return { seq: result.seq, snapshot: result.snapshot ? await unlock(link, result.snapshot) : null };
    },
    // Waking a locked phone: the phone gives the room its alert address; the tablet asks the room to wake it.
    async pushKey(base) { const r = await root.fetch(`${base}/api/push-key`, { cache: 'no-store' }); return (await r.json()).key; },
    async addPhone(link, endpoint, remove = false) { return call(link, 'POST', '/push', { endpoint, remove }); },
    async wakePhones(link) { return call(link, 'POST', '/notify', {}); },
    async sendCommand(link, command) { return call(link, 'POST', '/commands', { id: command.id, ...(await lock(link, command)) }); },
    async readCommands(link, after = 0, wait = false, signal) {
      const result = await call(link, 'GET', `/commands?after=${after}${wait ? '&wait=1' : ''}`, null, signal);
      const commands = [];
      for (const item of result.commands || []) { try { commands.push({ seq: item.seq, ...(await unlock(link, item)) }); } catch (_) { /* not ours: ignore */ } }
      return { seq: result.seq, commands };
    },
    // The pairing link: the room and key ride in the #fragment, which browsers never send to a server.
    pairingUrl(link, origin, page = 'lead-phone.html') { return `${origin}/${page}#r=${encodeURIComponent(link.roomId)}&k=${encodeURIComponent(link.key)}&a=${encodeURIComponent(link.api)}`; },
    fromFragment(hash) {
      const params = new URLSearchParams(String(hash || '').replace(/^#/, ''));
      const roomId = params.get('r'); const key = params.get('k'); const base = params.get('a');
      if (!roomId || !key || !/^https?:\/\//.test(base || '')) return null;
      // Only our own live link is accepted, so a made-up link cannot show a fake board.
      const allowed = [apiBase(), root.location ? root.location.origin : ''].filter(Boolean);
      const clean = base.replace(/\/$/, '');
      if (!allowed.includes(clean)) return null;
      return { roomId, key, api: clean };
    },
    id: prefix => `${prefix}-${b64(random(9))}`,
    // A copy saved to a computer is locked with words the coordinator chooses (PBKDF2 + AES-GCM).
    async lockWithPassphrase(value, passphrase) {
      const salt = random(16); const iv = random(12);
      const key = await passKey(passphrase, salt);
      const data = await subtle().encrypt({ name: 'AES-GCM', iv }, key, enc.encode(JSON.stringify(value)));
      return { kind: 'helper-jobs-locked-copy', v: 1, salt: b64(salt), iv: b64(iv), data: b64(data) };
    },
    async unlockWithPassphrase(file, passphrase) {
      if (!file || file.kind !== 'helper-jobs-locked-copy') throw new Error('This is not a Helper Jobs copy.');
      const key = await passKey(passphrase, unb64(file.salt));
      try { return JSON.parse(dec.decode(await subtle().decrypt({ name: 'AES-GCM', iv: unb64(file.iv) }, key, unb64(file.data)))); }
      catch (_) { throw new Error('Those words do not open this copy.'); }
    }
  };
  async function passKey(passphrase, salt) {
    const base = await subtle().importKey('raw', enc.encode(String(passphrase)), 'PBKDF2', false, ['deriveKey']);
    return subtle().deriveKey({ name: 'PBKDF2', salt, iterations: 210000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }
  root.HelperJobsLink = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
