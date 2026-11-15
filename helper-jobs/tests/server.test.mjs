// The live link: the server only ever sees locked data, answers quickly, and refuses the wrong key.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
process.env.LONG_POLL_MS = '3000';
process.env.TRUST_PROXY = '0';
process.env.PUSH_TEST_ORIGINS = 'http://127.0.0.1';
const { start, _rooms } = await import('../server/server.mjs');
const Link = require('../link.js');

const server = await start(0, '127.0.0.1');
const base = `http://127.0.0.1:${server.address().port}`;
test.after(() => server.close());
const fresh = () => Link.newLink(base);

test('a tablet registers a room, and the board reaches the phone locked', async () => {
  const link = fresh();
  assert.equal((await Link.register(link)).ok, true);
  const board = { title: 'Sunday at Pragnya Park', helpers: [{ name: 'Asha', status: 'needs you' }], kid: 'Eli' };
  await Link.pushSnapshot(link, board);
  const stored = JSON.stringify(_rooms.get(link.roomId));
  for (const secret of ['Asha', 'Eli', 'Pragnya', link.key]) assert.equal(stored.includes(secret), false, `server must not see ${secret}`);
  const phone = { roomId: link.roomId, key: link.key, api: base };
  const read = await Link.readSnapshot(phone, 0);
  assert.deepEqual(read.snapshot, board);
});

test('the phone hears a new alert within a second while it waits', async () => {
  const link = fresh(); await Link.register(link); await Link.pushSnapshot(link, { n: 1 });
  const phone = { roomId: link.roomId, key: link.key, api: base };
  const first = await Link.readSnapshot(phone, 0);
  const started = Date.now();
  const waiting = Link.readSnapshot(phone, first.seq, true);
  setTimeout(() => Link.pushSnapshot(link, { n: 2, alert: 'Asha needs you' }), 150);
  const next = await waiting;
  assert.equal(next.snapshot.alert, 'Asha needs you');
  assert.ok(Date.now() - started < 1000, `took ${Date.now() - started} ms`);
});

test('commands from the phone reach the tablet once, even if sent twice', async () => {
  const link = fresh(); await Link.register(link);
  const phone = { roomId: link.roomId, key: link.key, api: base };
  const command = { id: Link.id('cmd'), type: 'ack', alertId: 'help-1' };
  await Link.sendCommand(phone, command);
  const again = await Link.sendCommand(phone, command);
  assert.equal(again.duplicate, true);
  const read = await Link.readCommands(link, 0);
  assert.equal(read.commands.length, 1);
  assert.equal(read.commands[0].alertId, 'help-1');
});

test('the wrong key is refused, an unknown room says it has ended, and a room cannot be taken over', async () => {
  const link = fresh(); await Link.register(link);
  const stranger = { roomId: link.roomId, key: 'not-the-key', api: base };
  await assert.rejects(Link.readSnapshot(stranger, 0), error => error.status === 403);
  await assert.rejects(Link.readSnapshot({ ...fresh() }, 0), error => error.status === 404 && error.gone);
  await assert.rejects(Link.register({ ...stranger }), error => error.status === 409);
  assert.equal((await Link.register(link)).existing, true, 'the same tablet can register again after a restart');
});

test('limits: big bodies, bad room codes, and only the app files are served', async () => {
  const link = fresh(); await Link.register(link);
  const big = await fetch(`${base}/api/rooms/${fresh().roomId}`, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ iv: 'a', data: 'x'.repeat(70000) }) });
  assert.equal(big.status, 413);
  assert.equal((await fetch(`${base}/api/rooms/bad!/snapshot`)).status, 400);
  assert.equal((await fetch(`${base}/index.html`)).status, 200);
  assert.equal((await fetch(`${base}/lead-phone.html`)).status, 200);
  for (const hidden of ['/server/server.mjs', '/tests/server.test.mjs', '/package.json', '/../render.yaml']) assert.equal((await fetch(base + hidden)).status, 404, hidden);
  const preflight = await fetch(`${base}/api/rooms/${link.roomId}`, { method: 'OPTIONS', headers: { origin: 'https://helper-jobs.onrender.com' } });
  assert.equal(preflight.headers.get('access-control-allow-origin'), 'https://helper-jobs.onrender.com');
  const stranger = await fetch(`${base}/api/rooms/${link.roomId}`, { method: 'OPTIONS', headers: { origin: 'https://evil.example' } });
  assert.equal(stranger.headers.get('access-control-allow-origin'), null);
});

test('a backup room takes a bigger locked copy; a normal room does not; family rooms can wait longer', async () => {
  const big = { size: 120 * 1024 };
  const normal = fresh(); await Link.register(normal);
  await assert.rejects(Link.pushSnapshot(normal, { pad: 'x'.repeat(big.size) }), error => error.status === 413);
  const backup = { ...fresh(), size: 'large', keepDays: 14 }; await Link.register(backup);
  assert.equal((await Link.pushSnapshot(backup, { pad: 'x'.repeat(big.size) })).ok, true);
  const room = _rooms.get(backup.roomId);
  assert.equal(room.large, true); assert.equal(room.keepMs, 14 * 86400_000);
  const greedy = { ...fresh(), keepDays: 400 }; await Link.register(greedy);
  assert.equal(_rooms.get(greedy.roomId).keepMs, 14 * 86400_000, 'capped at 14 days');
});

test('static files answer Range requests, so the video can be skipped through', async () => {
  const whole = await fetch(`${base}/index.html`);
  const size = (await whole.arrayBuffer()).byteLength;
  const part = await fetch(`${base}/index.html`, { headers: { range: 'bytes=0-99' } });
  assert.equal(part.status, 206);
  assert.equal(part.headers.get('content-range'), `bytes 0-99/${size}`);
  assert.equal((await part.arrayBuffer()).byteLength, 100);
  const bad = await fetch(`${base}/index.html`, { headers: { range: `bytes=${size + 10}-` } });
  assert.equal(bad.status, 416);
});

test('waking a locked phone: only known alert services, no message, signed, and only with the room key', async () => {
  const { createServer } = await import('node:http');
  const { createPublicKey, verify } = await import('node:crypto');
  const { _vapid } = await import('../server/server.mjs');
  const hits = [];
  const fake = createServer((req, res) => { let n = 0; req.on('data', c => { n += c.length; }); req.on('end', () => { hits.push({ url: req.url, auth: req.headers.authorization, ttl: req.headers.ttl, urgency: req.headers.urgency, bytes: n }); res.writeHead(201); res.end(); }); });
  await new Promise(done => fake.listen(0, '127.0.0.1', done));
  const pushBase = `http://127.0.0.1:${fake.address().port}`;
  try {
    const key = (await (await fetch(`${base}/api/push-key`)).json()).key;
    assert.equal(key, _vapid()); assert.equal(Buffer.from(key, 'base64url').length, 65);
    const link = fresh(); await Link.register(link);
    await assert.rejects(Link.addPhone(link, 'https://evil.example.com/steal'), error => error.status === 400);
    await assert.rejects(Link.addPhone({ ...link, key: Link.newLink(base).key }, `${pushBase}/sub/1`), error => error.status === 403);
    assert.equal((await Link.addPhone(link, `${pushBase}/sub/1`)).phones, 1);
    const sent = await Link.wakePhones(link);
    assert.equal(sent.sent, 1);
    const hit = hits.at(-1);
    assert.equal(hit.url, '/sub/1'); assert.equal(hit.bytes, 0, 'no message in the push'); assert.equal(hit.urgency, 'high');
    const [, jwt, k] = /^vapid t=([^,]+), k=(.+)$/.exec(hit.auth);
    assert.equal(k, key);
    const [h, b, sig] = jwt.split('.');
    const claims = JSON.parse(Buffer.from(b, 'base64url'));
    assert.equal(claims.aud, pushBase);
    const pub = Buffer.from(key, 'base64url');
    const pk = createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: pub.subarray(1, 33).toString('base64url'), y: pub.subarray(33).toString('base64url') }, format: 'jwk' });
    assert.ok(verify('sha256', Buffer.from(`${h}.${b}`), { key: pk, dsaEncoding: 'ieee-p1363' }, Buffer.from(sig, 'base64url')), 'signature checks out');
    assert.equal((await Link.wakePhones(link)).waited, true, 'a second wake within 3 seconds waits');
    assert.equal((await Link.addPhone(link, `${pushBase}/sub/1`, true)).phones, 0);
  } finally { fake.close(); }
});
