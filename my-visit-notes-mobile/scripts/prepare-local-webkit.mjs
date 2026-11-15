// Ubuntu 24.04 x64 helper. Download/extract libraries in a new temporary folder;
// never install packages, run maintainer scripts, or change host permissions.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';

assert.equal(process.platform,'linux');assert.equal(process.arch,'x64');
assert.match(readFileSync('/etc/os-release','utf8'),/VERSION_ID="24\.04"/);
if(!process.argv.includes('--prepare'))throw Error('Pass --prepare to download WebKit runtime libraries into a fresh temporary directory.');
const {deps}=createRequire(import.meta.url)('../../communication-tool/node_modules/playwright-core/lib/server/registry/nativeDeps.js');
const requested=[...new Set(deps['ubuntu24.04-x64'].webkit)];
const simulation=execFileSync('apt-get',['-s','--no-install-recommends','install',...requested],{encoding:'utf8',maxBuffer:16*1024*1024});
if(/^Remv /m.test(simulation)||/^Inst \S+ \[/m.test(simulation))throw Error('This dependency plan includes removals or upgrades. Review it separately; nothing was installed.');
const packages=[...simulation.matchAll(/^Inst (\S+) \((\S+)/gm)].map(m=>`${m[1]}=${m[2]}`);
const directory=mkdtempSync(join(tmpdir(),'my-visit-webkit-libs-'));
const root=join(directory,'root');mkdirSync(root);
console.log(`Preparing ${packages.length} packages in ${directory}; system installation is unchanged.`);
if(packages.length)execFileSync('apt-get',['download',...packages],{cwd:directory,stdio:'pipe',maxBuffer:16*1024*1024});
for(const name of readdirSync(directory).filter(n=>n.endsWith('.deb'))){
 execFileSync('dpkg-deb',['--extract',join(directory,name),root],{stdio:'pipe'});
}
const libraryPath=[join(root,'usr/lib/x86_64-linux-gnu'),join(root,'lib/x86_64-linux-gnu'),join(root,'usr/lib/x86_64-linux-gnu/blas'),join(root,'usr/lib/x86_64-linux-gnu/lapack'),process.env.LD_LIBRARY_PATH].filter(Boolean).join(':');
const evidence={date:new Date().toISOString(),directory,packages,environment:{LD_LIBRARY_PATH:libraryPath,GST_PLUGIN_PATH_1_0:join(root,'usr/lib/x86_64-linux-gnu/gstreamer-1.0')},limits:['No system packages installed','WebKit Linux is not native iOS validation']};
writeFileSync(join(directory,'environment.json'),JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({environmentFile:join(directory,'environment.json'),...evidence.environment},null,2));
