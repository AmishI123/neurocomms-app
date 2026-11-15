// Helper Jobs live link: a small relay so Help and Stop on the outing tablet reach the lead's phone.
//
// The tablet locks everything before it leaves (AES-GCM, key made on the tablet). The key travels to
// the lead's phone only inside the pairing link's #fragment, which browsers never send to a server.
// So this server stores and passes along scrambled blobs it cannot read: no names, no kid details.
//
// Rooms live in memory and are deleted after 12 hours without use. If the server restarts, the tablet
// simply registers its room again and sends the board again.
//
// It also serves the app's static files, so `node server/server.mjs` runs the whole thing locally.
import { createServer } from 'node:http';
import { createHash, timingSafeEqual, randomBytes, createECDH, createPrivateKey, sign as cryptoSign } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const env = process.env;
const LIMITS = {
  rooms: Number(env.MAX_ROOMS || 500),
  idleMs: Number(env.ROOM_IDLE_HOURS || 12) * 3600_000,
  body: 64 * 1024,
  // Backup rooms carry the whole outing (with small photos), locked. Few of them, and capped.
  largeBody: 1024 * 1024,
  largeRooms: Number(env.MAX_LARGE_ROOMS || 50),
  maxKeepDays: 14,
  commandsKept: 100,
  waitMs: Number(env.LONG_POLL_MS || 25_000),
  waitersPerRoom: 8,
  createsPerIpPerHour: 30,
  requestsPerIpPerMinute: Number(env.REQUESTS_PER_MINUTE || 600)
};
// The Android app's pages come from https://localhost and the iPad app's from capacitor://localhost.
const ALLOWED_ORIGINS = (env.ALLOWED_ORIGINS || 'https://helper-jobs.onrender.com,https://localhost,capacitor://localhost,http://localhost:8765,http://127.0.0.1:8765,http://localhost:8790,http://127.0.0.1:8790').split(',').map(item => item.trim()).filter(Boolean);
const TYPES = { '.webmanifest': 'application/manifest+json', '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png', '.pdf': 'application/pdf', '.json': 'application/json', '.mp4': 'video/mp4', '.vtt': 'text/vtt; charset=utf-8' };
const SECURITY = { 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'permissions-policy': 'camera=(), microphone=(), geolocation=()' };

// ---- Waking the lead's phone (Web Push) ----
// The push carries no message at all: the phone shows "someone needs you" and opens the board,
// which it unlocks with its own key. So the push services (Google, Apple, Mozilla) learn nothing either.
// VAPID_SECRET keeps the push key the same across restarts; without it a new key is made each start.
const N = BigInt('0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551');
const b64u = buf => Buffer.from(buf).toString('base64url');
function vapidKeys(secret) {
  for (let i = 0; ; i += 1) {
    const d = secret ? createHash('sha256').update(`helper-jobs-vapid:${i}:${secret}`).digest() : randomBytes(32);
    const v = BigInt('0x' + d.toString('hex'));
    if (v === 0n || v >= N) continue;
    const ecdh = createECDH('prime256v1'); ecdh.setPrivateKey(d);
    const pub = ecdh.getPublicKey();
    const key = createPrivateKey({ key: { kty: 'EC', crv: 'P-256', d: b64u(d), x: b64u(pub.subarray(1, 33)), y: b64u(pub.subarray(33, 65)) }, format: 'jwk' });
    return { publicKey: b64u(pub), key };
  }
}
const VAPID = env.PUSH === '0' ? null : vapidKeys(env.VAPID_SECRET || '');
const VAPID_SUBJECT = env.VAPID_SUBJECT || 'https://helper-jobs.onrender.com';
const PUSH_HOSTS = [/^fcm\.googleapis\.com$/, /^android\.googleapis\.com$/, /^updates\.push\.services\.mozilla\.com$/, /^push\.services\.mozilla\.com$/, /^web\.push\.apple\.com$/, /\.push\.apple\.com$/, /\.notify\.windows\.com$/];
const PUSH_TEST = (env.PUSH_TEST_ORIGINS || '').split(',').map(item => item.trim()).filter(Boolean);
function pushEndpointOk(value) {
  try {
    const url = new URL(String(value));
    if (PUSH_TEST.includes(url.origin) || PUSH_TEST.includes(`${url.protocol}//${url.hostname}`)) return true; // tests only
    return url.protocol === 'https:' && !url.port && PUSH_HOSTS.some(re => re.test(url.hostname)) && String(value).length <= 600;
  } catch { return false; }
}
export function vapidJwt(endpoint, nowS = Math.floor(Date.now() / 1000)) {
  const head = b64u(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const body = b64u(JSON.stringify({ aud: new URL(endpoint).origin, exp: nowS + 12 * 3600, sub: VAPID_SUBJECT }));
  const sig = cryptoSign('sha256', Buffer.from(`${head}.${body}`), { key: VAPID.key, dsaEncoding: 'ieee-p1363' });
  return `${head}.${body}.${b64u(sig)}`;
}
async function sendPush(room) {
  if (!VAPID || !room.push.length) return 0;
  let sent = 0;
  for (const sub of [...room.push]) {
    try {
      const response = await fetch(sub.endpoint, { method: 'POST', headers: { TTL: '600', Urgency: 'high', Topic: 'helper-jobs-help', Authorization: `vapid t=${vapidJwt(sub.endpoint)}, k=${VAPID.publicKey}`, 'Content-Length': '0' }, signal: AbortSignal.timeout(8000) });
      if (response.status === 404 || response.status === 410) room.push = room.push.filter(item => item !== sub);
      else if (response.ok) sent += 1;
    } catch { /* the phone still sees it next time the page is open */ }
  }
  return sent;
}
export const _vapid = () => VAPID && VAPID.publicKey;

const rooms = new Map();
const hits = new Map();
const sha = text => createHash('sha256').update(text).digest('hex');
const same = (a, b) => { const x = Buffer.from(String(a)); const y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };
const ROOM_ID = /^[A-Za-z0-9_-]{16,40}$/;
const BLOB = (value, max = 48 * 1024) => value && typeof value === 'object' && typeof value.iv === 'string' && typeof value.data === 'string' && value.iv.length <= 64 && value.data.length <= max && /^[A-Za-z0-9_-]+$/.test(value.iv + value.data);
const roomBlobMax = room => room && room.large ? LIMITS.largeBody - 4096 : 48 * 1024;
const roomIdle = room => room.keepMs || LIMITS.idleMs;

function clientIp(req) {
  // Render puts the real address last in x-forwarded-for; anything earlier can be made up by the caller.
  if (env.TRUST_PROXY !== '0' && req.headers['x-forwarded-for']) return String(req.headers['x-forwarded-for']).split(',').pop().trim();
  return req.socket.remoteAddress || 'unknown';
}
function limited(key, max, windowMs) {
  const now = Date.now();
  const list = (hits.get(key) || []).filter(at => now - at < windowMs);
  list.push(now); hits.set(key, list);
  return list.length > max;
}
function cors(req) {
  const origin = req.headers.origin;
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return {};
  return { 'access-control-allow-origin': origin, 'access-control-allow-headers': 'content-type, x-room-auth', 'access-control-allow-methods': 'GET, POST, PUT, OPTIONS', 'access-control-max-age': '600', vary: 'Origin' };
}
function send(req, res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...SECURITY, ...cors(req) });
  res.end(JSON.stringify(body));
}
async function readBody(req, limit = LIMITS.body) {
  const tooLarge = () => Object.assign(new Error('Too large.'), { status: 413 });
  // Say no before reading when the size is known; otherwise read on (dropping it) so the reply arrives cleanly.
  if (Number(req.headers['content-length']) > limit) { req.resume(); throw tooLarge(); }
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > limit * 4) throw tooLarge(); if (size <= limit) chunks.push(chunk); }
  if (size > limit) throw tooLarge();
  if (!chunks.length) return {};
  const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw Object.assign(new Error('Send an object.'), { status: 400 });
  return value;
}
function sweep() {
  const now = Date.now();
  for (const [id, room] of rooms) if (now - room.touched > roomIdle(room)) { wake(room, 'gone'); rooms.delete(id); }
  for (const [key, list] of hits) if (!list.some(at => now - at < 3600_000)) hits.delete(key);
}
function wake(room, reason = 'update') {
  for (const waiter of room.waiters.splice(0)) waiter(reason);
}
function waitFor(room, ready, timeoutMs) {
  if (ready()) return Promise.resolve('ready');
  if (room.waiters.length >= LIMITS.waitersPerRoom) wake(room, 'busy');
  return new Promise(done => {
    const timer = setTimeout(() => { room.waiters = room.waiters.filter(item => item !== finish); done('timeout'); }, timeoutMs);
    const finish = reason => { clearTimeout(timer); done(reason); };
    room.waiters.push(finish);
  });
}
function authorised(req, room) { return same(sha(String(req.headers['x-room-auth'] || '')), room.authHash); }

export async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const ip = clientIp(req);
  try {
    if (req.method === 'OPTIONS') { res.writeHead(204, { ...SECURITY, ...cors(req) }); res.end(); return; }
    if (path === '/healthz') return send(req, res, 200, { ok: true, rooms: rooms.size });
    if (path === '/api/push-key') return send(req, res, 200, { key: VAPID ? VAPID.publicKey : null });
    if (path.startsWith('/api/')) {
      if (limited(`ip:${ip}`, LIMITS.requestsPerIpPerMinute, 60_000)) return send(req, res, 429, { error: 'Too many requests. Wait a minute.' });
      const match = /^\/api\/rooms\/([^/]+)(?:\/(snapshot|commands|push|notify))?$/.exec(path);
      if (!match) return send(req, res, 404, { error: 'Not found.' });
      const [, id, part] = match;
      if (!ROOM_ID.test(id)) return send(req, res, 400, { error: 'That room code is not valid.' });
      let room = rooms.get(id);

      // Register (or register again after a restart). The tablet sends a hash of its secret, never the secret.
      if (!part && req.method === 'PUT') {
        const body = await readBody(req);
        if (!/^[a-f0-9]{64}$/.test(String(body.authHash || ''))) return send(req, res, 400, { error: 'Missing room check.' });
        if (room) {
          if (!same(room.authHash, body.authHash)) return send(req, res, 409, { error: 'That room belongs to another tablet.' });
          room.touched = Date.now(); return send(req, res, 200, { ok: true, existing: true });
        }
        if (limited(`create:${ip}`, LIMITS.createsPerIpPerHour, 3600_000)) return send(req, res, 429, { error: 'Too many new rooms from here. Try again later.' });
        sweep();
        if (rooms.size >= LIMITS.rooms) return send(req, res, 503, { error: 'The live link is full right now. Try again later.' });
        const large = body.size === 'large';
        if (large && [...rooms.values()].filter(item => item.large).length >= LIMITS.largeRooms) return send(req, res, 503, { error: 'No room for another backup right now. Try again later.' });
        // Family and backup links may wait between outings: up to 14 days without use.
        const keepDays = Math.min(LIMITS.maxKeepDays, Math.max(0, Math.floor(Number(body.keepDays) || 0)));
        rooms.set(id, { push: [], lastNotify: 0, authHash: body.authHash, large, keepMs: keepDays ? keepDays * 86400_000 : 0, snapshot: null, snapshotSeq: 0, commands: [], commandSeq: 0, waiters: [], touched: Date.now(), created: Date.now() });
        return send(req, res, 201, { ok: true });
      }
      if (!room) return send(req, res, 404, { error: 'This link has ended. Open the pairing code on the tablet again.', gone: true });
      if (!authorised(req, room)) return send(req, res, 403, { error: 'This link does not match the tablet.' });
      room.touched = Date.now();

      if (part === 'snapshot' && req.method === 'PUT') {
        const body = await readBody(req, room.large ? LIMITS.largeBody : LIMITS.body);
        if (!BLOB(body, roomBlobMax(room))) return send(req, res, 400, { error: 'Send the board, locked.' });
        room.snapshot = { iv: body.iv, data: body.data, at: Date.now() }; room.snapshotSeq += 1;
        wake(room);
        return send(req, res, 200, { ok: true, seq: room.snapshotSeq, lastCommand: room.commandSeq });
      }
      if (part === 'snapshot' && req.method === 'GET') {
        const after = Number(url.searchParams.get('after') || 0);
        const wait = url.searchParams.get('wait') === '1';
        if (wait) await waitFor(room, () => room.snapshotSeq > after || !rooms.has(id), LIMITS.waitMs);
        if (!rooms.has(id)) return send(req, res, 404, { error: 'This link has ended.', gone: true });
        return send(req, res, 200, { seq: room.snapshotSeq, snapshot: room.snapshotSeq > after ? room.snapshot : null });
      }
      if (part === 'commands' && req.method === 'POST') {
        const body = await readBody(req);
        if (!/^[A-Za-z0-9_-]{8,64}$/.test(String(body.id || '')) || !BLOB(body)) return send(req, res, 400, { error: 'Send the message, locked.' });
        // The same command sent twice (a retry) is kept once.
        const existing = room.commands.find(item => item.id === body.id);
        if (existing) return send(req, res, 200, { ok: true, seq: existing.seq, duplicate: true });
        room.commandSeq += 1;
        room.commands.push({ id: body.id, seq: room.commandSeq, iv: body.iv, data: body.data, at: Date.now() });
        if (room.commands.length > LIMITS.commandsKept) room.commands.splice(0, room.commands.length - LIMITS.commandsKept);
        wake(room);
        return send(req, res, 201, { ok: true, seq: room.commandSeq });
      }
      // The lead's phone asks to be woken; the tablet asks to wake it. Both need the room's key.
      if (part === 'push' && req.method === 'POST') {
        const body = await readBody(req);
        if (!pushEndpointOk(body.endpoint)) return send(req, res, 400, { error: 'That alert address is not from a known phone alert service.' });
        room.push = (room.push || []).filter(item => item.endpoint !== body.endpoint);
        if (!body.remove) { room.push.push({ endpoint: String(body.endpoint), at: Date.now() }); room.push = room.push.slice(-3); }
        return send(req, res, 200, { ok: true, phones: room.push.length });
      }
      if (part === 'notify' && req.method === 'POST') {
        if (Date.now() - (room.lastNotify || 0) < 3000) return send(req, res, 200, { ok: true, sent: 0, waited: true });
        room.lastNotify = Date.now();
        return send(req, res, 200, { ok: true, sent: await sendPush(room) });
      }
      if (part === 'commands' && req.method === 'GET') {
        const after = Number(url.searchParams.get('after') || 0);
        if (url.searchParams.get('wait') === '1') await waitFor(room, () => room.commandSeq > after || !rooms.has(id), LIMITS.waitMs);
        if (!rooms.has(id)) return send(req, res, 404, { error: 'This link has ended.', gone: true });
        return send(req, res, 200, { seq: room.commandSeq, commands: room.commands.filter(item => item.seq > after) });
      }
      return send(req, res, 405, { error: 'Not allowed.' });
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(req, res, 405, { error: 'Not allowed.' });
    // Static files: only the app folder, never the tests or the server itself.
    let name = decodeURIComponent(path);
    if (name.endsWith('/')) name += 'index.html';
    const file = resolve(ROOT, '.' + name);
    if (!file.startsWith(ROOT + sep) || /[\\/](tests|server|node_modules)[\\/]|[\\/](package(-lock)?\.json|README\.md)$/.test(file.slice(ROOT.length)) || !TYPES[extname(file)]) { res.writeHead(404, SECURITY); res.end('Not found'); return; }
    let content;
    try { content = await readFile(file); } catch { res.writeHead(404, SECURITY); res.end('Not found'); return; }
    const headers = { 'content-type': TYPES[extname(file)], 'cache-control': /\.(html|js)$/.test(file) ? 'no-cache' : 'public, max-age=300', 'accept-ranges': 'bytes', ...SECURITY };
    // Videos are fetched in parts by browsers (Range requests), so seeking works.
    const range = /^bytes=(\d*)-(\d*)$/.exec(String(req.headers.range || ''));
    if (range && (range[1] || range[2])) {
      const size = content.length;
      let start = range[1] ? Number(range[1]) : size - Number(range[2]);
      let end = range[1] && range[2] ? Number(range[2]) : size - 1;
      if (start < 0) start = 0;
      if (start >= size || end < start) { res.writeHead(416, { 'content-range': `bytes */${size}`, ...SECURITY }); res.end(); return; }
      end = Math.min(end, size - 1);
      res.writeHead(206, { ...headers, 'content-range': `bytes ${start}-${end}/${size}`, 'content-length': end - start + 1 });
      res.end(req.method === 'HEAD' ? undefined : content.subarray(start, end + 1)); return;
    }
    res.writeHead(200, headers);
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) {
    send(req, res, error.status || (error instanceof SyntaxError || error instanceof URIError ? 400 : 500), { error: error.status || error instanceof SyntaxError ? (error.message || 'Bad request.') : 'Something went wrong.' });
  }
}

export function start(port = Number(env.PORT || 8790), host = env.HOST || '0.0.0.0') {
  const server = createServer(handle);
  const timer = setInterval(sweep, 60_000); timer.unref();
  server.requestTimeout = 60_000; server.headersTimeout = 30_000;
  return new Promise(done => server.listen(port, host, () => { console.log(JSON.stringify({ ok: true, port: server.address().port })); done(server); }));
}
export const _rooms = rooms;
export const newRoomId = () => randomBytes(16).toString('base64url');

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) start();
