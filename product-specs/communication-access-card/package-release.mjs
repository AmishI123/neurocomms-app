import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const project = resolve(new URL('.', import.meta.url).pathname);
const repo = resolve(project, '../..');
const output = join(repo, 'artifacts', 'communication-access-card');
const files = [
  'index.html', 'styles.css', 'app.js', 'sw.js', 'README.md', 'PRD.md',
  'verification.md', 'accessibility-environment.mjs', 'tests/communication-access-card.test.cjs', 'tests/acceptance.test.cjs', 'tests/accessibility.test.cjs', 'tests/keyboard-flow.test.cjs', 'tests/aria-tree.test.cjs', 'tests/accessibility-environment.test.cjs'
];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const contents = new Map(files.map(file => [file, readFileSync(join(project, file))]));
const entries = files.map(file => ({ file, bytes: contents.get(file).length, sha256: hash(contents.get(file)) }));
const runtimeId = hash(JSON.stringify(entries));

function buildArchive() {
  const directory = mkdtempSync(join(tmpdir(), 'communication-card-package-'));
  try {
    for (const [file, bytes] of contents) {
      const target = join(directory, file);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, bytes, { mode: 0o644 });
    }
    const tar = execFileSync('tar', [
      '--format=ustar', '--sort=name', '--mtime=@0', '--owner=0', '--group=0',
      '--numeric-owner', '--mode=0644', '-cf', '-', '-C', directory, '--', ...files
    ], { maxBuffer: 32 * 1024 * 1024 });
    return gzipSync(tar, { level: 9, mtime: 0 });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

const first = buildArchive();
const second = buildArchive();
if (!first.equals(second)) throw new Error('Independent package builds differ.');
for (const entry of entries) {
  if (hash(readFileSync(join(project, entry.file))) !== entry.sha256) throw new Error(`Source changed while packaging: ${entry.file}`);
}

const archive = `communication-access-card-${runtimeId.slice(0, 16)}.tar.gz`;
const manifest = {
  schemaVersion: 1,
  artifactType: 'communication-access-card-standalone-release',
  runtimeId,
  archive: { file: archive, bytes: first.length, sha256: hash(first) },
  reproducibleIndependentBuilds: 2,
  files: entries,
  boundary: {
    includesUserData: false,
    includesSecrets: false,
    nativeExecutionClaimed: false,
    participantEvidenceIncluded: false,
    interpretation: 'A reproducible web package with engineering checks; not evidence of usefulness, clinical benefit, store approval, or public deployment.'
  }
};
mkdirSync(output, { recursive: true });
writeFileSync(join(output, archive), first);
writeFileSync(join(output, `${archive}.manifest.json`), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ output: join(output, archive), manifest: join(output, `${archive}.manifest.json`), runtimeId, archiveSha256: manifest.archive.sha256, files: files.length, reproducible: true }, null, 2));
