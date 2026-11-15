// Independent fixture: distinguish offline-emulation failure from app behavior.
// Does not import or modify My Visit Notes, and never changes its pass/fail result.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdtempSync,mkdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {localWebKitOptions} from './webkit-local-runtime.mjs';
const engines=createRequire(import.meta.url)('../../communication-tool/node_modules/playwright');
const engineName=process.argv.includes('--browser=chromium')?'chromium':'webkit';
const engine=engines[engineName];
const environmentFile=process.argv.find(a=>a.startsWith('--environment-file='))?.slice(19);
const memoryProfile=process.argv.includes('--memory-profile');
const report={date:new Date().toISOString(),cases:[],limits:['Minimal synthetic fixture, not app or native iOS acceptance','A stopped local origin is not a physical airplane-mode test']};
report.engine=engineName;
report.profileStorage=memoryProfile?'Linux /dev/shm (diagnostic only, not durable disk)':'default temporary directory';
const options=engineName==='webkit'?localWebKitOptions(engine,environmentFile,report):{};
const worker=`self.addEventListener('install',e=>e.waitUntil(caches.open('probe').then(c=>c.put('./',new Response('<!doctype html><title>Offline fixture</title><p id="cached">Only the service worker supplies this page.</p>',{headers:{'Content-Type':'text/html'}})))));self.addEventListener('activate',e=>e.waitUntil(clients.claim()));self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));`;
const diagnostics=`self.addEventListener('message',e=>e.waitUntil((async()=>{try{const c=await caches.open('probe');e.ports[0].postMessage({url:self.location.href,keys:(await c.keys()).map(r=>r.url),root:await (await c.match(new URL('./',self.location.href)))?.text()});}catch(error){e.ports[0].postMessage({error:String(error)});}})()));`;
for(const mode of ['playwright-offline','server-stopped']){
 const result={mode,requests:[],warm:{passed:false},cold:{passed:false}};report.cases.push(result);
 const server=createServer((req,res)=>{result.requests.push(req.url);res.setHeader('Content-Type',req.url==='/sw.js'?'text/javascript':'text/html');res.end(req.url==='/sw.js'?worker+diagnostics:'<!doctype html><title>Network fixture</title><p id="network">Network page</p>');});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}/`;
 const profile=mkdtempSync(join(memoryProfile?'/dev/shm':tmpdir(),'webkit-offline-probe-'));result.profile=profile;let context;
 const launch=async()=>{context=await engine.launchPersistentContext(profile,{headless:true,...options});return context.pages()[0]||await context.newPage();};
 const stop=async()=>{if(server.listening){server.closeAllConnections();await new Promise(r=>server.close(r));}};
 const inspect=async(page,response,target)=>{
  await page.locator('#cached').waitFor();assert.equal(await page.evaluate(()=>localStorage.getItem('probe')),'retained');
  target.fromServiceWorker=response?.fromServiceWorker();target.passed=true;
 };
 try{
  let p=await launch();report.browser=context.browser().version();await p.goto(url);
  await p.evaluate(async()=>{localStorage.setItem('probe','retained');await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready;});
  await p.waitForFunction(()=>!!navigator.serviceWorker.controller);
  result.before=await p.evaluate(async()=>{
   const c=await caches.open('probe'),match=await c.match(location.href);
   return {url:location.href,caches:await caches.keys(),registrations:(await navigator.serviceWorker.getRegistrations()).length,keys:(await c.keys()).map(r=>r.url),cachedPage:match?await match.text():null};
  });
  result.cacheDiagnostics=await p.evaluate(async()=>{
   const workerReport=()=>new Promise((resolve,reject)=>{const ch=new MessageChannel();const timer=setTimeout(()=>reject(new Error('Worker diagnostic timed out')),10000);ch.port1.onmessage=e=>{clearTimeout(timer);ch.port1.close();resolve(e.data);};navigator.serviceWorker.controller.postMessage('inspect',[ch.port2]);});
   const before=await workerReport(),c=await caches.open('probe');
   // A distinct canary cannot supply the root page required by either test.
   await c.put('/window-canary',new Response('window-canary'));
   return {workerBefore:before,windowKeys:(await c.keys()).map(r=>r.url),windowCanary:await (await c.match('/window-canary'))?.text(),workerAfter:await workerReport()};
  });
  if(mode==='playwright-offline')await context.setOffline(true);else await stop();
  try{await inspect(p,await p.reload(),result.warm);}catch(error){result.warm.error=error.message;}
  await context.close();context=null;
  p=await launch();if(mode==='playwright-offline')await context.setOffline(true);
  try{await inspect(p,await p.goto(url),result.cold);}catch(error){result.cold.error=error.message;}
  result.originStopped=!server.listening;
  console.log(JSON.stringify({mode,warm:result.warm,cold:result.cold}));
 }catch(error){result.setupError=error.message;console.error(mode,error.message);}
 finally{if(context)await context.close();await stop();}
}
const qa=fileURLToPath(new URL('../qa/',import.meta.url));mkdirSync(qa,{recursive:true});
writeFileSync(join(qa,`${engineName}-offline-probe${memoryProfile?'-memory':''}.json`),JSON.stringify(report,null,2)+'\n');
if(report.cases.some(c=>c.setupError||!c.warm.passed||!c.cold.passed))process.exitCode=1;
