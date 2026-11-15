import {FOLLOWUP_STATES,validateRef,validateHistory,validateOrigin} from './followup-record.mjs';

const text=x=>typeof x==='string';
const id=x=>text(x)&&x.length>0;
function expectedItem(item,kind){
 if(!item||!id(item.id)||!text(item.text))throw Error('The original draft item is invalid.');
 const common={id:item.id,text:item.text};
 if(kind==='question'){
  if(!text(item.note)||!['Open','Answered','Ask later','Contacted','Waiting for reply','No longer needed'].includes(item.state))throw Error('The original question is invalid.');
  return {...common,note:item.note,state:item.state,history:validateHistory(item.history),origin:validateOrigin(item.origin)};
 }
 if(!text(item.date)||!text(item.contact)||!FOLLOWUP_STATES.includes(item.state))throw Error('The original next step is invalid.');
 return {...common,date:item.date,contact:item.contact,state:item.state,history:validateHistory(item.history),origin:validateOrigin(item.origin)};
}
export function validateDraft(value){
 if(!value||value.version!==1||!id(value.id)||!['message','progress'].includes(value.kind)||!text(value.name)||value.name.length>200||!Number.isSafeInteger(value.updatedAt)||value.updatedAt<0||!text(value.text)||value.text.length>1000000||!Array.isArray(value.sources)||!value.sources.length)throw Error('This follow-up draft is damaged or unsupported.');
 const seen=new Set(),sources=value.sources.map(source=>{
  if(!source||!text(source.title)||!text(source.date)||!text(source.text))throw Error('Draft source information is invalid.');
  const ref=validateRef(source.ref),key=JSON.stringify(ref);
  if(seen.has(key))throw Error('A draft source is repeated.');seen.add(key);
  if(Object.hasOwn(source,'localVisitId')&&source.localVisitId!==null&&!id(source.localVisitId))throw Error('The draft source link is invalid.');
  const expected=value.kind==='progress'?expectedItem(source.expected,ref.kind):null;
  if(expected&&(expected.id!==ref.itemId||expected.text!==source.text))throw Error('The original draft item does not match its source.');
  return {ref,title:source.title,date:source.date,text:source.text,expected,...(Object.hasOwn(source,'localVisitId')?{localVisitId:source.localVisitId}:{})};
 });
 let entry=null;
 if(value.kind==='progress'){
  if(sources.length!==1||value.text!=='')throw Error('A progress draft must refer to one original item.');
  if(!value.entry||!FOLLOWUP_STATES.includes(value.entry.status)||!text(value.entry.date)||!text(value.entry.note)||value.entry.note.length>5000)throw Error('The draft progress fields are invalid.');
  const checked=validateHistory([{id:'draft-entry',at:0,...value.entry}])[0];entry={status:checked.status,date:checked.date,note:checked.note};
 }else if(value.entry!==null)throw Error('A message draft cannot record progress.');
 return {version:1,id:value.id,kind:value.kind,name:value.name,updatedAt:value.updatedAt,sources,text:value.text,entry};
}
export function validateDrafts(values){
 if(!Array.isArray(values))throw Error('Saved follow-up drafts are invalid.');
 const drafts=values.map(validateDraft);
 if(new Set(drafts.map(d=>d.id)).size!==drafts.length)throw Error('Saved follow-up draft identifiers are repeated.');
 return drafts;
}
