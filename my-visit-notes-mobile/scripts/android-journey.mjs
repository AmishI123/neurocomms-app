import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {clickButton} from '../../product-specs/my-visit-notes/tests/navigation.mjs';
import {restartAndroidView} from '../../communication-tool/scripts/android-view-restart.mjs';

const serial=process.argv.find(a=>a.startsWith('--serial='))?.slice(9);
if(!serial||!process.argv.includes('--dedicated-test-target'))throw Error('Provide --serial=<dedicated emulator> --dedicated-test-target. This installs the app and writes fictional notes.');
const root=fileURLToPath(new URL('../',import.meta.url));
const adb=process.env.ADB_PATH||'/home/mehta/Android/Sdk/platform-tools/adb';
const pkg='org.myvisitnotes.app',apk=resolve(root,'android/app/build/outputs/apk/debug/app-debug.apk');
const command=(args,timeout=20000)=>execFileSync(adb,['-s',serial,...args],{encoding:'utf8',timeout});
const completed=[],errors=[];let device;
try{
 assert.equal(command(['shell','getprop','sys.boot_completed']).trim(),'1','Android must finish booting before installation.');
 const attached=execFileSync(adb,['devices'],{encoding:'utf8',timeout:10000}).split('\n').filter(s=>s.endsWith('\tdevice')).map(s=>s.split('\t')[0]);
 assert.deepEqual(attached,[serial],'Only the dedicated test target may be connected for this journey.');
 execFileSync(process.execPath,['scripts/audit-bundle.mjs',apk],{cwd:root,stdio:'pipe'});
 command(['install','-r',apk],60000);
 command(['shell','am','start','-W','-n',pkg+'/.MainActivity'],60000);
 const {_android}=createRequire(import.meta.url)('../../communication-tool/node_modules/playwright');
 device=(await _android.devices({omitDriverInstall:true})).find(d=>d.serial()===serial);
 assert.ok(device,'Dedicated device must be available');device.setDefaultTimeout(60000);
 async function attach(){const view=await device.webView({pkg},{timeout:60000});const page=await view.page();page.setDefaultTimeout(60000);page.on('pageerror',e=>errors.push(e.message));await page.locator('#welcome').waitFor();return {view,page};}
 let {view,page}=await attach();
 assert.equal(await page.evaluate(()=>localStorage.getItem('my-visit-notes.v1')),null,'Existing notes found; use a fresh test installation. Nothing was erased.');
 assert.equal(await page.evaluate(()=>Capacitor.isNativePlatform()),true);
 assert.equal(await page.evaluate(()=>Capacitor.isPluginAvailable('VisitPrint')),true);
 await page.waitForFunction(()=>document.body.dataset.native==='true');
 completed.push('installed-real-Android-WebView-and-plugins');
 await clickButton(page,'Try a fictional example');await clickButton(page,'Save on this device');await clickButton(page,'Save this visit');
 await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('Saved on'));
 await clickButton(page,'3. During the visit');await clickButton(page,'Review after the visit');
 await page.getByLabel('What happened?',{exact:true}).first().selectOption('Partly answered');
 await page.getByLabel('My personal answer note (not confirmed by a clinician)',{exact:true}).first().fill('Fictional native private answer');
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('my-visit-notes.v1')).visits[0].questions[0].note==='Fictional native private answer');
 const saved=await page.evaluate(()=>localStorage.getItem('my-visit-notes.v1'));
 completed.push('saved-partly-answered-and-private-note');
 await clickButton(page,'Review what happened and what comes next');const exact=await page.locator('#dialog-body pre').innerText();
 assert.doesNotMatch(exact,/Fictional native private answer/);
 await clickButton(page,'Copy private review');await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Review copied'));
 const clipboard=await page.evaluate(()=>Capacitor.Plugins.Clipboard.read());assert.equal(clipboard.value,exact);
 command(['shell','input','keyevent','4']);await page.waitForFunction(()=>!document.querySelector('#dialog').open);
 completed.push('native-clipboard-and-hardware-back');
 // Force-stop only after asserting the complete saved record. No clear-data path.
 ({view,page}=await restartAndroidView({page,view,
  stop:()=>command(['shell','am','force-stop',pkg]),
  launch:()=>command(['shell','am','start','-W','-n',pkg+'/.MainActivity'],60000),attach,timeoutMs:60000}));
 assert.equal(await page.evaluate(()=>localStorage.getItem('my-visit-notes.v1')),saved);
 await clickButton(page,'Open a saved visit');await page.locator('[data-open]').click();
 await clickButton(page,'3. During the visit');await clickButton(page,'Review after the visit');
 assert.equal(await page.getByLabel('What happened?',{exact:true}).first().inputValue(),'Partly answered');
 completed.push('force-stop-and-relaunch-preserved-saved-review');
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({passed:true,serial,completed,apkSHA256:createHash('sha256').update(readFileSync(apk)).digest('hex'),notTested:['system-file-picker','share-recipient-and-cancellation','native-print-output','airplane-mode','keyboard-and-cutouts','upgrade','physical-device','iOS'],dataDisposition:'Fictional notes remain in the dedicated test installation.'},null,2));
}catch(error){console.error(JSON.stringify({passed:false,serial,completed,error:error.message},null,2));process.exitCode=1;}
finally{if(device)await device.close();}
