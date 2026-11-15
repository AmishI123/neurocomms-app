import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
globalThis.crypto ||= webcrypto;
import {blank,question,action,emptyStore,readStore} from '../model.mjs';
import {newPreparation,completePreparation} from '../preparation-model.mjs';
import {activeRecovery,visitChanges,batchChanges,recordChanges,captureRecovery,recoveryPreview,applyRecovery,validateRecovery} from '../recovery-model.mjs';

const fixture=()=>{const v=blank();v.title='Fictional visit';v.questions=[question('First'),question('Second')];v.current=v.questions[0].id;v.actions=[action('Call')];return {...emptyStore(),visits:[v],recovery:[]};};
const capture=(before,after)=>{after.recovery=captureRecovery(before,after,{now:1000});return after;};
test('removed question recovers notes and state without replacing newer work',()=>{
 const before=fixture();before.visits[0].questions[0].note='Private answer';before.visits[0].questions[0].state='Answered';
 const after=structuredClone(before);after.visits[0].questions.shift();after.visits[0].current=after.visits[0].questions[0].id;capture(before,after);
 after.visits[0].title='Newer title';const r=after.recovery[0],p=recoveryPreview(after,r,[0]);const restored=applyRecovery(after,r.id,p,1001);
 assert.deepEqual(restored.visits[0].questions,before.visits[0].questions);assert.equal(restored.visits[0].title,'Newer title');assert.equal(after.visits[0].questions.length,1);
});
test('next step recovery includes date contact and state',()=>{
 const before=fixture();Object.assign(before.visits[0].actions[0],{date:'2026-10-01',contact:'Office',state:'Done'});const after=structuredClone(before);after.visits[0].actions=[];capture(before,after);
 const r=after.recovery[0];assert.deepEqual(applyRecovery(after,r.id,recoveryPreview(after,r,[0]),1001).visits[0].actions,before.visits[0].actions);
});
test('earlier wording restore preserves other fields and checks preview freshness',()=>{
 const before=fixture(),after=structuredClone(before);after.visits[0].questions[0].text='Wrong wording';capture(before,after);const r=after.recovery[0];
 after.visits[0].questions[0].note='Later note';const p=recoveryPreview(after,r,[0]);const restored=applyRecovery(after,r.id,p,1001);assert.equal(restored.visits[0].questions[0].text,'First');assert.equal(restored.visits[0].questions[0].note,'Later note');
 after.visits[0].questions[0].text='Changed after preview';assert.throws(()=>applyRecovery(after,r.id,p,1001),/changed after/);
});
test('batch undo selects additions and warns about later edits',()=>{
 const before=fixture(),after=structuredClone(before);after.visits[0].questions.push(question('Added one'),question('Added two'));capture(before,after);const r=after.recovery[0];
 after.visits[0].questions[2].note='Later annotation';const p=recoveryPreview(after,r,[0]);assert.equal(p[0].changedSince,true);const restored=applyRecovery(after,r.id,p,1001);assert.equal(restored.visits[0].questions.length,3);assert.equal(restored.visits[0].questions[2].text,'Added two');
});
test('removed visit and preparation recover independently',()=>{
 const before=fixture();const preparation=newPreparation();preparation.source='Private source';before.preparations.push(preparation);const after=structuredClone(before);after.visits=[];after.preparations=[];capture(before,after);const r=after.recovery[0];
 const restored=applyRecovery(after,r.id,recoveryPreview(after,r,[1]),1001);assert.equal(restored.visits.length,0);assert.deepEqual(restored.preparations,before.preparations);
});
test('expiry and record cap are enforced',()=>{
 let records=[];const v=fixture().visits[0];for(let i=0;i<105;i++)records=recordChanges(records,visitChanges(v,null),'Removed',1000+i);
 assert.equal(records.length,100);assert.equal(activeRecovery(records,8*86400000).length,0);const s=fixture();s.recovery=records;assert.throws(()=>applyRecovery(s,records[0].id,[{index:0,current:null,restore:v}],8*86400000),/expired/);
});
test('consecutive typing merges one field but retains original wording',()=>{
 const before=fixture().visits[0],middle=structuredClone(before),after=structuredClone(before);middle.title='A';after.title='AB';
 let records=recordChanges([],visitChanges(before,middle),'Edit',1000,true);records=recordChanges(records,visitChanges(middle,after),'Edit',1100,true);assert.equal(records.length,1);assert.equal(records[0].changes[0].before,'Fictional visit');assert.equal(records[0].changes[0].after,'AB');
});
test('invalid recovery paths and duplicate identifiers are rejected',()=>{
 const v=fixture().visits[0],r=recordChanges([],visitChanges(v,null),'Removed',1000);assert.deepEqual(validateRecovery(r),r);assert.throws(()=>validateRecovery([...r,...r]));r[0].changes[0].path=['__proto__'];assert.throws(()=>validateRecovery(r),/field/);
});
test('private batch removal preserves newer private notes and rejects ambiguous wording',()=>{
 const before=fixture(),after=structuredClone(before);before.visits[0].privateNotes='Earlier';after.visits[0].privateNotes='Earlier\n\nAdded';after.recovery=recordChanges([],batchChanges(before.visits[0],after.visits[0]),'Batch',1000);
 after.visits[0].privateNotes+='\n\nNewer unrelated words';const r=after.recovery[0],p=recoveryPreview(after,r,[0]);assert.equal(p[0].restore,'Earlier\n\nNewer unrelated words');assert.equal(applyRecovery(after,r.id,p,1001).visits[0].privateNotes,p[0].restore);
 after.visits[0].privateNotes+='\n\nAdded';assert.throws(()=>recoveryPreview(after,r,[0]),/more than once/);
});
test('kept preparation result recovery does not save a visit or replay a batch',()=>{
 const before=fixture().visits[0],after=structuredClone(before);after.questions.push(question('Added'));
 const p=newPreparation();p.items=[{id:'item',kind:'question',text:'Added'}];const finished=completePreparation(p,after,1,0);finished.destination={kind:'draft',visitId:after.id,snapshot:after};
 const s={...emptyStore(),preparations:[finished],recovery:recordChanges([],batchChanges(before,after,p.id),'Batch',1000)};
 assert.deepEqual(validateRecovery(s.recovery),s.recovery);const r=s.recovery[0],next=applyRecovery(s,r.id,recoveryPreview(s,r,[0]),1001);
 assert.equal(next.visits.length,0);assert.deepEqual(next.preparations[0].result.questions,before.questions);assert.deepEqual(next.preparations[0].destination.snapshot,next.preparations[0].result);assert.deepEqual(next.preparations[0].completed,finished.completed);
});
test('used recovery selections are consumed and cannot be applied twice',()=>{
 const before=fixture(),after=structuredClone(before);after.visits[0].questions=[];after.visits[0].current=null;capture(before,after);const r=after.recovery[0],p=recoveryPreview(after,r,[0,1]),next=applyRecovery(after,r.id,p,1001);
 assert.equal(next.recovery.length,0);assert.throws(()=>applyRecovery(next,r.id,p,1002),/expired or was erased/);
});
test('malformed field values, state and append records are rejected',()=>{
 const before=fixture().visits[0],after=structuredClone(before);after.title='Other';let r=recordChanges([],visitChanges(before,after),'Edit',1000);r[0].changes[0].before={bad:true};assert.throws(()=>validateRecovery(r),/wording/);
 after.questions[0].state='Answered';r=recordChanges([],visitChanges(before,after),'Edit',1000);r[0].changes[1].before='wrong';assert.throws(()=>validateRecovery(r),/state/);
 r=recordChanges([],visitChanges(before,after),'Edit',1000);r[0].changes[0].append='invalid';assert.throws(()=>validateRecovery(r),/addition/);
});
test('version-three migration preserves preparation and receipts without mutating source',()=>{
 const old={...fixture(),version:3,preparations:[newPreparation()],preparationReceipts:[{batchId:'completed',preparationId:'prep',visitId:'visit'}]};delete old.recovery;const raw=JSON.stringify(old),next=readStore(raw);
 assert.equal(next.version,7);assert.deepEqual(next.transfers,[]);assert.deepEqual(next.recovery,[]);assert.deepEqual(next.visits,old.visits);assert.deepEqual(next.preparations,old.preparations);assert.deepEqual(next.preparationReceipts,old.preparationReceipts);assert.equal(next.focus,null);assert.equal(JSON.stringify(old),raw);
});
