import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
globalThis.crypto ??= webcrypto;
import {blank, question, emptyStore, readStore, libraryBackup, restoreLibrary} from '../model.mjs';
import {passage, appendPassages} from '../intake-model.mjs';
import {newPreparation, validatePreparation, preparationBackup, restorePreparation, completePreparation, preparationDestination, applyPreparationBatch} from '../preparation-model.mjs';
import {readStore as previousReadStore} from './fixtures/continuity/model.mjs';

function fixture() {
  const p = newPreparation(); p.name = 'Fictional preparation'; p.source = 'Private source not shared';
  p.items = [passage('Question to ask', 0, 15, 'question'), passage('Private detail', 0, 14, 'private')];
  return p;
}

test('preparation round trip preserves edited and empty unfinished choices, source and destination', () => {
  const p = fixture(), v = blank(); v.questions = [question('Original')]; v.current = v.questions[0].id;
  p.items[0].text = ''; p.items[1].text = 'Edited private wording'; p.destination = {kind:'draft',visitId:v.id,snapshot:v};
  assert.deepEqual(restorePreparation(preparationBackup(p)), p);
  assert.equal(p.items[0].text, '');
});
test('preparation validation refuses wrong formats, duplicate ids, invalid destinations and records', () => {
  const p = fixture(); assert.throws(()=>restorePreparation(JSON.stringify({format:'my-visit-notes-backup',version:1,visit:blank()})));
  for (const bad of [{...p,version:2},{...p,items:[p.items[0],p.items[0]]},{...p,destination:{kind:'saved',visitId:'wrong',snapshot:blank()}},{...p,result:blank()},{...p,completed:[{batchId:p.batchId,visitId:'x',added:2,skipped:0}]}]) assert.throws(()=>validatePreparation(bad));
});
test('destination identity stays stable and detects changed or missing saved visits', () => {
  const p = fixture(), v = blank(); p.destination = {kind:'saved',visitId:v.id,snapshot:v};
  assert.equal(preparationDestination(p,[v]).state,'unchanged');
  assert.equal(preparationDestination(p,[{...v,title:'Changed elsewhere'}]).state,'changed');
  assert.equal(preparationDestination(p,[blank()]).state,'missing');
  p.destination.kind='draft'; assert.deepEqual(preparationDestination(p,[]).visit,v);
});
test('completion clears pending items and preserves the resulting temporary draft', () => {
  const p=fixture(), result=appendPassages(blank(),p.items).visit, before=structuredClone(p);
  const finished=completePreparation(p,result,2,0);
  assert.deepEqual(p,before); assert.deepEqual(finished.items,[]); assert.notEqual(finished.batchId,p.batchId);
  assert.equal(finished.completed[0].batchId,p.batchId); assert.deepEqual(finished.result,result);
  assert.deepEqual(restorePreparation(preparationBackup(finished)),finished);
  assert.throws(()=>completePreparation(p,result,1,0));
});
test('atomic transition updates destination and completion together; old batches cannot replay', () => {
  const p=fixture(), v=blank(); p.destination={kind:'saved',visitId:v.id,snapshot:v};
  const store={visits:[v],preparations:[p],preparationReceipts:[]}, before=structuredClone(store);
  const result=appendPassages(v,p.items).visit, next=applyPreparationBatch(store,p,result,2,0,true);
  assert.deepEqual(store,before); assert.deepEqual(next.store.visits[0],result); assert.deepEqual(next.store.preparations[0].items,[]);
  assert.equal(next.store.preparationReceipts[0].batchId,p.batchId);
  assert.throws(()=>applyPreparationBatch(next.store,p,result,2,0,true),/already added/);
  next.store.preparations=[];
  assert.throws(()=>applyPreparationBatch(next.store,p,result,2,0,true),/already added/);
});
test('atomic transition rejects stale preparation or destination without mutating data', () => {
  const p=fixture(), v=blank(); p.destination={kind:'saved',visitId:v.id,snapshot:structuredClone(v)};
  const store={visits:[v],preparations:[p],preparationReceipts:[]}, result=appendPassages(v,p.items).visit;
  const changed=structuredClone(store); changed.visits[0].title='Newer'; const before=structuredClone(changed);
  assert.throws(()=>applyPreparationBatch(changed,p,result,2,0,true),/destination changed/); assert.deepEqual(changed,before);
  const other=structuredClone(store); other.preparations[0].source='New source'; assert.throws(()=>applyPreparationBatch(other,p,result,2,0,true),/preparation changed/);
});
test('temporary result is kept in preparation without saving a visit', () => {
  const p=fixture(), store={visits:[],preparations:[p],preparationReceipts:[]};
  const result=appendPassages(blank(),p.items).visit, next=applyPreparationBatch(store,p,result,2,0,false);
  assert.deepEqual(next.store.visits,[]); assert.equal(next.preparation.destination.kind,'draft'); assert.deepEqual(next.preparation.result,result);
});
test('v1 and v2 collections migrate in memory; v3 validates saved preparations and receipts', () => {
  const old={version:2,revision:7,visits:[blank()],preferences:['Wait']}, raw=JSON.stringify(old);
  const migrated=readStore(raw); assert.equal(migrated.version,7); assert.deepEqual(migrated.transfers,[]); assert.deepEqual(migrated.preparations,[]); assert.deepEqual(migrated.recovery,[]); assert.equal(migrated.focus,null); assert.equal(JSON.stringify(old),raw);
  migrated.preparations=[fixture()]; assert.deepEqual(readStore(JSON.stringify(migrated)),migrated);
  assert.throws(()=>readStore(JSON.stringify({...migrated,preparations:[migrated.preparations[0],migrated.preparations[0]]})));
  const receipt={batchId:'batch',preparationId:'prep',visitId:'visit'};
  assert.throws(()=>readStore(JSON.stringify({...migrated,preparationReceipts:[receipt,receipt]})));
});
test('visit-library backup excludes preparation source; separate backup retains it', () => {
  const p=fixture(), store={...emptyStore(),preparations:[p]};
  assert.ok(!libraryBackup(store).includes(p.source)); assert.deepEqual(restoreLibrary(libraryBackup(store)).preparations,[]);
  assert.equal(restorePreparation(preparationBackup(p)).source,p.source);
});
test('previous version-2 app rejects version-3 storage rather than dropping preparation',()=>{
 const raw=JSON.stringify({...emptyStore(),preparations:[fixture()]});
 assert.throws(()=>previousReadStore(raw),/unsupported/);
 assert.equal(readStore(raw).preparations.length,1);
});
