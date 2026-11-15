import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
globalThis.crypto=webcrypto;
import {blank,question,summary,backup,restore,readStore,validateVisit} from '../model.mjs';
test('summary selections never copy preparation notes or unselected content',()=>{
 for(let n=0;n<100;n++){
  const v=blank();v.privateNotes=`PRIVATE-${n}`;v.questions=Array.from({length:20},(_,i)=>({...question(`QUESTION-${i}`),note:`NOTE-${i}`}));v.current=v.questions[0].id;
  const chosen=new Set(v.questions.filter((q,i)=>i%3===n%3).map(q=>q.id));const notes=new Set(v.questions.filter((q,i)=>i%2===0).map(q=>q.id));
  v.requests=[{text:'VISIBLE-REQUEST',visible:true},{text:'HIDDEN-REQUEST',visible:false}];
  const text=summary(v,chosen,notes,new Set([0,1]));assert.ok(!text.includes(v.privateNotes));assert.ok(!text.includes('HIDDEN-REQUEST'));
  v.questions.forEach(q=>{const lines=text.split('\n');assert.equal(lines.includes(`[Open] ${q.text}`),chosen.has(q.id));assert.equal(lines.includes(`My personal note (not confirmed by a clinician): ${q.note}`),chosen.has(q.id)&&notes.has(q.id));});
 }
});
test('backup roundtrip preserves all permitted fields and rejects unknown versions',()=>{
 const v=blank();v.questions=[question('<script>not code</script>')];v.current=v.questions[0].id;v.privateNotes='For recovery';assert.deepEqual(restore(backup(v)),v);
 assert.throws(()=>restore(JSON.stringify({format:'my-visit-notes-backup',version:99,visit:v})));
 assert.throws(()=>validateVisit({...v,current:'missing'}));assert.throws(()=>validateVisit({...v,questions:[v.questions[0],v.questions[0]]}));
 assert.throws(()=>validateVisit({...v,questions:[{...v.questions[0],state:'automatically answered'}]}));
});
test('store validation preserves valid records and refuses damaged collections',()=>{
 const v=blank();assert.deepEqual(readStore(null),{version:7,revision:0,visits:[],preferences:[],preparations:[],preparationReceipts:[],recovery:[],focus:null,transfers:[],followupDrafts:[]});
 assert.throws(()=>readStore('{broken'));assert.throws(()=>readStore(JSON.stringify({version:2,revision:1,visits:[]})));
 assert.throws(()=>readStore(JSON.stringify({version:1,revision:1,visits:[v,v]})));
 assert.deepEqual(readStore(JSON.stringify({version:1,revision:9,visits:[v]})).visits,[v]);
});
