import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createServer} from 'node:http';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {clickButton} from './navigation.mjs';
const {chromium}=createRequire(import.meta.url)('../../../communication-tool/node_modules/playwright');
const root=fileURLToPath(new URL('../',import.meta.url));
const server=createServer((req,res)=>{try{let p=new URL(req.url,'http://local').pathname;if(p==='/')p='/index.html';const file=resolve(root,'.'+p);if(!file.startsWith(root))throw Error();res.setHeader('Content-Type',({'.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.html':'text/html','.svg':'image/svg+xml','.png':'image/png'})[extname(file)]||'application/octet-stream');res.end(readFileSync(file));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch();
try{
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.addInitScript(()=>{
  window.nativeCalls=[];window.nativeEvents={};window.failNativeWrite=false;
  const plugins={
   Filesystem:{stat:async()=>({type:'directory'}),rmdir:async options=>{nativeCalls.push({kind:'cleanup',...options});await new Promise(resolve=>{window.finishCleanup=resolve;});},writeFile:async options=>{if(window.failNativeWrite)throw Error('Disk full');nativeCalls.push({kind:'file',...options});return {uri:'file:///'+options.path};}},
   Share:{share:async options=>{nativeCalls.push({kind:'share',...options});}},
   Clipboard:{write:async options=>nativeCalls.push({kind:'clipboard',...options})},
   VisitPrint:{printText:async options=>nativeCalls.push({kind:'print',...options})},
   App:{addListener:async(name,callback)=>{nativeEvents[name]=callback;return {remove(){}};}}
  };
  window.Capacitor={isNativePlatform:()=>true,Plugins:plugins};
 });
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}`);
 await page.waitForFunction(()=>!!window.nativeEvents.appStateChange);
 assert.match(await page.locator('#offline').innerText(),/ready offline/);
 assert.equal(await page.locator('#installation').isVisible(),false);
 if(process.env.VISIT_SCREENSHOTS==='1')await page.screenshot({path:'/tmp/myvisit-native-home.png',fullPage:true});
 await clickButton(page,'Try a fictional example');
 await page.getByText('Private preparation notes',{exact:true}).click();
 await page.getByLabel('Private notes',{exact:true}).fill('PRIVATE_NATIVE_PREPARATION');
 await clickButton(page,'Save on this device');await clickButton(page,'Save this visit');
 await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Saved on'));
 await clickButton(page,'3. During the visit');await clickButton(page,'Review after the visit');
 await clickButton(page,'Review what happened and what comes next');
 const exact=await page.locator('#dialog-body pre').innerText();assert.doesNotMatch(exact,/PRIVATE_NATIVE/);
 if(process.env.VISIT_SCREENSHOTS==='1')await page.screenshot({path:'/tmp/myvisit-native-review.png'});
 await clickButton(page,'Save or share private review');
 assert.deepEqual(await page.evaluate(()=>nativeCalls.filter(c=>c.kind==='cleanup')),[{kind:'cleanup',path:'visit-exports',directory:'CACHE',recursive:true}]);
 assert.equal(await page.evaluate(()=>nativeCalls.some(c=>c.kind==='file')),false,'Export must wait for earlier cached files to be cleared');
 await page.evaluate(()=>window.finishCleanup());
 await page.waitForFunction(()=>nativeCalls.some(c=>c.kind==='share'));
 const calls=await page.evaluate(()=>nativeCalls);assert.equal(calls.find(c=>c.kind==='file').data,exact);
 await clickButton(page,'Copy private review');
 await page.waitForFunction(()=>nativeCalls.some(c=>c.kind==='clipboard'));
 assert.equal((await page.evaluate(()=>nativeCalls.find(c=>c.kind==='clipboard'))).string,exact);
 await page.evaluate(()=>{window.failNativeWrite=true;});
 await clickButton(page,'Save or share private review');await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('did not finish'));
 assert.equal(await page.evaluate(()=>nativeCalls.filter(c=>c.kind==='share').length),1);
 await page.evaluate(()=>nativeEvents.backButton());assert.equal(await page.locator('#dialog').isVisible(),false);
 await clickButton(page,'Preview selected summary');
 const printed=await page.locator('#dialog-body pre').innerText();
 await clickButton(page,'Print summary');await page.waitForFunction(()=>nativeCalls.some(c=>c.kind==='print'));
 assert.equal((await page.evaluate(()=>nativeCalls.find(c=>c.kind==='print'))).text,printed);
 assert.doesNotMatch(printed,/PRIVATE_NATIVE/);
 await page.evaluate(()=>nativeEvents.backButton());
 await page.evaluate(()=>nativeEvents.backButton());assert.equal(await page.locator('#welcome').isVisible(),true);
 await clickButton(page,'Return to my open visit');
 await clickButton(page,'Choose words for conversation view');await page.locator('#conversation input[type=checkbox]').first().check();
 await clickButton(page,'Preview chosen words');await clickButton(page,'Show chosen words');
 assert.equal(await page.locator('#conversation .big-question').count(),1);
 await page.evaluate(()=>nativeEvents.appStateChange({isActive:false}));
 assert.equal(await page.locator('#conversation .big-question').count(),0);
 await page.evaluate(()=>nativeEvents.appStateChange({isActive:true}));
 assert.equal(await page.locator('#conversation .big-question').count(),0);
 await page.setViewportSize({width:320,height:480});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 assert.deepEqual(errors,[]);
 console.log('PASS simulated native startup, exact export, clipboard, printing, failed export, Back, background concealment and narrow layout. Native OS execution is separate.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
