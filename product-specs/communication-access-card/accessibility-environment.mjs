import {execFileSync} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root = resolve(new URL('.', import.meta.url).pathname);
const command = name => {
  try { return execFileSync('bash', ['-lc', `command -v ${name}`], {encoding:'utf8'}).trim() || null; }
  catch { return null; }
};
const report = {
  schemaVersion: 1,
  checkedAt: new Date().toISOString(),
  browserAccessibilityTree: true,
  screenReaderExecution: false,
  switchAccessExecution: false,
  nativeAndroidAssistiveTechnology: false,
  nativeIosAssistiveTechnology: false,
  availableTools: {orca:command('orca'), espeak:command('espeak'), espeakNg:command('espeak-ng'), xdotool:command('xdotool'), adb:command('adb')},
  axeCoreInstalled: Boolean(command('axe')),
  interpretation: 'The browser accessibility tree and browser keyboard tests are available. Screen-reader, switch-access, native Android, and native iOS sessions are not claimed from this host.'
};
const output = process.argv.find(value => value.startsWith('--output='))?.slice('--output='.length) || '/tmp/communication-card-accessibility-environment.json';
mkdirSync(resolve(output, '..'), {recursive:true});
writeFileSync(output, `${JSON.stringify(report,null,2)}\n`);
console.log(JSON.stringify(report,null,2));
