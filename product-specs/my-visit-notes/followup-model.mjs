import {blank,question,action,uid,validateVisit} from './model.mjs';
import {FOLLOWUP_STATES,HISTORY_LIMIT,validateHistory,validateRef} from './followup-record.mjs';
export {FOLLOWUP_STATES,HISTORY_LIMIT};
export const refKey=ref=>JSON.stringify([ref.visitId,ref.kind,ref.itemId]);
export const workState=(kind,item)=>kind==='question'?(item.state==='Answered'?'Done':['Open','Partly answered','Ask later'].includes(item.state)?'To do':item.state):item.state;
export const unfinished=(kind,item)=>!['Done','No longer needed'].includes(workState(kind,item));
export function findWork(visits,ref){
 const r=validateRef(ref),visit=visits.find(v=>v.id===r.visitId),item=visit?.[r.kind==='question'?'questions':'actions'].find(x=>x.id===r.itemId);
 if(!item)throw Error('That item is no longer in a saved visit. Refresh the follow-up list.');
 return {visit,item,ref:r};
}
export function workList(visits,{includeClosed=false,search=''}={}){
 const term=search.trim().toLocaleLowerCase(),rows=[];
 for(const raw of visits){const v=validateVisit(raw);for(const [kind,items] of [['question',v.questions],['action',v.actions]])for(const item of items){
  if(!item.text.trim()||!includeClosed&&!unfinished(kind,item))continue;
  if(term&&![v.title,v.date,item.text,kind==='action'?item.contact:''].some(t=>t.toLocaleLowerCase().includes(term)))continue;
  rows.push({ref:{visitId:v.id,kind,itemId:item.id},title:v.title,date:v.date,text:item.text,status:workState(kind,item),origin:item.origin||null});
 }}return rows;
}
export function updateFollowup(visits,ref,{status,date='',note=''},expected,now=Date.now()){
 if(!FOLLOWUP_STATES.includes(status))throw Error('Choose a follow-up state.');
 if(expected&&JSON.stringify(findWork(visits,ref).item)!==JSON.stringify(expected))throw Error('This item changed since you opened it. Review the latest version.');
 const next=visits.map(validateVisit),found=findWork(next,ref);
 const event=validateHistory([{id:uid(),status,date,note,at:now}])[0];
 found.item.state=ref.kind==='question'?(status==='Done'?'Answered':status==='To do'?'Open':status):status;
 found.item.history=validateHistory([...(found.item.history||[]),event].slice(-HISTORY_LIMIT));
 return next;
}
// Record state changes made in existing visit screens as well as the overview.
export function recordStateChanges(before,after,now=Date.now()){
 const next=structuredClone(after);if(!before)return next;
 for(const [kind,group] of [['question','questions'],['action','actions']])for(const item of next[group]){
  const old=before[group].find(x=>x.id===item.id);
  if(old&&old.state!==item.state&&JSON.stringify(old.history||[])===JSON.stringify(item.history||[]))item.history=[...(item.history||[]),{id:uid(),status:workState(kind,item),date:'',note:'',at:now}].slice(-HISTORY_LIMIT);
 }return next;
}
export function carryWork(visits,refs){
 if(!refs.length)throw Error('Choose at least one item.');
 const next=blank(),seen=new Set();
 for(const ref of refs){const key=refKey(ref);if(seen.has(key))throw Error('The same item was selected twice.');seen.add(key);const {visit,item}=findWork(visits,ref);
  if(!item.text.trim())throw Error('An empty item cannot be copied.');
  const copied=ref.kind==='question'?question(item.text):{...action(item.text),date:item.date,contact:item.contact};
  copied.origin={...validateRef(ref),title:visit.title,date:visit.date};
  next[ref.kind==='question'?'questions':'actions'].push(copied);
 }
 next.current=next.questions[0]?.id||null;return next;
}
export function messageDraft(visits,refs,{includeVisit=false,includeContact=false}={}){
 if(!refs.length)throw Error('Choose at least one item for the message.');
 const seen=new Set(),lines=['Hello,','','I would like to follow up on:'];
 for(const ref of refs){const key=refKey(ref);if(seen.has(key))continue;seen.add(key);const {visit,item}=findWork(visits,ref);
  if(!item.text.trim())continue;
  if(includeVisit)lines.push('',`Visit: ${visit.title||'Untitled visit'}${visit.date?' — '+visit.date:''}`);
  lines.push(`- ${item.text}`);if(includeContact&&ref.kind==='action'&&item.contact)lines.push(`Contact: ${item.contact}`);
 }
 lines.push('','Thank you.');return lines.join('\n');
}
