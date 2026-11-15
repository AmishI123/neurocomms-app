import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto,createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {readStore as readCollection6} from './fixtures/collection6-model.mjs';
globalThis.crypto ||=webcrypto;
import {blank,question,action,emptyStore,readStore,backup,libraryBackup} from '../model.mjs';
import {newFollowupDraft,saveFollowupDraft,deleteFollowupDraft,finishProgressDraft,draftSourceState,followupDraftBackup,readFollowupDraftBackup,planDraftRestore} from '../draft-model.mjs';
import {validateDraft} from '../draft-record.mjs';
import {makeTransfer,readTransfer,planTransfer,transferId} from '../transfer-model.mjs';
const setup=()=>{const v=blank();v.title='Fictional source';v.date='2026-10-01';v.questions=[question('Ask about the next visit')];v.questions[0].note='PRIVATE_ANSWER';v.current=v.questions[0].id;v.actions=[action('Call reception')];return {...emptyStore(),visits:[v]};};
const ref=(s,kind='question')=>({visitId:s.visits[0].id,kind,itemId:s.visits[0][kind==='question'?'questions':'actions'][0].id});
const progress=s=>newFollowupDraft(s.visits,[ref(s)],{kind:'progress',entry:{status:'Waiting for reply',date:'2026-10-03',note:'PRIVATE_UNFINISHED'},name:'Call later'},12);
test('collection six migrates without changing raw data and current drafts round-trip exactly',()=>{
 const old=setup();old.version=6;delete old.followupDrafts;const raw=JSON.stringify(old),s=readStore(raw);assert.equal(s.version,7);assert.deepEqual(s.followupDrafts,[]);assert.equal(JSON.parse(raw).version,6);
 const d=progress(s),saved=saveFollowupDraft(s,d);assert.deepEqual(readStore(JSON.stringify(saved)),saved);assert.deepEqual(s.followupDrafts,[]);assert.deepEqual(saved.visits,s.visits);
});
test('message draft saves exact edited text and sources without capturing answer notes',()=>{
 const s=setup(),text='\nExact <b>literal</b>\n\nLast line\n',d=newFollowupDraft(s.visits,[ref(s)],{text,name:'Message'}),saved=saveFollowupDraft(s,d);
 assert.equal(saved.followupDrafts[0].text,text);assert.equal(d.sources[0].expected,null);assert.ok(!JSON.stringify(d).includes('PRIVATE_ANSWER'));assert.deepEqual(saved.visits,s.visits);assert.deepEqual(readFollowupDraftBackup(followupDraftBackup(d)),d);
});
test('updating or deleting a saved draft requires its exact previous copy',()=>{
 const s=setup(),d=progress(s),saved=saveFollowupDraft(s,d),edited={...d,name:'New name',updatedAt:13};const newer=saveFollowupDraft(saved,edited,d);
 assert.throws(()=>saveFollowupDraft(newer,{...d,name:'Stale'},d),/changed/);assert.throws(()=>deleteFollowupDraft(newer,d),/changed/);
 assert.deepEqual(saveFollowupDraft(saved,d),saved);assert.equal(deleteFollowupDraft(newer,edited).followupDrafts.length,0);
 assert.throws(()=>saveFollowupDraft(deleteFollowupDraft(saved,d),edited,d),/deleted/);assert.deepEqual(saved.followupDrafts,[d]);
});
test('finish adds progress once and removes only the expected draft in the same returned collection',()=>{
 const s=setup(),d=progress(s),message=newFollowupDraft(s.visits,[ref(s)],{text:'Keep message'}),saved=saveFollowupDraft(saveFollowupDraft(s,d),message),next=finishProgressDraft(saved,d,d,20);
 assert.deepEqual(next.followupDrafts,[message]);assert.equal(next.visits[0].questions[0].history.length,1);assert.equal(next.visits[0].questions[0].history[0].note,'PRIVATE_UNFINISHED');assert.equal(next.visits[0].questions[0].state,'Waiting for reply');
 assert.throws(()=>finishProgressDraft(next,d,d,21),/deleted/);assert.equal(saved.visits[0].questions[0].history.length,0);assert.equal(saved.followupDrafts.length,2);
});
test('changed or missing sources keep the draft and cannot be replaced by similar wording',()=>{
 const s=setup(),d=progress(s),saved=saveFollowupDraft(s,d),changed=structuredClone(saved);changed.visits[0].questions[0].note='NEWER_NOTE';
 assert.equal(draftSourceState(changed.visits,d)[0].state,'changed');assert.throws(()=>finishProgressDraft(changed,d,d),/changed/);assert.deepEqual(changed.followupDrafts,[d]);
 const missing=structuredClone(saved);missing.visits[0].questions=[question(d.sources[0].text)];missing.visits[0].current=missing.visits[0].questions[0].id;
 assert.equal(draftSourceState(missing.visits,d)[0].state,'missing');assert.throws(()=>finishProgressDraft(missing,d,d),/no longer/);assert.equal(readFollowupDraftBackup(followupDraftBackup(d)).entry.note,'PRIVATE_UNFINISHED');
});
test('finishing an older open copy cannot delete a saved draft changed elsewhere',()=>{
 const s=setup(),d=progress(s),saved=saveFollowupDraft(s,d),newer=saveFollowupDraft(saved,{...d,name:'Other tab'},d),before=JSON.stringify(newer);
 assert.throws(()=>finishProgressDraft(newer,d,d),/changed/);assert.equal(JSON.stringify(newer),before);
});
test('private draft restore keeps different copies, skips identical copies and never guesses a source',()=>{
 const s=setup(),d=progress(s),saved=saveFollowupDraft(s,d),plan=planDraftRestore(saved,readFollowupDraftBackup(followupDraftBackup(d)));
 assert.equal(plan.added,true);assert.equal(plan.next.followupDrafts.length,2);assert.notEqual(plan.draft.id,d.id);assert.equal(plan.draft.sources[0].localVisitId,null);assert.equal(draftSourceState(s.visits,plan.draft)[0].state,'missing');
 assert.equal(planDraftRestore(plan.next,d).added,false);assert.deepEqual(plan.next.visits,s.visits);assert.equal(saved.followupDrafts.length,1);
});
test('malformed and unsupported drafts and backups fail rather than lose original fields',()=>{
 const d=progress(setup());for(const patch of [{version:2},{sources:[]},{kind:'unknown'},{entry:{...d.entry,date:'2026-02-30'}},{entry:{...d.entry,note:'x'.repeat(5001)}},{name:'x'.repeat(201)},{text:'not a progress field'}])assert.throws(()=>validateDraft({...d,...patch}));
 assert.throws(()=>readFollowupDraftBackup('{broken'));assert.throws(()=>readFollowupDraftBackup(JSON.stringify({format:'my-visit-notes-followup-draft',version:99,draft:d})));
 assert.throws(()=>readStore(JSON.stringify({...setup(),followupDrafts:[d,d]})));assert.throws(()=>readFollowupDraftBackup(' '.repeat(10*1024*1024+1)));
});
test('visit and library backups do not accidentally include independent follow-up drafts',()=>{
 const s=setup(),saved=saveFollowupDraft(s,progress(s));assert.ok(!backup(saved.visits[0]).includes('PRIVATE_UNFINISHED'));assert.ok(!libraryBackup(saved).includes('PRIVATE_UNFINISHED'));assert.ok(followupDraftBackup(saved.followupDrafts[0]).includes('PRIVATE_UNFINISHED'));
});
test('new transfer carries drafts and maps the original item to its imported source version',async()=>{
 const s=setup(),d=progress(s),source=saveFollowupDraft(s,d),receiver=structuredClone(s);receiver.visits[0].title='Different local visit';receiver.visits[0].questions[0].text='Unrelated local wording';
 const file=readTransfer(makeTransfer(source));assert.equal(file.version,2);const plan=await planTransfer(receiver,file,30),draft=plan.next.followupDrafts[0];
 assert.notEqual(draft.sources[0].localVisitId,receiver.visits[0].id);assert.equal(draftSourceState(plan.next.visits,draft)[0].state,'current');const completed=finishProgressDraft(plan.next,draft,draft,31);assert.deepEqual(completed.visits[0],receiver.visits[0]);assert.equal(completed.visits[1].questions[0].history.length,1);
 assert.equal(plan.record.followupDrafts.length,1);assert.equal((await planTransfer(plan.next,file)).repeated,true);
});
test('transfer without a source cannot bind progress to an unrelated local same-ID visit',async()=>{
 const s=setup(),d=progress(s),source=saveFollowupDraft(s,d);source.visits=[];const plan=await planTransfer(s,readTransfer(makeTransfer(source))),draft=plan.next.followupDrafts[0];
 assert.equal(draft.sources[0].localVisitId,null);assert.throws(()=>finishProgressDraft(plan.next,draft,draft),/no longer/);assert.deepEqual(plan.next.visits,s.visits);
});
test('legacy transfer fingerprints remain exact and do not recreate deleted notes after upgrade',async()=>{
 const fixture=JSON.parse(readFileSync(new URL('./fixtures/legacy-transfer-v1.json',import.meta.url))),legacy=fixture.file,legacyStore=legacy.store;
 // This is the old v1 canonical file, not a hash produced by the new migration.
 const oldId=createHash('sha256').update(JSON.stringify(legacy)).digest('hex');assert.equal(oldId,fixture.id);assert.equal(await transferId(legacy),oldId);
 const oldReceiver={...legacyStore,visits:[],transfers:[{id:oldId,at:10,visits:[legacyStore.visits[0].id],preparations:[],drafts:[],focus:null}]};
 const upgraded=readStore(JSON.stringify(oldReceiver)),plan=await planTransfer(upgraded,readTransfer(JSON.stringify(legacy)));assert.equal(plan.repeated,true);assert.equal(plan.next.visits.length,0);
 assert.throws(()=>readTransfer(JSON.stringify({...legacy,store:setup()})),/older transfer/);
});
test('transfer back preserves different draft wording and source copies without altering local originals',async()=>{
 const s=setup(),d=progress(s),first=saveFollowupDraft(s,d),out=await planTransfer(emptyStore(),readTransfer(makeTransfer(first))),changed=structuredClone(out.next);
 changed.visits[0].title='Changed source title';changed.followupDrafts[0].entry.note='OTHER_DEVICE_NOTE';
 const returned=await planTransfer(first,readTransfer(makeTransfer(changed)));assert.deepEqual(returned.next.followupDrafts[0],d);assert.equal(returned.next.followupDrafts.length,2);assert.deepEqual(returned.next.visits[0],first.visits[0]);
 const incoming=returned.next.followupDrafts[1];assert.notEqual(incoming.id,d.id);assert.notEqual(incoming.sources[0].localVisitId,s.visits[0].id);assert.equal(incoming.entry.note,'OTHER_DEVICE_NOTE');
});
test('unchanged drafts transferred back reuse the local original rather than duplicating link metadata',async()=>{
 const s=setup(),d=progress(s),first=saveFollowupDraft(s,d),out=await planTransfer(emptyStore(),readTransfer(makeTransfer(first))),back=await planTransfer(first,readTransfer(makeTransfer(out.next)));
 assert.equal(back.next.followupDrafts.length,1);assert.deepEqual(back.next.followupDrafts[0],d);assert.deepEqual(back.record.followupDrafts,[d.id]);
});
test('the previous collection-six reader refuses collection seven rather than dropping saved drafts',()=>{
 const s=setup(),current=saveFollowupDraft(s,progress(s)),raw=JSON.stringify(current);assert.throws(()=>readCollection6(raw),/unsupported version/);assert.equal(JSON.stringify(current),raw);
 const legacy={...s,version:6};delete legacy.followupDrafts;assert.equal(readCollection6(JSON.stringify(legacy)).version,6);
});
