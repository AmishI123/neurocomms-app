import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
globalThis.crypto ||=webcrypto;
import {blank,question,action,validateVisit,emptyStore,readStore,backup,restore,libraryBackup,restoreLibrary,planLibraryImport} from '../model.mjs';
import {workList,findWork,updateFollowup,carryWork,messageDraft,recordStateChanges} from '../followup-model.mjs';
import {validateHistory} from '../followup-record.mjs';
const setup=()=>{const a=blank(),b=blank();a.title='First visit';b.title='Second visit';a.privateNotes='PRIVATE_PREPARATION';a.questions=[{...question('Ask about timing'),note:'PRIVATE_ANSWER'}];a.current=a.questions[0].id;b.actions=[{...action('Call office'),contact:'Reception'}];return [a,b].map(validateVisit);};
test('unfinished overview covers saved visits and excludes private search content',()=>{
 const visits=setup(),rows=workList(visits);assert.equal(rows.length,2);assert.equal(rows[0].title,'First visit');assert.equal(workList(visits,{search:'PRIVATE'}).length,0);assert.equal(workList(visits,{search:'reception'}).length,1);assert.ok(!JSON.stringify(rows).includes('PRIVATE_ANSWER'));assert.ok(!JSON.stringify(rows).includes('PRIVATE_PREPARATION'));
});
test('contact waiting done and reopen keep a private item history without mutating inputs',()=>{
 const original=setup(),ref=workList(original)[0].ref;let visits=updateFollowup(original,ref,{status:'Contacted',note:'PRIVATE_CALL'},findWork(original,ref).item,10);
 visits=updateFollowup(visits,ref,{status:'Waiting for reply',date:'2026-10-02'},findWork(visits,ref).item,20);assert.equal(workList(visits)[0].status,'Waiting for reply');
 visits=updateFollowup(visits,ref,{status:'Done'},findWork(visits,ref).item,30);assert.equal(workList(visits).length,1);assert.equal(workList(visits,{includeClosed:true})[0].status,'Done');
 visits=updateFollowup(visits,ref,{status:'To do'},findWork(visits,ref).item,40);assert.equal(workList(visits).length,2);assert.equal(findWork(visits,ref).item.history.length,4);assert.equal(findWork(original,ref).item.history.length,0);
});
test('follow-up update rejects stale deleted invalid and oversized inputs',()=>{
 const visits=setup(),ref=workList(visits)[0].ref;assert.throws(()=>updateFollowup(visits,ref,{status:'Done'},{text:'different'}),/changed/);assert.throws(()=>updateFollowup([],ref,{status:'Done'}),/no longer/);assert.throws(()=>updateFollowup(visits,ref,{status:'Urgent'}));assert.throws(()=>updateFollowup(visits,ref,{status:'Contacted',date:'2026-02-30'}));assert.throws(()=>updateFollowup(visits,ref,{status:'Contacted',note:'x'.repeat(5001)}));
});
test('history keeps latest fifty entries and validates identifiers',()=>{
 let visits=setup();const ref=workList(visits)[0].ref;for(let i=0;i<55;i++)visits=updateFollowup(visits,ref,{status:'Contacted',note:String(i)},null,i);const history=findWork(visits,ref).item.history;assert.equal(history.length,50);assert.equal(history[0].note,'5');assert.throws(()=>validateHistory([history[0],history[0]]));
});
test('multi-visit carry-forward preserves origins but does not copy private notes or progress',()=>{
 const visits=setup(),refs=workList(visits).map(r=>r.ref);visits[0].questions[0].history=[{id:'old',status:'Contacted',date:'',note:'PRIVATE_HISTORY',at:1}];const before=JSON.stringify(visits),next=carryWork(visits,refs);assert.equal(next.questions.length,1);assert.equal(next.actions.length,1);assert.notEqual(next.questions[0].id,refs[0].itemId);assert.equal(next.questions[0].origin.visitId,visits[0].id);assert.equal(next.actions[0].origin.visitId,visits[1].id);assert.equal(next.questions[0].state,'Open');assert.equal(next.questions[0].note,'');assert.deepEqual(next.questions[0].history,[]);assert.ok(!JSON.stringify(next).includes('PRIVATE'));assert.equal(JSON.stringify(visits),before);assert.throws(()=>carryWork(visits,[refs[0],refs[0]]));
});
test('message draft uses only selected item wording and explicit context',()=>{
 const visits=setup(),refs=workList(visits).map(r=>r.ref),first=messageDraft(visits,[refs[0]]);assert.match(first,/Ask about timing/);assert.ok(!first.includes('Call office'));assert.ok(!first.includes('First visit'));assert.ok(!first.includes('PRIVATE'));
 const withContext=messageDraft(visits,refs,{includeVisit:true,includeContact:true});assert.match(withContext,/First visit/);assert.match(withContext,/Reception/);assert.ok(!withContext.includes('PRIVATE'));assert.throws(()=>messageDraft(visits,[]));
});
test('visit and library backups preserve history and origin but exclude recovery and focus',()=>{
 let visits=setup();const refs=workList(visits).map(r=>r.ref);visits=updateFollowup(visits,refs[0],{status:'Waiting for reply',note:'Keep in private backup'});visits.push(carryWork(visits,[refs[0]]));assert.deepEqual(restore(backup(visits[0])),visits[0]);const store={...emptyStore(),visits,focus:refs[0]},file=libraryBackup(store),restored=restoreLibrary(file);assert.deepEqual(restored.visits,visits);assert.equal(restored.focus,null);assert.ok(!file.includes('"recovery"'));
});
test('older visits gain empty history without storage mutation; old progress survives current round trip',()=>{
 const legacy=setup()[0];legacy.version=2;legacy.questions.forEach(q=>{delete q.history;delete q.origin;});const raw=JSON.stringify({...emptyStore(),version:4,visits:[legacy]});const current=readStore(raw);assert.equal(current.version,7);assert.deepEqual(current.transfers,[]);assert.equal(current.visits[0].version,3);assert.deepEqual(current.visits[0].questions[0].history,[]);assert.equal(JSON.parse(raw).visits[0].version,2);assert.deepEqual(readStore(JSON.stringify(current)),current);
});
test('existing screen state changes create history once',()=>{
 const before=setup()[0],after=structuredClone(before);after.questions[0].state='Answered';const next=recordStateChanges(before,after,12);assert.equal(next.questions[0].history[0].status,'Done');assert.equal(recordStateChanges(before,next,13).questions[0].history.length,1);assert.equal(before.questions[0].history.length,0);
});
test('library source links remap collisions and repeated import remains idempotent',()=>{
 const visits=setup(),copied=carryWork(visits,[workList(visits)[0].ref]);visits.push(copied);const existing=setup();existing[0].id=visits[0].id;existing[0].title='Unrelated colliding visit';const base={...emptyStore(),visits:existing},incoming={...emptyStore(),visits};const plan=planLibraryImport(base,incoming),importedSource=plan.additions.find(v=>v.title==='First visit'),importedCopy=plan.additions.find(v=>v.id===copied.id);assert.notEqual(importedSource.id,visits[0].id);assert.equal(importedCopy.questions[0].origin.localVisitId,importedSource.id);assert.equal(importedCopy.questions[0].origin.visitId,visits[0].id);assert.equal(planLibraryImport({...base,visits:[...base.visits,...plan.additions]},incoming).additions.length,0);
});
