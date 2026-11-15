import {uid,readStore} from './model.mjs';
import {findWork,updateFollowup} from './followup-model.mjs';
import {validateDraft} from './draft-record.mjs';
export {validateDraft} from './draft-record.mjs';
export const DRAFT_BACKUP_LIMIT=10*1024*1024;
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const clean=store=>readStore(JSON.stringify(store));

export function newFollowupDraft(visits,refs,{kind='message',text='',entry=null,name=''}={},now=Date.now()){
 const sources=refs.map(ref=>{const found=findWork(visits,ref);return {ref:found.ref,title:found.visit.title,date:found.visit.date,text:found.item.text,expected:kind==='progress'?structuredClone(found.item):null};});
 return validateDraft({version:1,id:uid(),kind,name,updatedAt:now,sources,text,entry});
}
export function draftContentKey(draft){const d=validateDraft(draft);delete d.id;delete d.updatedAt;for(const source of d.sources)if(source.localVisitId===source.ref.visitId)delete source.localVisitId;return JSON.stringify(d);}
export function saveFollowupDraft(store,value,expected=null){
 const next=clean(store),draft=validateDraft(value),index=next.followupDrafts.findIndex(d=>d.id===draft.id);
 if(expected){
  if(expected.id!==draft.id||index<0||!same(next.followupDrafts[index],validateDraft(expected)))throw Error('This saved draft changed or was deleted. Keep your working copy before reopening saved drafts.');
  next.followupDrafts[index]=draft;
 }else if(index>=0){
  if(!same(next.followupDrafts[index],draft))throw Error('A different saved draft already has this identity. Nothing was replaced.');
 }else next.followupDrafts.push(draft);
 return next;
}
export function deleteFollowupDraft(store,expected){
 const next=clean(store),draft=validateDraft(expected),index=next.followupDrafts.findIndex(d=>d.id===draft.id);
 if(index<0||!same(next.followupDrafts[index],draft))throw Error('This saved draft changed or was deleted. Reopen the list before deleting.');
 next.followupDrafts.splice(index,1);return next;
}
export function draftSourceState(visits,value){
 const draft=validateDraft(value);
 return draft.sources.map(source=>{
  const ref={...source.ref,visitId:Object.hasOwn(source,'localVisitId')?source.localVisitId:source.ref.visitId};
  try{
   if(!ref.visitId)throw Error('Missing source');
   const found=findWork(visits,ref),changed=source.expected?!same(found.item,source.expected):found.item.text!==source.text;
   return {source,ref,found,state:changed?'changed':'current'};
  }catch{return {source,ref,found:null,state:'missing'};}
 });
}
// Returning one next collection lets the app record progress and remove its saved
// draft in a single guarded storage write. This function never writes on its own.
export function finishProgressDraft(store,value,expectedSaved=null,now=Date.now()){
 const draft=validateDraft(value);if(draft.kind!=='progress')throw Error('A message is not a progress entry.');
 const next=expectedSaved?deleteFollowupDraft(store,expectedSaved):clean(store);
 if(expectedSaved&&expectedSaved.id!==draft.id)throw Error('Choose the saved draft being completed.');
 const source=draftSourceState(next.visits,draft)[0];
 if(source.state==='missing')throw Error('The original item is no longer available. Your draft is kept; download it or start a new entry from current saved work.');
 if(source.state==='changed')throw Error('The original item changed. Your draft is kept; review current saved work before starting a new entry.');
 next.visits=updateFollowup(next.visits,source.ref,draft.entry,source.source.expected,now);return next;
}
export function followupDraftBackup(value){
 const result=JSON.stringify({format:'my-visit-notes-followup-draft',version:1,draft:validateDraft(value)},null,2);
 if(new TextEncoder().encode(result).length>DRAFT_BACKUP_LIMIT)throw Error('This draft backup exceeds the 10 MiB limit. Nothing was removed.');
 return result;
}
export function readFollowupDraftBackup(text){
 if(typeof text!=='string'||new TextEncoder().encode(text).length>DRAFT_BACKUP_LIMIT)throw Error('Choose a draft backup no larger than 10 MiB.');
 const file=JSON.parse(text);if(!file||file.format!=='my-visit-notes-followup-draft'||file.version!==1)throw Error('Choose a supported private follow-up draft backup.');
 return validateDraft(file.draft);
}
export function planDraftRestore(store,value){
 const next=clean(store),draft=validateDraft(value);
 // A single-draft file carries no trusted local visit mapping. Do not infer a
// source link merely because a receiving browser has the same visit identifier.
 for(const source of draft.sources)source.localVisitId=null;
 const sameDraft=next.followupDrafts.find(d=>draftContentKey(d)===draftContentKey(draft));
 if(sameDraft)return {next,draft:sameDraft,added:false};
 draft.id=uid();next.followupDrafts.push(draft);return {next,draft,added:true};
}
