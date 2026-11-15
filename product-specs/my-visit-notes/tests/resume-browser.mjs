import assert from 'node:assert/strict';
import {clickButton,buttonControl,openSection,revealControl,navigationHashes} from './navigation.mjs';
import {readFileSync, writeFileSync, mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import {resolve, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('../../../communication-tool/node_modules/playwright');
const dir = fileURLToPath(new URL('../', import.meta.url));
const tracked = ['app.mjs', 'model.mjs', 'intake.mjs', 'intake-model.mjs', 'index.html', 'styles.css', 'sw.js', 'preparation-model.mjs', 'tests/resume-browser.mjs'];
const sourceHashes = Object.fromEntries(tracked.map(f => [f, createHash('sha256').update(readFileSync(dir + f)).digest('hex')]));
const server = createServer((req, res) => {
  try {
    let path = new URL(req.url, 'http://local').pathname; if (path.endsWith('/')) path += 'index.html';
    const file = resolve(dir, '.' + path); if (!file.startsWith(dir)) throw Error();
    res.setHeader('Content-Type', ({'.mjs':'text/javascript','.js':'text/javascript','.html':'text/html','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'})[extname(file)] || 'text/plain');
    res.end(readFileSync(file));
  } catch { res.statusCode = 404; res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const url = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({headless: true});
const results = [], errors = [];
const click=(p,name)=>clickButton(p,name);
const data = p => p.evaluate(() => JSON.parse(localStorage.getItem('my-visit-notes.v1')));
async function choose(p, text, kind = 'Make this a question') {
  await p.locator('#intake-source').fill(text);
  await click(p, 'Select all source text'); await click(p, kind);
}
async function confirm(p) { await click(p, 'Review chosen passages'); await click(p, 'Confirm additions'); await p.locator('#dialog').waitFor({state:'hidden'}); }
async function save(p) { await click(p, 'Save on this device'); await click(p, 'Save this visit'); await p.waitForFunction(() => document.querySelector('#status').textContent.startsWith('Saved on')); }
async function run(id, name, fn) {
  const c = await browser.newContext({acceptDownloads:true, viewport:{width:390,height:844}});
  const p = await c.newPage(); p.on('pageerror', e => errors.push(e.message));
  try { await p.goto(url); await fn(p, c); results.push({id,name,passed:true}); console.log('PASS', id, name); }
  catch (e) { results.push({id,name,passed:false,error:e.stack}); console.error('FAIL', id, e.stack); }
  finally { await c.close(); }
}
async function keep(p) { await click(p,'Save this preparation on this device'); await click(p,'Save preparation'); await p.locator('#preparation-status').filter({hasText:'Preparation saved on this device'}).waitFor(); }
async function listing(p) { await openSection(p,'#preparations'); await click(p,'Open saved preparations'); }
try {
 await run('RP-01','Save permission, empty edits, named preparation and offline page return',async(p,c)=>{
  await click(p,'Bring existing notes');await choose(p,'Original passage');await p.getByLabel('Passage 1',{exact:true}).fill('');await p.getByLabel('Preparation name (optional)').fill('Fictional preparation');
  assert.equal(await data(p),null);await click(p,'Save this preparation on this device');await click(p,'Cancel / return');assert.equal(await data(p),null);
  await click(p,'Bring existing notes');await keep(p);assert.equal((await data(p)).visits.length,0);assert.equal((await data(p)).preparations[0].items[0].text,'');
  await p.getByLabel('Passage 1',{exact:true}).fill('Edited after saving');assert.match(await p.locator('#preparation-status').innerText(),/not saved/);await keep(p);
  await click(p,'Cancel / return');await p.waitForFunction(()=>document.querySelector('#offline').textContent.includes('are ready'));await c.setOffline(true);await p.reload();await listing(p);await click(p,'Resume Fictional preparation');
  assert.equal(await p.locator('#intake-source').inputValue(),'Original passage');assert.equal(await p.getByLabel('Passage 1',{exact:true}).inputValue(),'Edited after saving');
  await p.locator('#dialog-title').scrollIntoViewIfNeeded();await p.screenshot({path:dir+'qa/resume-preparation.png'});
 });
 await run('RP-02','Completion retains temporary result without separately saving a visit or repeating passages',async p=>{
  await click(p,'Bring existing notes');await choose(p,'Resume question');await choose(p,'PRIVATE resume detail','Keep as a private note');await p.getByLabel('Preparation name (optional)').fill('Finished draft');await keep(p);await confirm(p);
  let stored=await data(p);assert.equal(stored.visits.length,0);assert.equal(stored.preparations[0].items.length,0);assert.equal(stored.preparations[0].completed.length,1);assert.equal(stored.preparations[0].result.privateNotes,'PRIVATE resume detail');
  await p.reload();await listing(p);await p.locator('#dialog-title').scrollIntoViewIfNeeded();await p.screenshot({path:dir+'qa/resume-list.png'});await click(p,'Resume Finished draft');assert.match(await p.locator('#dialog-body').innerText(),/1 batches already added/);assert.equal(await p.getByLabel('Passage 1',{exact:true}).count(),0);await p.locator('#dialog-title').scrollIntoViewIfNeeded();await p.screenshot({path:dir+'qa/resume-completed.png'});
  await click(p,'Open last completed result');await click(p,'Open completed visit');assert.equal(await p.getByLabel('Question 1',{exact:true}).inputValue(),'Resume question');await save(p);
  stored=await data(p);assert.equal(stored.visits.length,1);assert.equal(stored.visits[0].questions.length,1);
 });
 await run('RP-03','Resumed saved destination uses latest content and saves completion atomically',async p=>{
  await click(p,'Try a fictional example');await save(p);await click(p,'Bring existing notes');await choose(p,'A new saved question');await p.locator('#intake-destination').selectOption('current');await p.getByLabel('Preparation name (optional)').fill('Saved target');await keep(p);await click(p,'Cancel / return');
  await p.getByLabel('Visit title (optional)').fill('Changed later');await p.waitForFunction(()=>JSON.parse(localStorage.getItem('my-visit-notes.v1')).visits[0].title==='Changed later');
  await p.reload();await listing(p);await click(p,'Resume Saved target');await click(p,'Review chosen passages');assert.match(await p.locator('#dialog-body').innerText(),/destination changed/);await click(p,'Confirm additions');await p.locator('#dialog').waitFor({state:'hidden'});
  const stored=await data(p);assert.equal(stored.visits[0].title,'Changed later');assert.equal(stored.visits[0].questions.length,4);assert.equal(stored.preparations[0].completed.length,1);assert.equal(stored.preparationReceipts.length,1);
 });
 await run('RP-04','Failed completion leaves both saved preparation and visit unchanged',async p=>{
  await click(p,'Try a fictional example');await save(p);await click(p,'Bring existing notes');await choose(p,'Must survive failure');await p.locator('#intake-destination').selectOption('current');await keep(p);const before=await data(p);
  await p.evaluate(()=>{window.realSet=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw Error('Test failure');};});await click(p,'Review chosen passages');await click(p,'Confirm additions');await p.getByText('Additions were not made.',{exact:false}).waitFor();assert.deepEqual(await data(p),before);
  await p.evaluate(()=>{Storage.prototype.setItem=window.realSet;});await click(p,'Return to source and selections');assert.equal(await p.getByLabel('Passage 1',{exact:true}).inputValue(),'Must survive failure');await confirm(p);assert.equal((await data(p)).visits[0].questions.length,4);
 });
 await run('RP-05','Private preparation backup includes edited choices; old pending backup cannot replay a receipt',async p=>{
  await click(p,'Bring existing notes');await choose(p,'Original words');await p.getByLabel('Passage 1',{exact:true}).fill('Edited backup words');await p.getByLabel('Preparation name (optional)').fill('Backup example');await keep(p);
  await click(p,'Download private preparation backup');const event=p.waitForEvent('download');await click(p,'Download preparation backup');const text=readFileSync(await (await event).path(),'utf8');assert.equal(JSON.parse(text).preparation.items[0].text,'Edited backup words');await click(p,'Return to preparation');await confirm(p);
  await p.reload();await listing(p);await p.locator('#preparation-import').setInputFiles({name:'prep.json',mimeType:'application/json',buffer:Buffer.from(text)});await click(p,'Open preparation backup');
  assert.match(await p.locator('#dialog-body').innerText(),/already added on this device/);await click(p,'Review chosen passages');assert.match(await p.locator('#dialog-body').innerText(),/already added/);assert.equal((await data(p)).preparationReceipts.length,1);
  const completedText=JSON.stringify({format:'my-visit-preparation-backup',version:1,preparation:(await data(p)).preparations[0]});
  const clean=await browser.newContext();try{const q=await clean.newPage();await q.goto(url);await listing(q);await q.locator('#preparation-import').setInputFiles({name:'complete.json',mimeType:'application/json',buffer:Buffer.from(completedText)});await click(q,'Open preparation backup');await keep(q);assert.equal((await data(q)).preparationReceipts.length,1);await click(q,'Saved preparations');await q.locator('#preparation-import').setInputFiles({name:'old-pending.json',mimeType:'application/json',buffer:Buffer.from(text)});await click(q,'Open preparation backup');assert.match(await q.locator('#dialog-body').innerText(),/already added on this device/);}finally{await clean.close();}
 });
 await run('RP-06','Deleting preparation preserves separately saved visit and can be cancelled',async p=>{
  await click(p,'Bring existing notes');await choose(p,'Keep visit');await p.getByLabel('Preparation name (optional)').fill('Delete example');await keep(p);await confirm(p);await save(p);const before=(await data(p)).visits;
  await listing(p);await click(p,'Delete preparation Delete example');await click(p,'Cancel / return');assert.equal((await data(p)).preparations.length,1);
  await click(p,'Open saved preparations');await click(p,'Delete preparation Delete example');await click(p,'Delete saved preparation');await p.waitForFunction(()=>JSON.parse(localStorage.getItem('my-visit-notes.v1')).preparations.length===0);assert.equal((await data(p)).preparations.length,0);assert.deepEqual((await data(p)).visits,before);assert.equal((await data(p)).preparationReceipts.length,1);
 });
 await run('RP-07','Complete browser restart offline restores saved choices and completed results',async()=>{
  const profile=mkdtempSync(resolve(tmpdir(),'visit-preparation-'));let c=await chromium.launchPersistentContext(profile,{headless:true,acceptDownloads:true});
  try{
   let p=await c.newPage();await p.goto(url);await click(p,'Bring existing notes');await choose(p,'Restart question');await p.getByLabel('Preparation name (optional)').fill('Restart preparation');await keep(p);await click(p,'Cancel / return');await p.waitForFunction(()=>document.querySelector('#offline').textContent.includes('are ready'));await c.close();
   c=await chromium.launchPersistentContext(profile,{headless:true,offline:true,acceptDownloads:true});p=await c.newPage();await p.goto(url);await listing(p);await click(p,'Resume Restart preparation');assert.equal(await p.getByLabel('Passage 1',{exact:true}).inputValue(),'Restart question');await confirm(p);await c.close();
   c=await chromium.launchPersistentContext(profile,{headless:true,offline:true,acceptDownloads:true});p=await c.newPage();await p.goto(url);await listing(p);await click(p,'Resume Restart preparation');assert.equal(await p.getByLabel('Passage 1',{exact:true}).count(),0);await click(p,'Open last completed result');await click(p,'Open completed visit');assert.equal(await p.getByLabel('Question 1',{exact:true}).inputValue(),'Restart question');assert.equal((await data(p)).preparationReceipts.length,1);
  }finally{await c.close();}
 });
 await run('RP-08','Cancelled or interrupted queued completion never leaves a half-applied saved record',async(p,c)=>{
  await click(p,'Try a fictional example');await save(p);await click(p,'Bring existing notes');await choose(p,'Pending batch');await p.locator('#intake-destination').selectOption('current');await p.getByLabel('Preparation name (optional)').fill('Interrupted');await keep(p);const before=await data(p);await click(p,'Review chosen passages');
  await p.evaluate(()=>{navigator.locks.request('my-visit-notes.v1',()=>new Promise(r=>{window.releasePrepLock=r;window.prepLockHeld=true;}));});await p.waitForFunction(()=>window.prepLockHeld);await click(p,'Confirm additions');await click(p,'Cancel / return');await p.evaluate(()=>window.releasePrepLock());await p.evaluate(()=>navigator.locks.request('my-visit-notes.v1',()=>{}));assert.deepEqual(await data(p),before);
  await click(p,'Bring existing notes');await click(p,'Review chosen passages');await p.evaluate(()=>{window.prepLockHeld=false;navigator.locks.request('my-visit-notes.v1',()=>new Promise(()=>{window.prepLockHeld=true;}));});await p.waitForFunction(()=>window.prepLockHeld);await click(p,'Confirm additions');await p.close();
  const q=await c.newPage();await q.goto(url);assert.deepEqual(await data(q),before);await listing(q);await click(q,'Resume Interrupted');await confirm(q);assert.equal((await data(q)).visits[0].questions.length,4);assert.equal((await data(q)).preparations[0].items.length,0);
 });
 await run('RP-09','Failed first save stays temporary; private backup restores to a clean browser',async p=>{
  await click(p,'Bring existing notes');await choose(p,'Recovery words');await p.getByLabel('Use passage 1 as',{exact:true}).selectOption('private');await p.getByLabel('Preparation name (optional)').fill('Recovery preparation');
  await p.evaluate(()=>{Storage.prototype.setItem=function(){throw Error('No storage');};});await click(p,'Save this preparation on this device');await click(p,'Save preparation');await p.getByRole('alert').filter({hasText:'not saved'}).waitFor();assert.equal(await data(p),null);await click(p,'Return to preparation');await click(p,'Download private preparation backup');const event=p.waitForEvent('download');await click(p,'Download preparation backup');const text=readFileSync(await (await event).path(),'utf8');
  const clean=await browser.newContext();try{const q=await clean.newPage();await q.goto(url);await listing(q);await q.locator('#preparation-import').setInputFiles({name:'prep.json',mimeType:'application/json',buffer:Buffer.from(text)});await click(q,'Open preparation backup');assert.equal(await data(q),null);assert.equal(await q.getByLabel('Use passage 1 as',{exact:true}).inputValue(),'private');await keep(q);await confirm(q);assert.equal((await data(q)).preparations[0].result.privateNotes,'Recovery words');}finally{await clean.close();}
 });
 await run('RP-10','Multiple preparations, replacement cancellation and pending edits are kept separate',async p=>{
  await click(p,'Bring existing notes');await choose(p,'First');await p.getByLabel('Preparation name (optional)').fill('First preparation');await keep(p);await click(p,'Start another preparation');await choose(p,'Second');await p.getByLabel('Preparation name (optional)').fill('Second preparation');await keep(p);
  await p.getByLabel('Passage 1',{exact:true}).fill('Second unsaved');await click(p,'Saved preparations');await click(p,'Resume First preparation');await click(p,'Cancel / return');await click(p,'Bring existing notes');assert.equal(await p.getByLabel('Passage 1',{exact:true}).inputValue(),'Second unsaved');await keep(p);
  await click(p,'Saved preparations');await click(p,'Resume First preparation');assert.equal(await p.getByLabel('Passage 1',{exact:true}).inputValue(),'First');assert.equal((await data(p)).preparations.length,2);
 });
 await run('RP-11','Conflicting tabs cannot overwrite preparation; missing visit asks for a new destination',async(p,c)=>{
  await click(p,'Try a fictional example');await save(p);await click(p,'Bring existing notes');await choose(p,'Conflict question');await p.locator('#intake-destination').selectOption('current');await p.getByLabel('Preparation name (optional)').fill('Conflict preparation');await keep(p);
  const q=await c.newPage();await q.goto(url);await listing(q);await click(q,'Resume Conflict preparation');await q.getByLabel('Passage 1',{exact:true}).fill('Newer selection');await keep(q);
  await p.locator('#preparation-status').filter({hasText:'Saved data changed in another tab'}).waitFor();await p.getByLabel('Passage 1',{exact:true}).fill('Older tab selection');await click(p,'Save this preparation on this device');await click(p,'Save preparation');await p.getByRole('alert').filter({hasText:'not saved'}).waitFor();assert.equal((await data(p)).preparations[0].items[0].text,'Newer selection');
  await click(q,'Cancel / return');await openSection(q,'#saved');await q.locator('[data-open]').click();await openSection(q,'#recovery-tools');await click(q,'Delete this visit');await click(q,'Delete permanently');await q.reload();await listing(q);await click(q,'Resume Conflict preparation');await click(q,'Review chosen passages');assert.match(await q.locator('#dialog-body').innerText(),/no longer available/);assert.equal((await data(q)).preparations.length,1);
 });
 await run('RP-12','Keyboard save, narrow layout, private-source isolation and invalid restore',async p=>{
  const requests=[];p.on('request',r=>requests.push({url:r.url(),method:r.method(),body:r.postData()}));await click(p,'Bring existing notes');await choose(p,'Visible question');await p.locator('#intake-source').fill('PRIVATE_PREPARATION_CANARY');
  const saveButton=p.getByRole('button',{name:'Save this preparation on this device',exact:true});await saveButton.focus();await p.keyboard.press('Enter');await p.getByRole('button',{name:'Save preparation',exact:true}).focus();await p.keyboard.press('Enter');await p.locator('#preparation-status').filter({hasText:'Preparation saved'}).waitFor();
  for(const width of [320,390,844]){await p.setViewportSize({width,height:640});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.equal(await p.locator('#dialog').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);}
  await confirm(p);await save(p);await click(p,'4. After the visit');await click(p,'Preview selected summary');assert.doesNotMatch(await p.locator('#dialog-body').innerText(),/PRIVATE_PREPARATION_CANARY/);await click(p,'Cancel / return');await click(p,'Download a full backup');const event=p.waitForEvent('download');await click(p,'Download private backup');assert.doesNotMatch(readFileSync(await (await event).path(),'utf8'),/PRIVATE_PREPARATION_CANARY/);await click(p,'Cancel / return');
  await listing(p);const before=await data(p);await p.locator('#preparation-import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{bad')});await p.getByRole('alert').filter({hasText:'Could not restore'}).waitFor();assert.deepEqual(await data(p),before);assert.ok(requests.every(r=>r.url.startsWith(url)&&r.method==='GET'&&!r.body&&!r.url.includes('PRIVATE_PREPARATION_CANARY')));
 });
 await run('RP-13','Switching open visits cannot redirect preparation; editing completed preparation remains unsaved until requested',async p=>{
  await click(p,'Try a fictional example');await p.getByLabel('Visit title (optional)').fill('Destination A');await save(p);const id=(await data(p)).visits[0].id;
  await click(p,'Bring existing notes');await choose(p,'Only for A');await p.locator('#intake-destination').selectOption('current');await p.getByLabel('Preparation name (optional)').fill('Attached to A');await keep(p);await click(p,'Cancel / return');
  await click(p,'New visit');await p.getByLabel('Visit title (optional)').fill('Destination B');await save(p);await click(p,'Bring existing notes');assert.equal(await p.locator('#intake-destination').inputValue(),'saved:'+id);await confirm(p);
  assert.equal(await p.getByLabel('Visit title (optional)').inputValue(),'Destination B');let stored=await data(p);assert.equal(stored.visits[0].questions.length,4);assert.equal(stored.visits[1].questions.length,0);
  await click(p,'Bring existing notes');await p.getByLabel('Preparation name (optional)').fill('Renamed after completion');assert.equal((await data(p)).preparations[0].name,'Attached to A');await keep(p);stored=await data(p);assert.equal(stored.preparations[0].name,'Renamed after completion');assert.equal(stored.preparationReceipts.length,1);
 });
} finally {
 await browser.close();await new Promise(r=>server.close(r));
 writeFileSync(dir+'qa/resume-results.json',JSON.stringify({navigationSourceHashes:navigationHashes(),date:new Date().toISOString(),results,pageErrors:errors,sourceHashes},null,2));
}
if(results.some(r=>!r.passed)||errors.length)process.exitCode=1;
