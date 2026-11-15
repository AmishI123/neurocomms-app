import assert from 'node:assert/strict';
import {clickButton,buttonControl,openSection,revealControl,navigationHashes} from './navigation.mjs';
import {readFileSync, writeFileSync} from 'node:fs';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import {resolve, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('../../../communication-tool/node_modules/playwright');
const dir = fileURLToPath(new URL('../', import.meta.url));
const tracked = ['app.mjs', 'model.mjs', 'intake.mjs', 'intake-model.mjs', 'index.html', 'styles.css', 'sw.js', 'tests/intake-browser.mjs'];
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
try {
  await run('IN-01', 'Choose, review, save, reopen offline; source excluded and private summary boundary', async (p,c) => {
    await click(p, 'Bring existing notes');
    await choose(p, 'Ask about the next visit'); await choose(p, 'Call the desk', 'Make this a next step'); await choose(p, 'PRIVATE detail', 'Keep as a private note');
    await p.locator('#intake-source').fill('UNSELECTED SOURCE');
    assert.equal(await data(p), null);
    await p.screenshot({path:dir+'qa/intake-selection.png'});
    await click(p, 'Review chosen passages'); assert.match(await p.locator('#dialog-body').innerText(), /PRIVATE detail/);
    await p.screenshot({path:dir+'qa/intake-review.png'});
    await click(p, 'Confirm additions'); await p.locator('#dialog').waitFor({state:'hidden'});
    assert.equal(await p.getByLabel('Question 1', {exact:true}).inputValue(), 'Ask about the next visit');
    await save(p); const stored = await data(p); assert.doesNotMatch(JSON.stringify(stored), /UNSELECTED SOURCE/); assert.equal(stored.visits[0].privateNotes, 'PRIVATE detail');
    await click(p, '4. After the visit'); await click(p, 'Preview selected summary'); assert.doesNotMatch(await p.locator('#dialog-body').innerText(), /PRIVATE detail|Call the desk/);
    await click(p, 'Cancel / return'); await p.locator('[data-share-action]').check(); await click(p, 'Preview selected summary'); assert.match(await p.locator('#dialog-body').innerText(), /Call the desk/);
    await click(p, 'Cancel / return'); await click(p, 'Bring existing notes'); assert.equal(await p.locator('#intake-source').inputValue(), 'UNSELECTED SOURCE'); assert.equal(await p.getByLabel('Passage 1',{exact:true}).count(), 0);
    await click(p, 'Clear this working area'); await click(p, 'Clear temporary notes'); await click(p, 'Cancel / return');
    await p.evaluate(async () => { await navigator.serviceWorker.ready; });
    await c.setOffline(true); await p.reload(); await click(p, 'Open a saved visit'); await p.locator('[data-open]').click(); assert.equal(await p.getByLabel('Question 1',{exact:true}).inputValue(), 'Ask about the next visit');
    await click(p, 'Bring existing notes'); await choose(p, 'Offline addition'); await p.locator('#intake-destination').selectOption('current'); await confirm(p);
    await p.waitForFunction(() => JSON.parse(localStorage.getItem('my-visit-notes.v1')).visits[0].questions.length === 2);
  });
  await run('IN-02', 'Duplicate defaults, deliberate duplicate, cancellation and preserved open content', async p => {
    await click(p, 'Prepare my visit'); await click(p, 'Add question'); await p.getByLabel('Question 1',{exact:true}).fill('Keep this');
    await click(p, 'Bring existing notes'); await choose(p, 'Keep this'); await p.locator('#intake-destination').selectOption('current');
    await click(p, 'Review chosen passages'); assert.match(await p.locator('#dialog-body').innerText(), /Skip/);
    await click(p, 'Confirm additions'); assert.match(await p.locator('#dialog-body').innerText(), /Nothing new/);
    await p.getByLabel('Add matching passage 1 anyway').check(); await click(p, 'Confirm additions'); await p.locator('#dialog').waitFor({state:'hidden'});
    assert.equal(await p.locator('[data-q][data-field="text"]').count(),2);
    await click(p, 'Bring existing notes'); await choose(p, 'Do not add'); await click(p, 'Review chosen passages'); await click(p, 'Cancel / return');
    assert.equal(await p.locator('[data-q][data-field="text"]').count(),2);
    await click(p, 'Bring existing notes'); assert.equal(await p.getByLabel('Passage 1',{exact:true}).inputValue(), 'Do not add');
  });
  await run('IN-03', 'Text file validation and source replacement leave chosen passages intact', async p => {
    await click(p, 'Bring existing notes'); await choose(p, 'Old source');
    const file = p.getByLabel('Open a plain-text file');
    await file.setInputFiles({name:'no.pdf',mimeType:'application/pdf',buffer:Buffer.from('no')}); await p.getByText('Choose a .txt file.',{exact:false}).waitFor();
    await file.setInputFiles({name:'bad.txt',mimeType:'text/plain',buffer:Buffer.from([255])}); await p.getByText('This file is not readable UTF-8 text.',{exact:false}).waitFor();
    await file.setInputFiles({name:'good.txt',mimeType:'text/plain',buffer:Buffer.from('New source\r\nSecond line')});
    await click(p, 'Replace source text'); assert.equal(await p.locator('#intake-source').inputValue(),'New source\nSecond line'); assert.equal(await p.getByLabel('Passage 1',{exact:true}).inputValue(),'Old source');
  });
  await run('IN-04', 'Append to another saved visit without replacing the open draft', async p => {
    await click(p, 'Try a fictional example'); await save(p); const before = (await data(p)).visits[0];
    await click(p, 'New visit'); await p.getByLabel('Visit title (optional)').fill('Keep my unsaved draft');
    await click(p, 'Bring existing notes'); await choose(p, 'Extra saved question'); await p.locator('#intake-destination').selectOption('saved:'+before.id); await confirm(p);
    const after = (await data(p)).visits[0]; assert.deepEqual(after.questions.slice(0,3), before.questions); assert.equal(after.questions[3].text, 'Extra saved question');
    assert.equal(await p.getByLabel('Visit title (optional)').inputValue(), 'Keep my unsaved draft'); assert.match(await p.locator('#status').innerText(), /Temporary/);
    await click(p, 'Bring existing notes'); assert.equal(await p.getByLabel('Passage 1',{exact:true}).count(),0);
  });
  await run('IN-05', 'Failed saved-target write is atomic and retains selections; retry adds once', async p => {
    await click(p, 'Try a fictional example'); await save(p); const before = await data(p);
    await click(p, 'New visit'); await click(p, 'Bring existing notes'); await choose(p, 'Retry once'); await p.locator('#intake-destination').selectOption('saved:'+before.visits[0].id); await click(p, 'Review chosen passages');
    await p.evaluate(() => { window.originalSet = Storage.prototype.setItem; Storage.prototype.setItem = function(){throw Error('Fictional storage failure');}; });
    await click(p, 'Confirm additions'); await p.getByText('Additions were not made.',{exact:false}).waitFor(); assert.deepEqual(await data(p), before);
    await p.evaluate(() => { Storage.prototype.setItem = window.originalSet; });
    await click(p, 'Return to source and selections'); assert.equal(await p.getByLabel('Passage 1',{exact:true}).inputValue(),'Retry once'); await confirm(p);
    assert.equal((await data(p)).visits[0].questions.filter(q=>q.text==='Retry once').length,1);
  });
  await run('IN-06', 'Failed open-visit autosave retains recoverable additions without repeating the batch', async p => {
    await click(p, 'Try a fictional example'); await save(p); const before = await data(p);
    await click(p, 'Bring existing notes'); await choose(p, 'Keep failed edit'); await p.locator('#intake-destination').selectOption('current');
    await p.evaluate(() => { Storage.prototype.setItem = function(){throw Error('Fictional storage failure');}; }); await confirm(p);
    await p.waitForFunction(()=>document.querySelector('#status').textContent.includes('Not saved'));
    assert.deepEqual(await data(p), before); assert.equal(await p.getByLabel('Question 4',{exact:true}).inputValue(),'Keep failed edit');
    await click(p, 'Download a full backup'); const event = p.waitForEvent('download'); await click(p, 'Download private backup'); const text = readFileSync(await (await event).path(),'utf8'); assert.equal(JSON.parse(text).visit.questions[3].text,'Keep failed edit');
    await click(p, 'Cancel / return'); await click(p, 'Bring existing notes'); assert.equal(await p.getByLabel('Passage 1',{exact:true}).count(),0);
  });
  await run('IN-07', 'Another tab invalidates a saved-target preview instead of overwriting newer work', async (p,c) => {
    await click(p, 'Try a fictional example'); await save(p); const before = await data(p);
    await click(p, 'New visit'); await click(p, 'Bring existing notes'); await choose(p, 'Stale addition'); await p.locator('#intake-destination').selectOption('saved:'+before.visits[0].id); await click(p, 'Review chosen passages');
    const other = await c.newPage(); await other.goto(url); await click(other,'Open a saved visit'); await other.locator('[data-open]').click(); await other.getByLabel('Visit title (optional)').fill('Newer title'); await other.waitForFunction(()=>JSON.parse(localStorage.getItem('my-visit-notes.v1')).visits[0].title==='Newer title');
    await p.waitForFunction(()=>document.querySelector('#status').textContent.includes('another tab')); await click(p,'Confirm additions'); await p.getByText('Saved data changed in another tab. Keep a private preparation backup and reload before confirming.',{exact:true}).waitFor();
    assert.equal((await data(p)).visits[0].title,'Newer title'); assert.equal((await data(p)).visits[0].questions.length,3);
    await click(p,'Return to source and selections'); assert.equal(await p.getByLabel('Passage 1',{exact:true}).inputValue(),'Stale addition');
  });
  await run('IN-08', 'Backup restore and carry-forward retain selected content without copying private notes', async p => {
    await click(p,'Bring existing notes'); await choose(p,'Reusable question'); await choose(p,'Reusable step','Make this a next step'); await choose(p,'PRIVATE restored note','Keep as a private note'); await confirm(p);
    await click(p,'Download a full backup'); const event=p.waitForEvent('download'); await click(p,'Download private backup'); const text=readFileSync(await (await event).path(),'utf8'); await click(p,'Cancel / return');
    await openSection(p,'#saved'); await openSection(p,'#recovery-tools'); await p.locator('#import').setInputFiles({name:'visit.json',mimeType:'application/json',buffer:Buffer.from(text)}); await click(p,'Restore as new draft'); await save(p);
    const restored=(await data(p)).visits[0]; assert.equal(restored.privateNotes,'PRIVATE restored note'); assert.equal(restored.actions[0].text,'Reusable step');
    await openSection(p,'#saved');await p.locator('[data-carry]').click(); await p.locator('#dialog input').first().check(); await p.locator('#dialog input').last().check(); await click(p,'Preview new visit'); assert.doesNotMatch(await p.locator('#dialog-body').innerText(),/PRIVATE restored note/); await click(p,'Create new draft'); await save(p);
    const next=(await data(p)).visits[1]; assert.equal(next.privateNotes,''); assert.equal(next.questions[0].text,'Reusable question'); assert.equal(next.actions[0].text,'Reusable step'); assert.notEqual(next.questions[0].id,restored.questions[0].id);
  });
  await run('IN-09', 'Keyboard passage selection, editing, removing, focus return and narrow layout', async p => {
    await click(p,'Bring existing notes'); const source=p.locator('#intake-source'); await source.fill('Keep only this passage'); await source.focus(); await p.keyboard.press('Home'); await p.keyboard.press('Shift+End');
    await p.keyboard.press('Tab'); await p.keyboard.press('Tab'); assert.equal(await p.evaluate(()=>document.activeElement.textContent),'Make this a question'); await p.keyboard.press('Enter');
    await p.getByLabel('Passage 1',{exact:true}).fill('Edited passage'); await p.getByLabel('Use passage 1 as',{exact:true}).selectOption('private');
    await choose(p,'Remove me'); await click(p,'Remove passage 2'); assert.equal(await p.getByLabel('Passage 2',{exact:true}).count(),0);
    for(const width of [320,390,844]){await p.setViewportSize({width,height:640});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.equal(await p.locator('#dialog').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);}
    await click(p,'Review chosen passages'); assert.match(await p.locator('#dialog-body').innerText(),/Private note/); await click(p,'Confirm additions'); await p.locator('#dialog').waitFor({state:'hidden'}); await save(p); assert.equal((await data(p)).visits[0].privateNotes,'Edited passage'); assert.equal((await data(p)).visits[0].questions.length,0);
    await click(p,'Bring existing notes'); await p.keyboard.press('Escape'); await p.waitForFunction(()=>document.activeElement?.dataset.action==='bring-notes');
  });
  await run('IN-10', 'Private source download, leave warning, clear cancellation and no outbound content', async p => {
    const requests=[]; p.on('request',r=>requests.push({url:r.url(),method:r.method(),body:r.postData()}));
    await click(p,'Bring existing notes'); await choose(p,'PRIVATE_SOURCE_CANARY'); await p.getByLabel('Passage 1',{exact:true}).fill('Edited choice');
    const event=p.waitForEvent('download'); await click(p,'Download private source text'); assert.equal(readFileSync(await (await event).path(),'utf8'),'PRIVATE_SOURCE_CANARY');
    assert.equal(await p.evaluate(()=>window.dispatchEvent(new Event('beforeunload',{cancelable:true}))),false);
    await click(p,'Clear this working area'); await click(p,'Return to notes'); assert.equal(await p.getByLabel('Passage 1',{exact:true}).inputValue(),'Edited choice');
    await click(p,'Clear this working area'); await click(p,'Clear temporary notes'); assert.equal(await p.locator('#intake-source').inputValue(),''); assert.equal(await p.getByLabel('Passage 1',{exact:true}).count(),0);
    assert.equal(await p.evaluate(()=>window.dispatchEvent(new Event('beforeunload',{cancelable:true}))),true); assert.equal(await data(p),null);
    assert.ok(requests.every(r=>r.url.startsWith(url)&&r.method==='GET'&&!r.body&&!r.url.includes('PRIVATE_SOURCE_CANARY')));
  });
  await run('IN-11', 'Repeated confirmation adds once; cancelling a locked write prevents late additions', async p => {
    await click(p,'Try a fictional example'); await save(p); const target=(await data(p)).visits[0]; await click(p,'New visit');
    await click(p,'Bring existing notes'); await choose(p,'Only once'); await p.locator('#intake-destination').selectOption('saved:'+target.id); await click(p,'Review chosen passages');
    await p.evaluate(()=>{navigator.locks.request('my-visit-notes.v1',()=>new Promise(r=>{window.releaseIntakeLock=r;window.intakeLockHeld=true;}));}); await p.waitForFunction(()=>window.intakeLockHeld);
    await p.getByRole('button',{name:'Confirm additions',exact:true}).evaluate(e=>{e.click();e.click();}); await click(p,'Cancel / return'); await p.evaluate(()=>window.releaseIntakeLock());
    await p.evaluate(()=>navigator.locks.request('my-visit-notes.v1',()=>{})); assert.equal((await data(p)).visits[0].questions.length,3);
    await click(p,'Bring existing notes'); assert.equal(await p.getByLabel('Passage 1',{exact:true}).inputValue(),'Only once'); await click(p,'Review chosen passages');
    await p.getByRole('button',{name:'Confirm additions',exact:true}).evaluate(e=>{e.click();e.click();}); await p.locator('#dialog').waitFor({state:'hidden'});
    assert.equal((await data(p)).visits[0].questions.filter(q=>q.text==='Only once').length,1);
  });
  await run('IN-12', 'Empty edits, file size limit, partial selection, replacement cancellation and enlarged review', async p => {
    await click(p,'Bring existing notes'); await p.locator('#intake-source').fill('Before SELECT ONLY THIS after'); await p.locator('#intake-source').evaluate(e=>{e.focus();e.setSelectionRange(7,23);}); await click(p,'Make this a question');
    assert.equal(await p.getByLabel('Passage 1',{exact:true}).inputValue(),'SELECT ONLY THIS');
    await p.getByLabel('Passage 1',{exact:true}).fill('  '); await click(p,'Review chosen passages'); assert.match(await p.locator('#dialog-body').innerText(),/remove the empty one/); await p.getByLabel('Passage 1',{exact:true}).fill('LongWord'.repeat(100));
    await p.getByLabel('Open a plain-text file').setInputFiles({name:'large.txt',mimeType:'text/plain',buffer:Buffer.alloc(1024*1024+1,65)}); assert.match(await p.locator('#dialog-body').innerText(),/exceeds/);
    await p.getByLabel('Open a plain-text file').setInputFiles({name:'new.txt',mimeType:'text/plain',buffer:Buffer.from('Replace')}); await click(p,'Keep old source and return'); assert.equal(await p.locator('#intake-source').inputValue(),'Before SELECT ONLY THIS after');
    await click(p,'Review chosen passages'); await p.evaluate(()=>{document.body.style.zoom='2';}); await p.setViewportSize({width:320,height:640}); assert.equal(await p.locator('#dialog').evaluate(e=>e.scrollWidth>e.clientWidth+1),false); await click(p,'Cancel / return');
    assert.equal(await data(p),null);
  });
} finally {
  await browser.close(); await new Promise(r => server.close(r));
  writeFileSync(dir+'qa/intake-results.json', JSON.stringify({navigationSourceHashes:navigationHashes(),date:new Date().toISOString(),results,pageErrors:errors,sourceHashes},null,2));
}
if (results.some(r => !r.passed) || errors.length) process.exitCode = 1;
