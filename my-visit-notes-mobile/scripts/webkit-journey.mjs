// Linux WebKit checks the shared frontend, not Safari or the native iOS app.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {resolve,extname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {clickButton,openSection} from '../../product-specs/my-visit-notes/tests/navigation.mjs';
import {STATES} from '../../product-specs/my-visit-notes/model.mjs';
import {localWebKitOptions} from './webkit-local-runtime.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const source=resolve(root,'../product-specs/my-visit-notes');
const {webkit}=createRequire(import.meta.url)('../../communication-tool/node_modules/playwright');
const environmentFile=process.argv.find(a=>a.startsWith('--environment-file='))?.slice(19);
const files=Object.keys(JSON.parse(readFileSync(resolve(root,'dist/bundle-manifest.json'))).files);
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const sourceHashes=Object.fromEntries(files.map(f=>[f,sha(resolve(source,f))]));
const qa=resolve(root,'qa');mkdirSync(qa,{recursive:true});
const profile=mkdtempSync(join(tmpdir(),'my-visit-webkit-profile-'));
const report={date:new Date().toISOString(),passed:false,engine:'WebKit on Linux',completed:[],errors:[],sourceHashes,testSHA256:sha(fileURLToPath(import.meta.url)),limits:['Not Safari, native WKWebView or an iOS simulator','No native plugins, system file picker, app switcher or print output tested','No physical keyboard, cutout or device accessibility testing']};
const server=createServer((req,res)=>{try{
 let path=new URL(req.url,'http://local').pathname;if(path.endsWith('/'))path+='index.html';
 const file=resolve(source,'.'+path);if(!file.startsWith(source+'/'))throw Error('Outside app');
 res.setHeader('Content-Type',({'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'})[extname(file)]||'text/plain');
 res.end(readFileSync(file));
}catch{res.writeHead(404).end();}});
let context,expectedOfflineState,phase='launch';
const done=name=>{report.completed.push(name);console.log('PASS',name);};
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const url=`http://127.0.0.1:${server.address().port}/`;
const requests=[];
function localLaunchOptions(){return localWebKitOptions(webkit,environmentFile,report);}
async function launch(offline=false){
 context=await webkit.launchPersistentContext(profile,{headless:true,viewport:{width:390,height:844},acceptDownloads:true,...localLaunchOptions()});
 context.on('request',r=>requests.push({url:r.url(),method:r.method(),body:r.postData()}));
 report.browser=context.browser().version();
 if(offline)await context.setOffline(true);
 const page=context.pages()[0]||await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(url);return page;
}
const data=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('my-visit-notes.v1')));
const click=(p,name)=>clickButton(p,name);
async function save(p){await click(p,'Save on this device');await click(p,'Save this visit');await p.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Saved on'));}
try{
 let p=await launch();
 phase='prepare';
 await click(p,'Try a fictional example');
 await p.getByText('Private preparation notes',{exact:true}).click();
 await p.getByLabel('Private notes',{exact:true}).fill('PRIVATE_WEBKIT_PREPARATION');
 await save(p);
 await click(p,'3. During the visit');
 for(const state of STATES){
  await p.getByLabel('Question state',{exact:true}).selectOption(state);
  await p.waitForFunction(expected=>JSON.parse(localStorage.getItem('my-visit-notes.v1')).visits[0].questions[0].state===expected,state);
 }
 await p.getByLabel('Question state',{exact:true}).selectOption('Partly answered');
 await p.waitForFunction(()=>JSON.parse(localStorage.getItem('my-visit-notes.v1')).visits[0].questions[0].state==='Partly answered');
 done('Every supported outcome saves with recovery history');

 phase='conversation';
 await click(p,'Choose words for conversation view');await p.locator('#conversation input[type=checkbox]').first().check();
 await click(p,'Preview chosen words');await click(p,'Show chosen words');
 assert.equal(await p.locator('#conversation .big-question').count(),1);
 assert.doesNotMatch(await p.locator('#conversation').innerText(),/PRIVATE_WEBKIT/);
 await p.keyboard.press('Escape');assert.equal(await p.locator('#conversation .big-question').count(),0);
 await click(p,'Resume message');await click(p,'Leave conversation view');
 done('Conversation selection and concealment preserve privacy');

 phase='review-export';
 await click(p,'Review after the visit');
 await p.getByLabel('My personal answer note (not confirmed by a clinician)',{exact:true}).first().fill('PRIVATE_WEBKIT_ANSWER');
 await p.waitForFunction(()=>JSON.parse(localStorage.getItem('my-visit-notes.v1')).visits[0].questions[0].note==='PRIVATE_WEBKIT_ANSWER');
 await click(p,'Review what happened and what comes next');
 const review=await p.locator('#dialog-body pre').innerText();assert.doesNotMatch(review,/PRIVATE_WEBKIT/);
 const download=p.waitForEvent('download');await click(p,'Download private review');
 assert.equal(readFileSync(await (await download).path(),'utf8'),review);
 await p.screenshot({path:resolve(qa,'webkit-review.png')});
 await click(p,'Cancel / return');
 done('Exact review download excludes private preparation and answer notes');

 phase='failed-save';
 const beforeFailure=await data(p);
 await p.evaluate(()=>{window.webkitOriginalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(key,value){if(key==='my-visit-notes.v1')throw Error('Fictional full storage');return window.webkitOriginalSet.call(this,key,value);};});
 await p.getByLabel('My personal answer note (not confirmed by a clinician)',{exact:true}).first().fill('PRIVATE_WEBKIT_RETAINED');
 await p.waitForFunction(()=>/not saved/i.test(document.querySelector('#status').textContent+' '+document.querySelector('#notice').textContent));
 assert.deepEqual(await data(p),beforeFailure);
 assert.equal(await p.getByLabel('My personal answer note (not confirmed by a clinician)',{exact:true}).first().inputValue(),'PRIVATE_WEBKIT_RETAINED');
 await p.evaluate(()=>{Storage.prototype.setItem=window.webkitOriginalSet;});
 await save(p);assert.equal((await data(p)).visits[0].questions[0].note,'PRIVATE_WEBKIT_RETAINED');
 done('Failed save keeps visible words and retry preserves them');

 phase='draft';
 await click(p,'Home');await click(p,'What still needs doing');
 await p.locator('#dialog-body article input[type=checkbox]').first().check();
 await click(p,'Prepare a message or call note');await click(p,'Build editable draft');
 await p.getByLabel('Message or call-note draft',{exact:true}).fill('Fictional WebKit follow-up\nPlease send the written details.');
 await p.getByLabel('Draft name (optional)',{exact:true}).fill('WebKit follow-up');
 await click(p,'Save draft on this device');await click(p,'Save private draft');
 await p.locator('.draft-save-status').filter({hasText:'Draft saved'}).waitFor();await click(p,'Cancel / return');
 assert.equal((await data(p)).followupDrafts.length,1);
 done('Follow-up draft is kept without recording it as sent');

 phase='next-appointment';
 const beforeNext=await data(p);
 await click(p,'Prepare the next appointment');await p.getByRole('button',{name:/^Plan from:/}).first().click();
 assert.equal(await p.locator('[data-next-choice]:checked').count(),0);
 await p.locator('[data-next-choice="questions"]').first().check();await click(p,'Review chosen work');await click(p,'Create next appointment');
 await p.getByLabel('Visit title (optional)',{exact:true}).fill('WebKit next appointment');await save(p);
 assert.deepEqual((await data(p)).visits.slice(0,-1),beforeNext.visits);
 done('Next appointment copies only chosen work and preserves the original');

 phase='large-text';
 await openSection(p,'#reading');await p.getByLabel('Text size',{exact:true}).selectOption('largest');
 for(const width of [320,390,844]){await p.setViewportSize({width,height:640});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);}
 done('Large text fits narrow and rotated viewports');

 phase='offline-restart';
 await p.waitForFunction(()=>document.querySelector('#offline').textContent.includes('are ready'));
 const expected=await data(p);expectedOfflineState=expected;
 report.offlineBeforeRestart=await p.evaluate(async()=>({controller:navigator.serviceWorker.controller?.scriptURL,caches:await caches.keys(),registrations:(await navigator.serviceWorker.getRegistrations()).map(r=>({scope:r.scope,active:r.active?.state}))}));
 await context.close();context=null;
 p=await launch(true);
 assert.equal(await p.locator('#welcome').isVisible(),true);assert.doesNotMatch(await p.locator('#welcome').innerText(),/PRIVATE_WEBKIT/);
 assert.deepEqual(await data(p),expected);
 await click(p,'Open a saved visit');await p.locator('[data-open]').first().click();
 await click(p,'3. During the visit');await click(p,'Review after the visit');
 assert.equal(await p.getByLabel('What happened?',{exact:true}).first().inputValue(),'Partly answered');
 assert.equal(await p.getByLabel('My personal answer note (not confirmed by a clinician)',{exact:true}).first().inputValue(),'PRIVATE_WEBKIT_RETAINED');
 await click(p,'Home');await click(p,'Open saved follow-up drafts');await click(p,'Open draft: WebKit follow-up');
 assert.equal(await p.getByLabel('Message or call-note draft',{exact:true}).inputValue(),'Fictional WebKit follow-up\nPlease send the written details.');
 done('Complete browser restart offline preserves visits and follow-up draft');
 assert.equal(requests.some(r=>!r.url.startsWith(url)||r.method!=='GET'||r.body),false);
 assert.deepEqual(report.errors,[]);
 for(const [file,hash] of Object.entries(sourceHashes))assert.equal(sha(resolve(source,file)),hash,'Source changed during test: '+file);
 report.passed=true;
}catch(error){
 report.failure={phase,message:error.message};console.error('FAIL',phase,error.message);process.exitCode=1;
 if(phase==='offline-restart'&&context)try{
  // Diagnose retained data after the failure; this never changes its fail result.
  await context.setOffline(false);
  const online=context.pages()[0]||await context.newPage();await online.goto(url);
  const restored=await data(online);
  report.failure.onlineRecovery={savedDataIntact:JSON.stringify(restored)===JSON.stringify(expectedOfflineState),visits:restored?.visits?.length,drafts:restored?.followupDrafts?.length,caches:await online.evaluate(()=>caches.keys())};
 }catch(diagnostic){report.failure.onlineRecoveryError=diagnostic.message;}
 const page=context?.pages().find(p=>p.url().startsWith(url));
 if(page)try{
  report.failure.layout=await page.evaluate(()=>({viewport:{width:innerWidth,height:innerHeight,scrollY},elements:['html','body','#welcome','#workspace','#journey-tools','#reading','#reading > summary'].map(selector=>{const e=document.querySelector(selector);if(!e)return {selector,missing:true};const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {selector,x:r.x,y:r.y,width:r.width,height:r.height,open:e.open,hidden:e.hidden,overflow:s.overflow,position:s.position,scrollHeight:e.scrollHeight,clientHeight:e.clientHeight};})}));
  await page.screenshot({path:resolve(qa,'webkit-failure.png'),fullPage:true});
 }catch(diagnostic){report.failure.diagnosticError=diagnostic.message;}
}
finally{
 if(context)await context.close();await new Promise(r=>server.close(r));
 writeFileSync(resolve(qa,'webkit-journey.json'),JSON.stringify(report,null,2)+'\n');
}
