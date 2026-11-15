import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
globalThis.crypto=webcrypto;
import {blank,question,action,validateVisit,readStore,emptyStore,backup,restore,summary,carryForward,libraryBackup,restoreLibrary,planLibraryImport,findVisits} from '../model.mjs';
function fixture(){const v=blank();v.title='Fictional first visit';v.privateNotes='PRIVATE_PREP';v.questions=[{...question('Ask about a referral'),state:'Answered',note:'PRIVATE_ANSWER'},question('Ask about timing')];v.actions=[{...action('Call service'),date:'2026-10-01',contact:'Fictional office',state:'Done'},action('Write questions')];v.current=v.questions[1].id;return v;}
test('v1 visits and individual backups migrate without mutating their inputs',()=>{
 const legacy=fixture();legacy.version=1;delete legacy.actions;legacy.questions.forEach(q=>{delete q.history;delete q.origin;});const original=JSON.stringify(legacy);
 const migrated=validateVisit(legacy);assert.deepEqual(migrated,{...legacy,version:3,actions:[],questions:legacy.questions.map(q=>({...q,history:[],origin:null}))});assert.equal(JSON.stringify(legacy),original);
 assert.deepEqual(restore(JSON.stringify({format:'my-visit-notes-backup',version:1,visit:legacy})),migrated);
 const oldStore=JSON.stringify({version:1,revision:8,visits:[legacy]});assert.deepEqual(readStore(oldStore),{version:7,revision:8,visits:[migrated],preferences:[],preparations:[],preparationReceipts:[],recovery:[],focus:null,transfers:[],followupDrafts:[]});
 assert.deepEqual(restore(backup(fixture())).actions.map(a=>a.state),['Done','To do']);
});
test('carry-forward resets selected items, preserves source and excludes notes and requests',()=>{
 const v=fixture();v.requests=[{text:'PRIVATE_REQUEST',visible:true}];const before=structuredClone(v);
 const next=carryForward(v,new Set([v.questions[0].id]),new Set([v.actions[0].id]));
 assert.deepEqual(v,before);assert.notEqual(next.id,v.id);assert.equal(next.title,'');assert.equal(next.date,'');assert.equal(next.privateNotes,'');assert.deepEqual(next.requests,[]);
 assert.equal(next.questions.length,1);assert.equal(next.questions[0].text,v.questions[0].text);assert.equal(next.questions[0].state,'Open');assert.equal(next.questions[0].note,'');assert.notEqual(next.questions[0].id,v.questions[0].id);
 assert.equal(next.actions.length,1);assert.equal(next.actions[0].state,'To do');assert.equal(next.actions[0].contact,v.actions[0].contact);assert.equal(next.actions[0].date,v.actions[0].date);assert.notEqual(next.actions[0].id,v.actions[0].id);
 assert.doesNotMatch(JSON.stringify(next),/PRIVATE_/);
});
test('next steps enter summaries only by explicit selection with their date and contact',()=>{
 const v=fixture();assert.doesNotMatch(summary(v),/Call service|PRIVATE_/);
 const out=summary(v,new Set(),new Set(),new Set(),new Set([v.actions[0].id]));assert.match(out,/\[Done\] Call service/);assert.match(out,/2026-10-01/);assert.match(out,/Fictional office/);assert.doesNotMatch(out,/Write questions|PRIVATE_/);
});
test('library roundtrip preserves all saved data and rejects malformed versions and actions',()=>{
 const store={...emptyStore(),revision:4,visits:[fixture()],preferences:['Time to answer']};assert.deepEqual(restoreLibrary(libraryBackup(store)),store);
 assert.throws(()=>restoreLibrary(JSON.stringify({format:'my-visit-notes-library',version:99,store})));
 for(const changes of [{actions:null},{actions:[{...store.visits[0].actions[0],state:'Inferred'}]},{actions:[store.visits[0].actions[0],store.visits[0].actions[0]]},{version:99}])assert.throws(()=>validateVisit({...store.visits[0],...changes}));
 assert.throws(()=>readStore(JSON.stringify({...store,preferences:[12]})));
});
test('library imports skip exact duplicates, preserve ID conflicts as copies, and are repeatable',()=>{
 const v=fixture(),base={...emptyStore(),visits:[v],preferences:['Existing']};
 const conflict=structuredClone(v);conflict.title='Different saved content';
 const incoming={...emptyStore(),visits:[conflict],preferences:['Existing','New']};const before=JSON.stringify(base);
 const plan=planLibraryImport(base,incoming);assert.equal(plan.additions.length,1);assert.notEqual(plan.additions[0].id,v.id);assert.deepEqual(plan.preferences,['New']);assert.match(plan.rows[0].result,/separate copy/);assert.equal(JSON.stringify(base),before);
 const merged={...base,visits:[v,...plan.additions],preferences:[...base.preferences,...plan.preferences]};const repeat=planLibraryImport(merged,incoming);assert.equal(repeat.additions.length,0);assert.equal(repeat.preferences.length,0);
 assert.equal(planLibraryImport(base,base).additions.length,0);
});
test('search finds titles, questions and action contacts but does not expose private notes',()=>{
 const v=fixture();for(const word of ['fictional first','REFERRAL','call service','fictional office','2026-10-01'])assert.deepEqual(findVisits([v],word),[v]);
 assert.deepEqual(findVisits([v],'PRIVATE_PREP'),[]);assert.deepEqual(findVisits([v],'PRIVATE_ANSWER'),[]);
});
