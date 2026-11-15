import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createNativeExporter,copyText} from '../platform.mjs';

test('native export writes exact selected bytes to a unique cache file before opening the sheet',async()=>{
 const calls=[];let counter=0;
 const exportFile=createNativeExporter({id:()=>String(++counter),filesystem:{writeFile:async options=>{calls.push(options);return {uri:'file:///'+options.path};}},share:{share:async options=>calls.push(options)}});
 await exportFile('review.txt','Selected words\nÅ');
 await exportFile('review.txt','Second version');
 assert.deepEqual(calls[0],{path:'visit-exports/1/review.txt',data:'Selected words\nÅ',directory:'CACHE',encoding:'utf8',recursive:true});
 assert.deepEqual(calls[1].files,['file:///visit-exports/1/review.txt']);
 assert.equal(calls[2].path,'visit-exports/2/review.txt');
 assert.equal(calls[2].data,'Second version');
});
test('failed cache writes do not open the share sheet and retries remain available',async()=>{
 let fail=true,shared=0;
 const exportFile=createNativeExporter({id:()=> 'id',filesystem:{writeFile:async()=>{if(fail)throw Error('disk full');return {uri:'file:///retry'};}},share:{share:async()=>shared++}});
 await assert.rejects(exportFile('backup.json','private'),/disk full/);assert.equal(shared,0);
 fail=false;await exportFile('backup.json','private');assert.equal(shared,1);
 await assert.rejects(exportFile('../outside.json','private'),/filename/);
});
test('a second tap cannot replace a file while a share sheet is open; cancellation is reported',async()=>{
 let cancel,started;const ready=new Promise(r=>started=r);
 const exportFile=createNativeExporter({id:()=> 'id',filesystem:{writeFile:async()=>({uri:'file:///same'})},share:{share:()=>{started();return new Promise((_,reject)=>cancel=reject);}}});
 const pending=exportFile('review.txt','one');await ready;
 await assert.rejects(exportFile('review.txt','two'),/already open/);
 cancel(Error('Share canceled'));await assert.rejects(pending,/canceled/);
});
test('native clipboard gets only the provided text and reports plugin failure',async()=>{
 const previous=globalThis.Capacitor;let copied;
 globalThis.Capacitor={isNativePlatform:()=>true,Plugins:{Clipboard:{write:async({string})=>{copied=string;throw Error('clipboard unavailable');}}}};
 try{await assert.rejects(copyText('chosen only'),/clipboard unavailable/);assert.equal(copied,'chosen only');}
 finally{globalThis.Capacitor=previous;}
});
