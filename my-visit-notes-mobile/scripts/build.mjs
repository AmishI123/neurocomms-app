import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {createHash} from 'node:crypto';

const root=fileURLToPath(new URL('../',import.meta.url));
const source=resolve(root,'../product-specs/my-visit-notes');
// Only application assets belong in an installed app. Research, test fixtures,
// presentations and release archives are deliberately absent from this list.
const files=[
 'index.html','styles.css','app.mjs','model.mjs','intake.mjs','intake-model.mjs',
 'preparation-model.mjs','recovery-model.mjs','recovery-ui.mjs','followup-record.mjs',
 'followup-model.mjs','followup-ui.mjs','transfer-record.mjs','transfer-model.mjs',
 'transfer-ui.mjs','display.mjs','install.mjs','help.html','after-review-help.html',
 'manifest.webmanifest','icon.svg','icons/icon-180.png','icons/icon-192.png',
 'icons/icon-512.png','conversation-ui.mjs','journey-ui.mjs','draft-record.mjs',
 'draft-model.mjs','draft-ui.mjs','next-appointment-model.mjs',
 'next-appointment-ui.mjs','after-review-model.mjs','platform.mjs','sw.js','PRD.md'
];
const hashes={};
for(const file of files){
 const destination=resolve(root,'dist',file);
 await mkdir(dirname(destination),{recursive:true});
 await copyFile(resolve(source,file),destination);
 hashes[file]=createHash('sha256').update(await readFile(destination)).digest('hex');
}
await writeFile(resolve(root,'dist/bundle-manifest.json'),JSON.stringify({source:'../product-specs/my-visit-notes',files:hashes},null,2)+'\n');
console.log(`Bundled ${files.length} My Visit Notes assets.`);
