import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
globalThis.crypto ||=webcrypto;
import {emptyStore,blank,question,readStore} from '../model.mjs';
import {newPreparation,completePreparation,applyPreparationBatch} from '../preparation-model.mjs';
import {carryWork} from '../followup-model.mjs';
import {defaultDisplay} from '../display.mjs';
import {captureRecovery} from '../recovery-model.mjs';
import {makeTransfer,readTransfer,planTransfer,applyTransferPlan,transferId,TRANSFER_LIMIT} from '../transfer-model.mjs';

function fixture(){
 const s=emptyStore(),v=blank();v.title='Original visit';v.questions=[question('Who should I contact?')];v.current=v.questions[0].id;v.privateNotes='PRIVATE_VISIT';s.visits=[v];s.preferences=['Please give me time'];s.focus={visitId:v.id,kind:'question',itemId:v.current};
 const p=newPreparation();p.name='Unfinished preparation';p.source='PRIVATE_SOURCE';p.items=[{id:'passage',kind:'question',text:'What happens next?'}];p.destination={kind:'saved',visitId:v.id,snapshot:structuredClone(v)};s.preparations=[p];return s;
}
test('one private file round trips visits preparation focus and reading choices without recovery',async()=>{
 const s=fixture(),before=JSON.stringify(s),file=readTransfer(makeTransfer(s,{display:defaultDisplay()}));
 assert.equal(file.store.visits[0].privateNotes,'PRIVATE_VISIT');assert.equal(file.store.preparations[0].source,'PRIVATE_SOURCE');assert.deepEqual(file.store.focus,s.focus);assert.deepEqual(file.display,defaultDisplay());assert.deepEqual(file.store.recovery,[]);assert.deepEqual(file.store.transfers,[]);assert.equal(JSON.stringify(s),before);
 const plan=await planTransfer(emptyStore(),file,1);assert.equal(plan.next.visits.length,1);assert.equal(plan.next.preparations.length,1);assert.equal(plan.next.focus,null);assert.deepEqual(applyTransferPlan(emptyStore(),emptyStore(),plan,{includeFocus:true}).focus,s.focus);assert.equal(plan.next.transfers.length,1);
});
test('file identity ignores formatting and local revisions but not changed content',async()=>{
 const s=fixture(),a=readTransfer(makeTransfer(s));s.revision=20;const b=readTransfer(makeTransfer(s));assert.equal(await transferId(a),await transferId(b));b.store.visits[0].title='Changed';assert.notEqual(await transferId(a),await transferId(b));
});
test('duplicate transfer after editing and deletion does not resurrect content',async()=>{
 const file=readTransfer(makeTransfer(fixture())),first=await planTransfer(emptyStore(),file,1),changed=structuredClone(first.next);changed.visits=[];changed.preparations[0].source='Later source';const again=await planTransfer(changed,file,2);assert.equal(again.repeated,true);assert.deepEqual(again.next,changed);
});
test('different visits keep both and remap copied source focus and preparation destination',async()=>{
 const incoming=fixture(),base=structuredClone(incoming);base.visits[0].title='Local changed visit';base.preparations[0].source='Local changed preparation';incoming.visits.push(carryWork(incoming.visits,[incoming.focus]));
 const before=JSON.stringify(base),plan=await planTransfer(base,readTransfer(makeTransfer(incoming))),added=plan.next.visits.find(v=>v.title==='Original visit');assert.notEqual(added.id,incoming.visits[0].id);assert.equal(plan.next.visits.length,3);assert.equal(plan.focus.visitId,added.id);assert.equal(plan.next.visits[2].questions[0].origin.localVisitId,added.id);assert.equal(plan.next.preparations[1].destination.visitId,added.id);assert.equal(plan.next.preparations[1].destination.snapshot.id,added.id);assert.equal(JSON.stringify(base),before);
});
test('identical preparation must not attach to a different edited saved destination',async()=>{
 const incoming=fixture(),base=structuredClone(incoming);base.visits[0].title='Changed only on receiver';const plan=await planTransfer(base,readTransfer(makeTransfer(incoming)));assert.equal(plan.next.preparations.length,2);assert.notEqual(plan.next.preparations[0].destination.visitId,plan.next.preparations[1].destination.visitId);
});
test('missing saved destinations and absent source links never bind to same-ID local records',async()=>{
 const incoming=fixture(),base=structuredClone(incoming),copied=carryWork(incoming.visits,[incoming.focus]);base.visits[0].title='Unrelated local visit';incoming.visits=[copied];incoming.focus=null;const plan=await planTransfer(base,readTransfer(makeTransfer(incoming)));const p=plan.next.preparations.at(-1);assert.notEqual(p.destination.visitId,base.visits[0].id);assert.ok(!plan.next.visits.some(v=>v.id===p.destination.visitId));assert.equal(plan.next.visits.at(-1).questions[0].origin.localVisitId,null);assert.ok(plan.warnings.length>=2);
});
test('unsaved visit and preparation are separate retained preparation copies, not overwritten saved visits',async()=>{
 const s=fixture(),visit=structuredClone(s.visits[0]),preparation=structuredClone(s.preparations[0]);visit.title='Unsaved wording';preparation.source='Unsaved source';const plan=await planTransfer(emptyStore(),readTransfer(makeTransfer(s,{visit,preparation})));assert.equal(plan.next.visits.length,1);assert.equal(plan.next.preparations.length,3);const holder=plan.next.preparations.find(p=>plan.record.drafts.includes(p.id));assert.equal(holder.destination.kind,'draft');assert.equal(holder.destination.snapshot.title,'Unsaved wording');assert.notEqual(holder.destination.visitId,plan.next.visits[0].id);assert.equal(plan.next.preparations.filter(p=>p.source==='Unsaved source').length,1);
});
test('completed preparation results and receipts remap together on conflict',async()=>{
 const incoming=fixture(),p=incoming.preparations[0],result=structuredClone(incoming.visits[0]);result.questions.push(question('Added before transfer'));const done=completePreparation(p,result,1,0);done.destination={kind:'saved',visitId:result.id,snapshot:result};incoming.visits=[result];incoming.preparations=[done];incoming.preparationReceipts=[{batchId:p.batchId,preparationId:p.id,visitId:result.id}];
 const base=structuredClone(incoming);base.visits[0].title='Other recorded result';base.preparations[0].result.title='Other recorded result';const plan=await planTransfer(base,readTransfer(makeTransfer(incoming))),added=plan.next.preparations.at(-1),receipt=plan.next.preparationReceipts.at(-1);assert.notEqual(receipt.batchId,p.batchId);assert.equal(added.completed[0].batchId,receipt.batchId);assert.equal(added.result.id,receipt.visitId);assert.equal(added.destination.visitId,receipt.visitId);assert.equal(added.id,receipt.preparationId);assert.equal(plan.next.preparationReceipts.length,2);
});
test('an older pending preparation stays blocked by a retained completion receipt',async()=>{
 const s=fixture(),older=readTransfer(makeTransfer(s)),p=s.preparations[0],done=completePreparation(p,s.visits[0],1,0);s.preparations=[done];s.preparationReceipts=[{batchId:p.batchId,preparationId:p.id,visitId:s.visits[0].id}];const plan=await planTransfer(s,older),pending=plan.next.preparations.find(x=>x.items.length);assert.equal(pending.batchId,p.batchId);assert.throws(()=>applyPreparationBatch(plan.next,pending,s.visits[0],1,0,true),/already added/);
});
test('transfer back preserves both edited versions with correct pending destinations',async()=>{
 const a=fixture(),toB=await planTransfer(emptyStore(),readTransfer(makeTransfer(a)));const b=toB.next;b.visits[0].title='Edited on B';b.preparations[0].source='Prepared on B';const back=await planTransfer(a,readTransfer(makeTransfer(b)));assert.equal(back.next.visits.length,2);assert.equal(back.next.preparations.length,2);assert.equal(back.next.visits[0].title,'Original visit');assert.equal(back.next.preparations[1].destination.visitId,back.next.visits[1].id);assert.equal(back.next.preparations[1].source,'Prepared on B');
});
test('invalid files, recovery payloads and stale previews do not change their inputs',async()=>{
 const s=fixture(),text=makeTransfer(s),file=JSON.parse(text);assert.throws(()=>readTransfer('broken'));assert.throws(()=>readTransfer('x'.repeat(TRANSFER_LIMIT+1)));file.version=99;assert.throws(()=>readTransfer(JSON.stringify(file)));file.version=2;file.store.transfers=[{id:'bad'}];assert.throws(()=>readTransfer(JSON.stringify(file)));const plan=await planTransfer(emptyStore(),readTransfer(text)),changed=emptyStore();changed.revision++;assert.throws(()=>applyTransferPlan(changed,emptyStore(),plan),/changed/);assert.deepEqual(plan.next.visits,s.visits);
});
test('collection five upgrades in memory without changing the original and rejects damaged transfer records',()=>{
 const old=fixture();old.version=5;delete old.transfers;const raw=JSON.stringify(old),next=readStore(raw);assert.equal(next.version,7);assert.deepEqual(next.transfers,[]);assert.equal(JSON.parse(raw).version,5);next.transfers=[{id:'invalid'}];assert.throws(()=>readStore(JSON.stringify(next)));
});
test('a retained draft result sharing an old saved ID stays separate from that saved visit',async()=>{
 const s=fixture(),p=s.preparations[0],result=structuredClone(s.visits[0]);result.title='Newer temporary result';const finished=completePreparation(p,result,1,0);finished.destination={kind:'draft',visitId:result.id,snapshot:result};s.preparations=[finished];s.preparationReceipts=[{batchId:p.batchId,preparationId:p.id,visitId:result.id}];
 const plan=await planTransfer(emptyStore(),readTransfer(makeTransfer(s))),retained=plan.next.preparations[0];assert.notEqual(retained.result.id,plan.next.visits[0].id);assert.equal(retained.result.title,'Newer temporary result');assert.equal(retained.destination.visitId,retained.result.id);assert.equal(plan.next.preparationReceipts[0].visitId,retained.result.id);assert.equal(plan.next.visits[0].title,'Original visit');
});
test('two retained versions of one completed draft preserve distinct results and completion links',async()=>{
 const s=fixture(),p=s.preparations[0],result=structuredClone(s.visits[0]),one=completePreparation(p,result,1,0);one.destination={kind:'draft',visitId:result.id,snapshot:result};const two=structuredClone(one);two.id='other-preparation';two.result.title='Another retained version';s.preparations=[one,two];s.preparationReceipts=[{batchId:p.batchId,preparationId:p.id,visitId:result.id}];
 const plan=await planTransfer(emptyStore(),readTransfer(makeTransfer(s)));assert.notEqual(plan.next.preparations[0].result.id,plan.next.preparations[1].result.id);for(const prep of plan.next.preparations){const receipt=plan.next.preparationReceipts.find(r=>r.batchId===prep.completed[0].batchId);assert.equal(receipt.visitId,prep.result.id);assert.equal(receipt.preparationId,prep.id);}assert.equal(plan.next.visits.length,1);
});
test('real recovery content is excluded from exports and refused in transfer input',async()=>{
 const before=fixture(),after=structuredClone(before);before.visits[0].privateNotes='REMOVED_PRIVATE_WORDING';after.recovery=captureRecovery(before,after,{now:Date.now()});assert.ok(after.recovery.length);const text=makeTransfer(after);assert.ok(!text.includes('REMOVED_PRIVATE_WORDING'));const file=JSON.parse(text);file.store.recovery=after.recovery;assert.throws(()=>readTransfer(JSON.stringify(file)),/unsupported recovery/);const plan=await planTransfer(emptyStore(),readTransfer(text));assert.ok(!JSON.stringify(plan.record).includes('PRIVATE'));assert.deepEqual(plan.next.recovery,[]);
});
test('transfer back keeps unchanged copied wording separate when its source version changed',async()=>{
 const a=fixture();a.visits.push(carryWork(a.visits,[a.focus]));const b=(await planTransfer(emptyStore(),readTransfer(makeTransfer(a)))).next;b.visits[0].title='Source edited elsewhere';const back=await planTransfer(a,readTransfer(makeTransfer(b))),source=back.next.visits.find(v=>v.title==='Source edited elsewhere'),copy=back.next.visits.find(v=>v.questions[0]?.origin?.localVisitId===source.id);assert.ok(copy);assert.notEqual(copy.id,a.visits[1].id);assert.deepEqual(back.next.visits.slice(0,2),a.visits);assert.equal(back.record.visits[1],copy.id);
});
