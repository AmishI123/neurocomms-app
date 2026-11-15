import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';

const root=fileURLToPath(new URL('../',import.meta.url));
const manifest=JSON.parse(readFileSync(resolve(root,'dist/bundle-manifest.json')));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const apk=process.argv[2];
let extracted;
if(apk){
 extracted=mkdtempSync(join(tmpdir(),'visit-apk-audit-'));
 const jar=process.env.JAVA_HOME?join(process.env.JAVA_HOME,'bin/jar'):'jar';
 execFileSync(jar,['xf',resolve(apk),...Object.keys(manifest.files).map(file=>'assets/public/'+file)],{cwd:extracted});
}
for(const [file,expected] of Object.entries(manifest.files)){
 for(const folder of ['../product-specs/my-visit-notes','dist','android/app/src/main/assets/public','ios/App/App/public']){
  assert.equal(hash(readFileSync(resolve(root,folder,file))),expected,`Stale asset: ${folder}/${file}`);
 }
 if(apk)assert.equal(hash(readFileSync(resolve(extracted,'assets/public',file))),expected,`Stale APK asset: ${file}`);
}
console.log(`${Object.keys(manifest.files).length} assets match source, bundle, Android, iOS${apk?' and APK':''}. This checks packaged files, not native runtime behavior.`);
