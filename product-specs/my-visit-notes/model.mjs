import {validatePreparation} from './preparation-model.mjs';
import {validateRecovery} from './recovery-model.mjs';
import {validateHistory,validateOrigin,validateRef} from './followup-record.mjs';
import {validateTransfers} from './transfer-record.mjs';
import {validateDrafts} from './draft-record.mjs';
export const KEY='my-visit-notes.v1';
export const STATES=['Open','Answered','Ask later','Contacted','Waiting for reply','No longer needed','Partly answered'];
const QUESTION_STATES=STATES;
export const ACTION_STATES=['To do','Done','No longer needed','Contacted','Waiting for reply'];
export const uid=()=>crypto.randomUUID();
export const blank=()=>({version:3,id:uid(),title:'',date:'',privateNotes:'',questions:[],requests:[],actions:[],current:null});
export const action=text=>({id:uid(),text,date:'',contact:'',state:'To do',history:[],origin:null});
export const question=text=>({id:uid(),text,state:'Open',note:'',history:[],origin:null});
export function example(){const v=blank();v.title='Fictional routine visit';v.questions=['What happens at the next visit?','Who can I contact with a question?','Can I have the next steps in writing?'].map(question);v.current=v.questions[0].id;return v;}
const string=x=>typeof x==='string';
export function validateVisit(v){
 if(!v||![1,2,3].includes(v.version)||!string(v.id)||!v.id||!string(v.title)||!string(v.date)||!string(v.privateNotes)||!Array.isArray(v.questions)||!Array.isArray(v.requests))throw Error('This visit format is damaged or unsupported.');
 const ids=new Set();
 const questions=v.questions.map(q=>{if(!q||!string(q.id)||!q.id||ids.has(q.id)||!string(q.text)||!string(q.note)||!QUESTION_STATES.includes(q.state))throw Error('A question is invalid.');ids.add(q.id);return {id:q.id,text:q.text,note:q.note,state:q.state,history:validateHistory(v.version<3?[]:q.history),origin:validateOrigin(v.version<3?null:q.origin)};});
 if(v.current!==null&&!ids.has(v.current))throw Error('The saved place is invalid.');
 const requests=v.requests.map(r=>{if(!r||!string(r.text)||typeof r.visible!=='boolean')throw Error('A communication request is invalid.');return {text:r.text,visible:r.visible};});
 const actions=v.version===1?[]:validateActions(v.actions,v.version);
 return {version:3,id:v.id,title:v.title,date:v.date,privateNotes:v.privateNotes,questions,requests,actions,current:v.current};
}
function validateActions(items,version){
 if(!Array.isArray(items))throw Error('Next steps are invalid.');const ids=new Set();
 return items.map(a=>{if(!a||!string(a.id)||!a.id||ids.has(a.id)||!string(a.text)||!string(a.date)||!string(a.contact)||!ACTION_STATES.includes(a.state))throw Error('A next step is invalid.');ids.add(a.id);return {id:a.id,text:a.text,date:a.date,contact:a.contact,state:a.state,history:validateHistory(version<3?[]:a.history),origin:validateOrigin(version<3?null:a.origin)};});
}
function validatePreferences(items){if(!Array.isArray(items)||items.some(x=>!string(x)))throw Error('Saved communication preferences are invalid.');return [...items];}
export const emptyStore=()=>({version:7,revision:0,visits:[],preferences:[],preparations:[],preparationReceipts:[],recovery:[],focus:null,transfers:[],followupDrafts:[]});
export function readStore(raw){
 if(raw===null)return emptyStore();
 const s=JSON.parse(raw);if(!s||![1,2,3,4,5,6,7].includes(s.version)||!Number.isSafeInteger(s.revision)||s.revision<0||!Array.isArray(s.visits))throw Error('Saved visits are damaged or from an unsupported version.');
 const visits=s.visits.map(validateVisit);if(new Set(visits.map(v=>v.id)).size!==visits.length)throw Error('Saved visit identifiers are duplicated.');
 let preparations=[],preparationReceipts=[];
 if(s.version>=3){
  if(!Array.isArray(s.preparations)||!Array.isArray(s.preparationReceipts))throw Error('Saved preparation data is damaged.');
  preparations=s.preparations.map(validatePreparation);
  if(new Set(preparations.map(p=>p.id)).size!==preparations.length)throw Error('Saved preparation identifiers are duplicated.');
  const batches=new Set();
  preparationReceipts=s.preparationReceipts.map(r=>{if(!r||!string(r.batchId)||!r.batchId||batches.has(r.batchId)||!string(r.preparationId)||!r.preparationId||!string(r.visitId)||!r.visitId)throw Error('Preparation completion records are invalid.');batches.add(r.batchId);return {batchId:r.batchId,preparationId:r.preparationId,visitId:r.visitId};});
 }
 return {version:7,revision:s.revision,visits,preferences:s.version===1?[]:validatePreferences(s.preferences),preparations,preparationReceipts,recovery:s.version>=4?validateRecovery(s.recovery):[],focus:s.version>=5&&s.focus!==null?validateRef(s.focus):null,transfers:s.version>=6?validateTransfers(s.transfers):[],followupDrafts:s.version>=7?validateDrafts(s.followupDrafts):[]};
}
// Explicit projection: preparation notes cannot enter summary output.
export function summary(v,selected=new Set(),notes=new Set(),requests=new Set(),actions=new Set()){
 const lines=[v.title.trim()||'My visit notes'];if(v.date)lines.push(v.date);
 for(const q of v.questions){if(selected.has(q.id)&&q.text.trim()){lines.push('',`[${q.state}] ${q.text}`);if(notes.has(q.id)&&q.note.trim())lines.push(`My personal note (not confirmed by a clinician): ${q.note}`);}}
 const chosen=v.requests.filter((r,i)=>requests.has(i)&&r.visible&&r.text.trim());if(chosen.length)lines.push('','What helps me communicate',...chosen.map(r=>r.text));
 const steps=(v.actions||[]).filter(a=>actions.has(a.id)&&a.text.trim());if(steps.length)lines.push('','My next steps (written by me)',...steps.map(a=>`[${a.state}] ${a.text}${a.date?`\nDate: ${a.date}`:''}${a.contact?`\nContact: ${a.contact}`:''}`));
 return lines.join('\n');
}
export function backup(v){return JSON.stringify({format:'my-visit-notes-backup',version:3,visit:validateVisit(v)},null,2);}
export function restore(text){const x=JSON.parse(text);if(!x||x.format!=='my-visit-notes-backup'||![1,2,3].includes(x.version))throw Error('Unsupported backup.');return validateVisit(x.visit);}
export function carryForward(source,questions=new Set(),actions=new Set()){
 const v=validateVisit(source),next=blank();
 next.questions=v.questions.filter(q=>questions.has(q.id)&&q.text.trim()).map(q=>({...question(q.text),origin:{visitId:v.id,kind:'question',itemId:q.id,title:v.title,date:v.date}}));
 next.actions=v.actions.filter(a=>actions.has(a.id)&&a.text.trim()).map(a=>({...action(a.text),date:a.date,contact:a.contact,origin:{visitId:v.id,kind:'action',itemId:a.id,title:v.title,date:v.date}}));
 next.current=next.questions[0]?.id||null;return next;
}
// Visit-library files stay compatible and intentionally exclude private preparation.
export function libraryBackup(store){const s=readStore(JSON.stringify(store));return JSON.stringify({format:'my-visit-notes-library',version:2,store:{version:2,revision:s.revision,visits:s.visits,preferences:s.preferences}},null,2);}
export function restoreLibrary(text){const x=JSON.parse(text);if(!x||x.format!=='my-visit-notes-library'||![1,2].includes(x.version))throw Error('Unsupported library backup.');return readStore(JSON.stringify(x.store));}
export function planLibraryImport(existing,incoming){
 const base=readStore(JSON.stringify(existing)),other=readStore(JSON.stringify(incoming));
 // A relocated source link is not a new copy of the visit's content.
 const fingerprint=v=>{const copy=structuredClone(v);copy.id='';for(const item of [...copy.questions,...copy.actions])if(item.origin)delete item.origin.localVisitId;return JSON.stringify(copy);};
 const seen=new Map(base.visits.map(v=>[fingerprint(v),v.id])),ids=new Set(base.visits.map(v=>v.id)),aliases=new Map();
 const additions=[],rows=[];
 for(const v of other.visits){const key=fingerprint(v);if(seen.has(key)){aliases.set(v.id,seen.get(key));rows.push({title:v.title,date:v.date,result:'Skip identical visit'});continue;}
 const copy=structuredClone(v),collision=ids.has(copy.id);if(collision)copy.id=uid();ids.add(copy.id);seen.set(key,copy.id);aliases.set(v.id,copy.id);additions.push(copy);rows.push({title:v.title,date:v.date,result:collision?'Add separate copy; keep existing visit':'Add visit'});}
 for(const visit of additions)for(const item of [...visit.questions,...visit.actions])if(item.origin){
  const origin=item.origin,target=Object.hasOwn(origin,'localVisitId')?origin.localVisitId:origin.visitId;
  if(target&&aliases.has(target)){const mapped=aliases.get(target);if(mapped!==target||Object.hasOwn(origin,'localVisitId'))origin.localVisitId=mapped;}
  else{const existing=base.visits.find(v=>v.id===target&&v.title===origin.title&&v.date===origin.date),mapped=existing?.[origin.kind==='question'?'questions':'actions'].some(x=>x.id===origin.itemId)?existing.id:null;if(mapped!==origin.visitId||Object.hasOwn(origin,'localVisitId'))origin.localVisitId=mapped;}
 }
 const preferences=[...new Set(other.preferences.filter(p=>!base.preferences.includes(p)))];
 return {additions,rows,preferences};
}
export function findVisits(visits,search=''){
 const term=search.trim().toLocaleLowerCase();
 return visits.filter(v=>[v.title,v.date,...v.questions.map(q=>q.text),...v.actions.flatMap(a=>[a.text,a.date,a.contact])].some(s=>s.toLocaleLowerCase().includes(term)));
}
