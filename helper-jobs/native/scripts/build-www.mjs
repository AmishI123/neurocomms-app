// Copies the Helper Jobs web app into www/ for the Android and iPad apps.
// The app uses the very same pages as the website; only the slides, video, tests and server stay out.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const app = join(here, '..', '..');
const www = join(here, '..', 'www');
const SKIP = new Set(['native', 'tests', 'server', 'presentation', 'presentation.html', 'handout.html', 'README.md', 'package.json', 'package-lock.json', 'node_modules', 'sw.js']);

rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });
let files = 0, bytes = 0;
for (const name of readdirSync(app)) {
  if (SKIP.has(name) || name.startsWith('.')) continue;
  cpSync(join(app, name), join(www, name), { recursive: true });
}
const walk = dir => { for (const n of readdirSync(dir)) { const p = join(dir, n); const s = statSync(p); if (s.isDirectory()) walk(p); else { files += 1; bytes += s.size; } } };
walk(www);
for (const must of ['index.html', 'native.js', 'app.js', 'store.js', 'link.js']) if (!existsSync(join(www, must))) throw new Error(`www is missing ${must}`);
writeFileSync(join(www, 'app-build.json'), JSON.stringify({ builtAt: new Date().toISOString(), files }, null, 1));
console.log(`www: ${files} files, ${(bytes / 1024).toFixed(0)} KB`);
