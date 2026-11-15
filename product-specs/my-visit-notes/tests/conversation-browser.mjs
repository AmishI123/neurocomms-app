import assert from 'node:assert/strict';
import {clickButton,openSection} from './navigation.mjs';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import {extname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('../../../communication-tool/node_modules/playwright');
const dir=fileURLToPath(new URL('../',import.meta.url));
const server=createServer((req,res)=>{try{let path=new URL(req.url,'http://local').pathname;if(path.endsWith('/'))path+='index.html';const file=resolve(dir,'.'+path);if(!file.startsWith(dir))throw Error();res.setHeader('Content-Type',({'.mjs':'text/javascript','.js':'text/javascript','.html':'text/html','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'})[extname(file)]||'text/plain');res.end(readFileSync(file));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true}),results=[],errors=[];
const url=`http://127.0.0.1:${server.address().port}/`;
async function run(id,name,fn){const c=await browser.newContext({viewport:{width:320,height:800}});try{const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);const click=name=>clickButton(p,name);await fn(p,click,c);results.push({id,name,passed:true});console.log('PASS',id,name);}catch(e){results.push({id,name,passed:false,error:e.message});throw e;}finally{await c.close();}}
async function example(p,click){await click('Try a fictional example');}
async function choose(p,click,{all=false,request=false}={}){await click('Choose words for conversation view');const d=p.locator('#conversation');const checks=request?d.locator('label').filter({hasText:'Include this request'}).locator('input'):d.locator('label').filter({hasNotText:'Include this request'}).locator('input');if(all){for(const ch of await checks.all())await ch.check();}else await checks.first().check();await click('Preview chosen words');await click('Show chosen words');}
async function save(p,click){await click('Save on this device');await click('Save this visit');await p.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Saved on'));}
const data=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('my-visit-notes.v1')));
try{
 const page=await browser.newPage({viewport:{width:320,height:800}});page.on('pageerror',e=>errors.push(e.message));
 const click=name=>clickButton(page,name);
 await page.goto(`http://127.0.0.1:${server.address().port}/`);
 await click('Try a fictional example');
 await page.getByText('Private preparation notes',{exact:true}).click();
 await page.locator('[data-visit="privateNotes"]').fill('PRIVATE PREPARATION SENTINEL');
 const first=page.locator('textarea[data-q]').first();await first.fill('Chosen question <b>literal</b>');
 await click('Choose words for conversation view');
 const dialog=page.locator('#conversation');
 assert.equal(await dialog.locator('input:checked').count(),0);
 await dialog.locator('input[type=checkbox]').first().check();
 await dialog.getByLabel('Request wording',{exact:true}).first().fill('Please wait for me.');
 const request=dialog.locator('label').filter({hasText:'Include this request'}).first();await request.locator('input').check();
 await click('Preview chosen words');await click('Show chosen words');
 assert.equal(await dialog.locator('.big-question').innerText(),'Chosen question <b>literal</b>');
 assert.equal(await dialog.locator('.big-question b').count(),0);
 assert.equal(await page.locator('main').isVisible(),false);
 assert.equal((await dialog.innerText()).includes('PRIVATE PREPARATION SENTINEL'),false);
 await dialog.locator('summary').click();await click('Please wait for me.');
 assert.equal(await dialog.locator('.big-question').innerText(),'Please wait for me.');
 await click('Return to question');await page.keyboard.press('Escape');
 assert.equal(await dialog.locator('.big-question').count(),0);
 assert.equal(await page.locator('main').isVisible(),false);
 await click('Resume message');
 assert.equal(await dialog.locator('.big-question').innerText(),'Chosen question <b>literal</b>');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await click('Leave conversation view');await click('Open my personal answer note');
 await page.locator('textarea[data-field="note"]').fill('PRIVATE ANSWER SENTINEL');
 await click('Choose words for conversation view');await click('Show chosen words');
 assert.equal((await dialog.innerText()).includes('PRIVATE ANSWER SENTINEL'),false);
 await click('Leave conversation view');await click('Review after the visit');
 assert.equal(await page.getByRole('heading',{name:'After the visit',exact:true}).isVisible(),true);
 assert.deepEqual(errors,[]);
 results.push({id:'CV01',name:'Temporary full journey with exact wording, requests, hidden private notes and review',passed:true});
 await page.close();
 await run('CV02','Empty selection, cancellation and requests-only return',async(p,click)=>{
  await click('Prepare my visit');await click('Choose words for conversation view');await click('Preview chosen words');assert.match(await p.locator('#conversation').innerText(),/Choose at least one/);await click('Cancel conversation setup');
  await choose(p,click,{request:true});await click('Leave conversation view');assert.equal(await p.getByRole('button',{name:'Open my personal answer note',exact:true}).count(),0);await click('Return to preparation');assert.equal(await p.getByRole('heading',{name:'Prepare my visit',exact:true}).isVisible(),true);
 });
 await run('CV03','Saved current question survives reload without reopening conversation',async(p,click)=>{
  await example(p,click);await save(p,click);const before=await data(p);await choose(p,click,{all:true});await click('Next chosen question');await click('Hide message');await p.waitForFunction(()=>document.querySelector('#conversation-save-status').textContent.startsWith('Your visit'));
  const stored=(await data(p)).visits[0];assert.equal(stored.current,stored.questions[1].id);assert.deepEqual(stored.questions,before.visits[0].questions);
  await p.reload();assert.equal(await p.locator('#conversation').isVisible(),false);await click('Open a saved visit');await p.locator('[data-open]').first().click();await click('3. During the visit');assert.equal(await p.locator('.big-question').innerText(),stored.questions[1].text);
 });
 await run('CV04','Failed write keeps in-memory place and gives an honest warning',async(p,click)=>{
  await example(p,click);await save(p,click);const before=await data(p);await p.evaluate(()=>{Storage.prototype.setItem=function(){throw new Error('Simulated full storage');};});await choose(p,click,{all:true});await click('Next chosen question');await click('Hide message');await p.waitForFunction(()=>document.querySelector('#conversation-save-status').textContent.startsWith('Changes are not saved'));
  assert.deepEqual(await data(p),before);await click('Resume message');assert.equal(await p.locator('#conversation .big-question').innerText(),before.visits[0].questions[1].text);await click('Leave conversation view');assert.match(await p.locator('#conversation').innerText(),/Changes are not saved/);
 });
 await run('CV05','Held save updates the paused status when it completes',async(p,click,c)=>{
  await example(p,click);await save(p,click);const q=await c.newPage();await q.goto(url);await q.evaluate(()=>{window.held=false;navigator.locks.request('my-visit-notes.v1',()=>new Promise(r=>{window.release=r;window.held=true;}));});await q.waitForFunction(()=>window.held);
  await choose(p,click,{all:true});await click('Next chosen question');await click('Hide message');assert.match(await p.locator('#conversation-save-status').innerText(),/not saved/);await q.evaluate(()=>window.release());await p.waitForFunction(()=>document.querySelector('#conversation-save-status').textContent.startsWith('Your visit'));assert.equal((await data(p)).visits[0].current,(await data(p)).visits[0].questions[1].id);
 });
 await run('CV06','Other-tab edits hide the display and warn without overwriting',async(p,click,c)=>{
  await example(p,click);await save(p,click);await choose(p,click,{all:true});const q=await c.newPage();await q.goto(url);await q.evaluate(()=>{const s=JSON.parse(localStorage.getItem('my-visit-notes.v1'));s.revision++;s.visits[0].title='Changed elsewhere';localStorage.setItem('my-visit-notes.v1',JSON.stringify(s));});await p.waitForFunction(()=>document.querySelector('#conversation-save-status')?.textContent.includes('another tab'));assert.equal(await p.locator('#conversation .big-question').count(),0);assert.equal((await data(p)).visits[0].title,'Changed elsewhere');
 });
 await run('CV07','Changed wording requires fresh unchecked selection',async(p,click)=>{
  await example(p,click);await choose(p,click,{all:true});await click('Next chosen question');const second=await p.locator('#conversation .big-question').innerText();await click('Leave conversation view');await click('Open my personal answer note');assert.equal(await p.locator('#screen .big-question').innerText(),second);await p.locator('textarea[data-field="note"]').fill('SECOND_QUESTION_PRIVATE');await click('Choose words for conversation view');await click('Show chosen words');assert.equal(await p.locator('#conversation .big-question').innerText(),second);assert.ok(!(await p.locator('#conversation').innerText()).includes('SECOND_QUESTION_PRIVATE'));await click('Leave conversation view');await click('Return to preparation');await p.locator('textarea[data-q]').first().fill('Changed question');await click('Choose words for conversation view');assert.equal(await p.locator('#conversation input:checked').count(),0);assert.equal(await p.getByRole('button',{name:'Show chosen words',exact:true}).count(),0);
 });
 await run('CV08','Keyboard confinement and print exclusion',async(p,click)=>{
  await example(p,click);await choose(p,click);for(let i=0;i<15;i++){await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.closest('#conversation')!==null||document.activeElement===document.body),true);}
  await p.evaluate(()=>document.querySelector('#print-output').textContent='PRIVATE OLD SUMMARY');await p.emulateMedia({media:'print'});assert.equal(await p.locator('#print-output').isVisible(),false);await p.emulateMedia({media:'screen'});await p.keyboard.press('Escape');assert.equal(await p.locator('#conversation .big-question').count(),0);await p.keyboard.press('Tab');await p.keyboard.press('Enter');assert.equal(await p.locator('#conversation .big-question').count(),1);
 });
 await run('CV09','Long wording, reading choices and enlarged layout',async(p,click)=>{
  await example(p,click);await p.locator('textarea[data-q]').first().fill('long'.repeat(1000));await openSection(p,'#reading');await p.locator('#reading-size').selectOption('largest');await p.locator('#reading-spacing').selectOption('roomy');await choose(p,click);
  for(const contrast of ['soft','high','dark']){await p.evaluate(value=>document.body.dataset.contrast=value,contrast);assert.equal(await p.locator('#conversation').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);}
  await p.screenshot({path:dir+'qa/conversation-long.png',fullPage:true});await p.setViewportSize({width:1280,height:900});await p.evaluate(()=>document.body.style.zoom='2');assert.equal(await p.locator('#conversation').evaluate(e=>e.scrollWidth<=e.clientWidth+1),true);
 });
 await run('CV10','Offline reopening supports a new conversation',async(p,click,c)=>{
  await example(p,click);await save(p,click);await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForFunction(()=>navigator.serviceWorker.controller);await c.setOffline(true);await p.reload();await click('Open a saved visit');await p.locator('[data-open]').first().click();await choose(p,click);assert.equal(await p.locator('#conversation .big-question').isVisible(),true);await p.screenshot({path:dir+'qa/conversation-show.png',fullPage:true});await click('Hide message');await p.screenshot({path:dir+'qa/conversation-hidden.png',fullPage:true});
 });
 await run('CV11','Background visibility event hides words; returning does not reveal them',async(p,click)=>{
  await example(p,click);await choose(p,click);await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await p.locator('#conversation .big-question').count(),0);await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await p.locator('#conversation .big-question').count(),0);await click('Resume message');assert.equal(await p.locator('#conversation .big-question').count(),1);
 });
 await run('CV12','Closing during a waiting position save leaves the last saved position',async(p,click,c)=>{
  await example(p,click);await save(p,click);const before=await data(p),q=await c.newPage();await q.goto(url);await q.evaluate(()=>{window.held=false;navigator.locks.request('my-visit-notes.v1',()=>new Promise(r=>{window.release=r;window.held=true;}));});await q.waitForFunction(()=>window.held);await choose(p,click,{all:true});await click('Next chosen question');await click('Hide message');assert.match(await p.locator('#conversation-save-status').innerText(),/not saved/);await p.close();await q.evaluate(()=>window.release());assert.deepEqual(await data(q),before);
 });
 await run('CV13','Keyboard selection to display, request, hide and private return',async(p,click)=>{
  await example(p,click);const keyboardButton=async name=>{for(let i=0;i<100;i++){if(await p.evaluate(n=>document.activeElement?.tagName==='BUTTON'&&document.activeElement.textContent===n,name)){await p.keyboard.press('Enter');return;}await p.keyboard.press('Tab');}throw Error('Button not reached by keyboard: '+name);};
  await keyboardButton('Choose words for conversation view');await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.type),'checkbox');await p.keyboard.press('Space');
  for(let i=0;i<50;i++){if(await p.evaluate(()=>document.activeElement.closest('label')?.textContent==='Include this request'))break;await p.keyboard.press('Tab');}
  assert.equal(await p.evaluate(()=>document.activeElement.closest('label')?.textContent),'Include this request');await p.keyboard.press('Space');await keyboardButton('Preview chosen words');await keyboardButton('Show chosen words');
  for(let i=0;i<30;i++){if(await p.evaluate(()=>document.activeElement.tagName==='SUMMARY'))break;await p.keyboard.press('Tab');}await p.keyboard.press('Enter');await p.keyboard.press('Tab');const words=await p.evaluate(()=>document.activeElement.textContent);await p.keyboard.press('Enter');assert.equal(await p.locator('#conversation .big-question').innerText(),words);await p.keyboard.press('Escape');await keyboardButton('Resume message');await keyboardButton('Leave conversation view');await keyboardButton('Open my personal answer note');assert.equal(await p.evaluate(()=>document.activeElement.dataset.field),'note');
 });
 await run('CV14','Accessibility tree excludes private background and cancel leaves saved data alone',async(p,click,c)=>{
  await example(p,click);await p.getByText('Private preparation notes',{exact:true}).click();await p.locator('[data-visit="privateNotes"]').fill('PRIVATE_TREE_SENTINEL');await save(p,click);const before=await data(p);await click('Choose words for conversation view');await click('Cancel conversation setup');assert.deepEqual(await data(p),before);await choose(p,click);const session=await c.newCDPSession(p);const tree=await session.send('Accessibility.getFullAXTree');assert.equal(tree.nodes.filter(n=>!n.ignored).some(n=>JSON.stringify(n).includes('PRIVATE_TREE_SENTINEL')),false);assert.equal(tree.nodes.filter(n=>!n.ignored).some(n=>n.name?.value==='Saved visits and recovery'),false);
 });
 assert.deepEqual(errors,[]);
}finally{await browser.close();await new Promise(r=>server.close(r));writeFileSync(dir+'qa/conversation-results.json',JSON.stringify({date:new Date().toISOString(),browser:browser.version(),results,errors,sourceHashes:Object.fromEntries(['app.mjs','index.html','styles.css','sw.js','conversation-ui.mjs','journey-ui.mjs','followup-ui.mjs','intake.mjs','tests/navigation.mjs','tests/conversation-browser.mjs'].map(f=>[f,createHash('sha256').update(readFileSync(dir+f)).digest('hex')]))},null,2));}
