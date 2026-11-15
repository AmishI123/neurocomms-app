import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {validate} from '../beta/validate-record.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const template=JSON.parse(readFileSync(resolve(root,'beta/record-template.json'),'utf8'));
assert.deepEqual(validate({...template,runDate:'2026-09-16',buildHash:'abc123'}),[]);
assert.match(validate({...template,runDate:'2026-09-16',note:'PRIVATE'}).join('\n'),/note is not allowed/);
assert.match(validate({...template,runDate:'2026-09-16',surface:'phone'}).join('\n'),/surface/);
assert.match(validate({...template,runDate:'2026-09-16',tasks:{...template.tasks,'4':'native-pass'} }).join('\n'),/tasks\.4/);
assert.match(validate({...template,runDate:'2026-09-16',evidencePaths:['/tmp/private.png']}).join('\n'),/evidencePaths/);
console.log('PASS beta record validation, privacy-key rejection and task-state rules');
