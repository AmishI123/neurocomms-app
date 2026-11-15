import {readStore,validateVisit,uid} from './model.mjs';
import {newPreparation,validatePreparation} from './preparation-model.mjs';
import {readDisplay} from './display.mjs';
import {findWork,unfinished} from './followup-model.mjs';
import {validateDraft} from './draft-record.mjs';
import {draftContentKey} from './draft-model.mjs';

export const TRANSFER_LIMIT=20*1024*1024;
const canonical=value=>JSON.stringify(value);
const cleanStore=s=>readStore(canonical(s));
const size=text=>new TextEncoder().encode(text).length;
function project(store){const s=cleanStore(store);return {...s,revision:0,recovery:[],transfers:[]};}

// Recovery is deliberately not a transfer lane. Imported receipts contain no notes.
export function makeTransfer(store,{display=null,visit=null,preparation=null}={}){
 const file={format:'my-visit-notes-transfer',version:2,store:project(store),display:display===null?null:readDisplay(canonical(display)),temporary:{visit:visit===null?null:validateVisit(visit),preparation:preparation===null?null:validatePreparation(preparation)}};
 const output=JSON.stringify(file,null,2);
 if(size(output)>TRANSFER_LIMIT)throw Error('Transfer exceeds the 20 MiB limit. Use smaller individual backups or reduce saved content first. Nothing was removed.');
 return output;
}
export function readTransfer(text){
 if(typeof text!=='string'||size(text)>TRANSFER_LIMIT)throw Error('Choose a transfer file no larger than 20 MiB.');
 const f=JSON.parse(text);
 if(!f||f.format!=='my-visit-notes-transfer'||![1,2].includes(f.version)||!f.temporary)throw Error('Choose a supported My Visit Notes transfer file. Existing notes have not changed.');
 if(f.version===1&&(f.store?.version>6||Object.hasOwn(f.store||{},'followupDrafts')))throw Error('An older transfer file cannot contain saved follow-up drafts.');
 if(f.version===2&&f.store?.version!==7)throw Error('This transfer version needs a supported saved-draft collection.');
 const s=cleanStore(f.store);
 if(s.recovery.length||s.transfers.length)throw Error('This file contains unsupported recovery or local transfer records.');
 const temporary={visit:f.temporary.visit===null?null:validateVisit(f.temporary.visit),preparation:f.temporary.preparation===null?null:validatePreparation(f.temporary.preparation)};
 const completed=new Map(s.preparationReceipts.map(r=>[r.batchId,r.visitId]));
 for(const p of [...s.preparations,...(temporary.preparation?[temporary.preparation]:[])])for(const e of p.completed){if(completed.has(e.batchId)&&completed.get(e.batchId)!==e.visitId)throw Error('Preparation completion records point to different results.');completed.set(e.batchId,e.visitId);}
 const projected=project(s);
 // Keep the exact legacy canonical shape. Previously recorded v1 hashes must
 // still suppress replay after a collection upgrade and subsequent deletion.
 if(f.version===1){projected.version=6;delete projected.followupDrafts;}
 return {format:f.format,version:f.version,store:projected,display:f.display===null?null:readDisplay(canonical(f.display)),temporary};
}
export async function transferId(file){const bytes=new TextEncoder().encode(canonical(readTransfer(JSON.stringify(file))));return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');}

function visitKey(v){const c=validateVisit(v);c.id='';for(const item of [...c.questions,...c.actions])if(item.origin)delete item.origin.localVisitId;return canonical(c);}
function preparationKey(p,map=id=>id){const c=validatePreparation(p);c.id='';if(c.destination.snapshot){c.destination.visitId=map(c.destination.visitId);c.destination.snapshot=JSON.parse(visitKey(c.destination.snapshot));}if(c.result){const id=map(c.result.id);c.result=JSON.parse(visitKey(c.result));c.result.id=id;}for(const e of c.completed)e.visitId=map(e.visitId);return canonical(c);}
const draftKey=p=>canonical([visitKey(p.destination.snapshot),p.result?.id===p.destination.visitId?visitKey(p.result):null]);
const unique=items=>[...new Set(items)];

// Pure planning: no writes, no deletion, no replacement of local notes.
export async function planTransfer(existing,file,now=Date.now()){
 const base=cleanStore(existing),incoming=readTransfer(JSON.stringify(file)),id=await transferId(incoming);
 const prior=base.transfers.find(r=>r.id===id);
 if(prior)return {id,repeated:true,next:base,record:prior,rows:[],warnings:['This exact transfer was already restored. Later edits and deletions are kept. Missing restored records will not be recreated.'],display:incoming.display,focus:prior.focus};
 const other=incoming.store,next=structuredClone(base),rows=[],warnings=[];
 const used=new Set([...base.visits.map(v=>v.id),...base.preparations.flatMap(p=>[p.destination.visitId,p.result?.id]).filter(Boolean)]);
 const visitMap=new Map(),preparationMap=new Map(),batchMap=new Map();
 const fresh=()=>{let id;do{id=uid();}while(used.has(id));used.add(id);return id;};
 const knownVisits=new Map(base.visits.map(v=>[visitKey(v),v.id]));
 const addVisits=[];
 for(const v of other.visits){
  const same=knownVisits.get(visitKey(v));
  if(same){visitMap.set(v.id,same);rows.push({kind:'visit',result:'Already present',source:v,targetId:same});continue;}
  const targetId=used.has(v.id)?fresh():v.id;used.add(targetId);visitMap.set(v.id,targetId);addVisits.push({...v,id:targetId});
  rows.push({kind:'visit',result:targetId===v.id?'Add visit':'Keep both different visits',source:v,targetId});
 }
 // Equal wording is not an equal record when the copied-source link resolves to
 // a different retained version. Resolve chains before building imported objects.
 let changed=true;
 while(changed){changed=false;for(const v of other.visits){const target=visitMap.get(v.id),local=base.visits.find(x=>x.id===target);if(!local)continue;
  const incomingItems=[...v.questions,...v.actions],localItems=[...local.questions,...local.actions];
  const differs=incomingItems.some((item,i)=>{if(!item.origin)return false;const source=Object.hasOwn(item.origin,'localVisitId')?item.origin.localVisitId:item.origin.visitId;const wanted=source&&other.visits.some(x=>x.id===source)?visitMap.get(source):null,existing=localItems[i].origin;return wanted!==(Object.hasOwn(existing,'localVisitId')?existing.localVisitId:existing.visitId);});
  if(differs){const id=fresh();visitMap.set(v.id,id);addVisits.push({...v,id});const row=rows.find(r=>r.source===v);row.targetId=id;row.result='Keep both source-linked versions';warnings.push('A copied item points to a different source version in this file. Its visit is kept separately so both source links stay correct.');changed=true;}
 }}
 // Allocate absent/draft identities separately, so they cannot bind to an unrelated local visit.
 const mappedVisit=(id,snapshot=null)=>{
  if(visitMap.has(id))return visitMap.get(id);
  const same=snapshot&&knownVisits.get(visitKey(snapshot));
  const target=same||fresh();visitMap.set(id,target);return target;
 };
 const sourceLink=origin=>{
  if(!origin)return null;const o=structuredClone(origin),source=Object.hasOwn(o,'localVisitId')?o.localVisitId:o.visitId;
  // Only a source actually included as a saved visit is safe to link from its title alone.
  if(source&&other.visits.some(v=>v.id===source))o.localVisitId=visitMap.get(source);
  else{o.localVisitId=null;warnings.push('A copied item has no source visit in this file. Its recorded source title and date are kept, but no local link is assumed.');}
  return o;
 };
 const remapVisit=(v,target)=>{const c=validateVisit(v);c.id=target;for(const item of [...c.questions,...c.actions])item.origin=sourceLink(item.origin);return c;};
 for(const v of addVisits)next.visits.push(remapVisit(v,v.id));

 const prepIds=new Set(base.preparations.map(p=>p.id)),knownPreparations=new Map(base.preparations.map(p=>[preparationKey(p),p.id]));
 const draftVersions=new Map();
 for(const p of base.preparations)if(p.destination.kind==='draft'&&!base.visits.some(v=>v.id===p.destination.visitId))draftVersions.set(draftKey(p),p.destination.visitId);
 const prepInputs=other.preparations.map(p=>({p,temporary:false}));
 if(incoming.temporary.preparation){const p=structuredClone(incoming.temporary.preparation);p.id=uid();prepInputs.push({p,temporary:true});}
 const prepVisitMaps=new Map();
 for(const {p}of prepInputs){
  let draftId=null;if(p.destination.kind==='draft'){const key=draftKey(p);draftId=draftVersions.get(key)||fresh();draftVersions.set(key,draftId);}
  const map=id=>p.destination.kind==='draft'&&id===p.destination.visitId?draftId:mappedVisit(id,p.destination.kind==='saved'&&id===p.destination.visitId?p.destination.snapshot:null);
  prepVisitMaps.set(p.id,map);if(p.destination.snapshot)map(p.destination.visitId);if(p.result)map(p.result.id);for(const e of p.completed)map(e.visitId);
 }
 const addPreparations=[];
 for(const {p,temporary}of prepInputs){
  const key=preparationKey(p,prepVisitMaps.get(p.id)),same=!temporary&&knownPreparations.get(key);
  if(same){preparationMap.set(p.id,same);rows.push({kind:'preparation',result:'Already present',source:p,targetId:same});continue;}
  const targetId=prepIds.has(p.id)?uid():p.id;prepIds.add(targetId);preparationMap.set(p.id,targetId);knownPreparations.set(key,targetId);addPreparations.push({p,targetId,temporary});
  rows.push({kind:'preparation',result:temporary?'Keep unsaved preparation as a separate saved copy':targetId===p.id?'Add saved preparation':'Keep both different preparations',source:p,targetId});
 }
 const prepTarget=id=>{if(!preparationMap.has(id))preparationMap.set(id,prepIds.has(id)?uid():id);return preparationMap.get(id);};
 // Keep orphan receipts too: deleting preparation must not let an old pending file replay it.
 const receiptVariants=new Map(),completedMaps=new Map();
 const receipt=(batchId,preparationId,visitId)=>{
  const variants=receiptVariants.get(batchId)||next.preparationReceipts.filter(r=>r.batchId===batchId);receiptVariants.set(batchId,variants);
  const same=variants.find(r=>r.preparationId===preparationId&&r.visitId===visitId);if(same)return same.batchId;
  const candidate={batchId:variants.length?uid():batchId,preparationId,visitId};
  if(variants.length)warnings.push('Different retained results share a preparation batch. Both results and their own completion records are kept; no passages are added again.');
  next.preparationReceipts.push(candidate);variants.push(candidate);return candidate.batchId;
 };
 for(const r of other.preparationReceipts){const map=prepVisitMaps.get(r.preparationId)||mappedVisit;batchMap.set(r.batchId,receipt(r.batchId,prepTarget(r.preparationId),map(r.visitId)));}
 for(const {p}of prepInputs){const mapped=new Map(),map=prepVisitMaps.get(p.id);for(const e of p.completed){const id=receipt(e.batchId,prepTarget(p.id),map(e.visitId));mapped.set(e.batchId,id);if(!batchMap.has(e.batchId))batchMap.set(e.batchId,id);}completedMaps.set(p.id,mapped);}
 for(const {p,targetId,temporary}of addPreparations){
  const c=validatePreparation(p),map=prepVisitMaps.get(p.id);c.id=targetId;c.batchId=batchMap.get(c.batchId)||c.batchId;
  if(c.destination.snapshot){const target=map(c.destination.visitId);c.destination.visitId=target;c.destination.snapshot=remapVisit(c.destination.snapshot,target);if(c.destination.kind==='saved'&&!next.visits.some(v=>v.id===target))warnings.push('A preparation has a saved destination that is not available. Choose a new destination before adding passages.');}
  c.completed=c.completed.map(e=>({...e,batchId:completedMaps.get(p.id).get(e.batchId),visitId:map(e.visitId)}));
  if(c.result)c.result=remapVisit(c.result,map(c.result.id));
  if(temporary)c.name=c.name?c.name+' — transferred unsaved copy':'Transferred unsaved preparation';
  next.preparations.push(validatePreparation(c));
 }
 const drafts=[];
 if(incoming.temporary.visit){
  const draft=remapVisit(incoming.temporary.visit,fresh()),p=newPreparation();p.name=`Transferred draft — ${draft.title||'Untitled visit'}`;p.destination={kind:'draft',visitId:draft.id,snapshot:draft};next.preparations.push(p);drafts.push(p.id);
  rows.push({kind:'draft',result:'Keep unsaved visit in a separate saved preparation copy',source:incoming.temporary.visit,targetId:p.id});
 }
 const followupDrafts=[],draftIds=new Set(next.followupDrafts.map(d=>d.id));
 for(const raw of other.followupDrafts||[]){
  const d=validateDraft(raw);
  for(const source of d.sources){
   const sourceId=Object.hasOwn(source,'localVisitId')?source.localVisitId:source.ref.visitId;
   source.localVisitId=sourceId&&other.visits.some(v=>v.id===sourceId)?visitMap.get(sourceId):null;
   if(source.expected?.origin)source.expected.origin=sourceLink(source.expected.origin);
   if(!source.localVisitId)warnings.push('A saved follow-up draft has no source visit in this file. Its exact words are kept, but recording its progress is blocked.');
  }
  const same=next.followupDrafts.find(local=>draftContentKey(local)===draftContentKey(d));
  if(same){followupDrafts.push(same.id);rows.push({kind:'followup-draft',result:'Already present',source:raw,targetId:same.id});continue;}
  while(draftIds.has(d.id))d.id=uid();draftIds.add(d.id);next.followupDrafts.push(d);followupDrafts.push(d.id);
  rows.push({kind:'followup-draft',result:d.id===raw.id?'Add saved follow-up draft':'Keep both different follow-up drafts',source:raw,targetId:d.id});
 }
 next.preferences=unique([...base.preferences,...other.preferences]);
 let focus=null;
 if(other.focus){const target=visitMap.get(other.focus.visitId);try{const candidate={...other.focus,visitId:target};const found=findWork(next.visits,candidate);if(unfinished(candidate.kind,found.item))focus=candidate;else warnings.push('The transferred focus is already closed and will not be selected.');}catch{warnings.push('The transferred focus item is unavailable and will not be selected.');}}
 const record={id,at:now,visits:unique(other.visits.map(v=>visitMap.get(v.id))),preparations:unique(prepInputs.map(({p})=>preparationMap.get(p.id))),drafts,focus,followupDrafts:unique(followupDrafts)};
 next.transfers.push(record);
 return {id,repeated:false,next:cleanStore(next),record,rows,warnings:unique(warnings),display:incoming.display,focus};
}

export function applyTransferPlan(current,expected,plan,{includeFocus=false}={}){
 const now=cleanStore(current);
 if(canonical(now)!==canonical(cleanStore(expected)))throw Error('Saved notes changed after the transfer preview. Review the file again.');
 const next=cleanStore(plan.next);
 if(includeFocus&&plan.focus){try{const found=findWork(next.visits,plan.focus);if(unfinished(plan.focus.kind,found.item))next.focus=structuredClone(plan.focus);}catch{throw Error('The transferred focus is no longer available.');}}
 return next;
}
