import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(process.argv.find(value => value.startsWith('--root='))?.slice(7) || '.');
const manifestPath = resolve(process.argv.find(value => value.startsWith('--manifest='))?.slice(11) || join(root, 'manifest.json'));
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const failures = [];
const found = [];
const walk = directory => {
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else found.push(path.slice(root.length + 1).split('\\').join('/'));
  }
};
walk(root);
for (const expected of manifest.files) {
  const path = join(root, expected.file);
  if (!existsSync(path)) { failures.push(`missing:${expected.file}`); continue; }
  const bytes = readFileSync(path);
  if (bytes.length !== expected.bytes) failures.push(`bytes:${expected.file}`);
  if (hash(bytes) !== expected.sha256) failures.push(`hash:${expected.file}`);
}
const expectedNames = manifest.files.map(item => item.file).sort();
if (JSON.stringify(found.sort()) !== JSON.stringify(expectedNames)) failures.push('file-set-mismatch');
const runtimeId = hash(JSON.stringify(manifest.files));
if (runtimeId !== manifest.runtimeId) failures.push('runtime-id-mismatch');
if (!existsSync(join(root, 'index.html')) || !readFileSync(join(root, 'index.html'), 'utf8').includes('Communication access card')) failures.push('app-shell-missing');
if (!existsSync(join(root, 'sw.js')) || !readFileSync(join(root, 'sw.js'), 'utf8').includes('CACHE')) failures.push('service-worker-missing');
const result = { schemaVersion: 1, status: failures.length ? 'failed' : 'passed', runtimeId, expectedFiles: expectedNames.length, failures, exactFileSet: !failures.includes('file-set-mismatch') };
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
