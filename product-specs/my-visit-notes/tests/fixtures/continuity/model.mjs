export const KEY='my-visit-notes.v1';
export const STATES=['Open','Answered','Ask later'];
export const ACTION_STATES=['To do','Done','No longer needed'];
export const uid=()=>crypto.randomUUID();
export const blank=()=>({version:2,id:uid(),title:'',date:'',privateNotes:'',questions:[],requests:[],actions:[],current:null});
export const action=text=>({id:uid(),text,date:'',contact:'',state:'To do'});
export const question=text=>({id:uid(),text,state:'Open',note:''});
export function example(){const v=blank();v.title='Fictional routine visit';v.questions=['What happens at the next visit?','Who can I contact with a question?','Can I have the next steps in writing?'].map(question);v.current=v.questions[0].id;return v;}
const string=x=>typeof x==='string';
export function validateVisit(v){
 if(!v||![1,2].includes(v.version)||!string(v.id)||!v.id||!string(v.title)||!string(v.date)||!string(v.privateNotes)||!Array.isArray(v.questions)||!Array.isArray(v.requests))throw Error('This visit format is damaged or unsupported.');
 const ids=new Set();
 const questions=v.questions.map(q=>{if(!q||!string(q.id)||!q.id||ids.has(q.id)||!string(q.text)||!string(q.note)||!STATES.includes(q.state))throw Error('A question is invalid.');ids.add(q.id);return {id:q.id,text:q.text,note:q.note,state:q.state};});
 if(v.current!==null&&!ids.has(v.current))throw Error('The saved place is invalid.');
 const requests=v.requests.map(r=>{if(!r||!string(r.text)||typeof r.visible!=='boolean')throw Error('A communication request is invalid.');return {text:r.text,visible:r.visible};});
 const actions=v.version===1?[]:validateActions(v.actions);
 return {version:2,id:v.id,title:v.title,date:v.date,privateNotes:v.privateNotes,questions,requests,actions,current:v.current};
}
function validateActions(items){
 if(!Array.isArray(items))throw Error('Next steps are invalid.');const ids=new Set();
 return items.map(a=>{if(!a||!string(a.id)||!a.id||ids.has(a.id)||!string(a.text)||!string(a.date)||!string(a.contact)||!ACTION_STATES.includes(a.state))throw Error('A next step is invalid.');ids.add(a.id);return {id:a.id,text:a.text,date:a.date,contact:a.contact,state:a.state};});
}
function validatePreferences(items){if(!Array.isArray(items)||items.some(x=>!string(x)))throw Error('Saved communication preferences are invalid.');return [...items];}
export const emptyStore=()=>({version:2,revision:0,visits:[],preferences:[]});
export function readStore(raw){
 if(raw===null)return emptyStore();
 const s=JSON.parse(raw);if(!s||![1,2].includes(s.version)||!Number.isSafeInteger(s.revision)||s.revision<0||!Array.isArray(s.visits))throw Error('Saved visits are damaged or from an unsupported version.');
 const visits=s.visits.map(validateVisit);if(new Set(visits.map(v=>v.id)).size!==visits.length)throw Error('Saved visit identifiers are duplicated.');return {version:2,revision:s.revision,visits,preferences:s.version===1?[]:validatePreferences(s.preferences)};
}
// Explicit projection: preparation notes cannot enter summary output.
export function summary(v,selected=new Set(),notes=new Set(),requests=new Set(),actions=new Set()){
 const lines=[v.title.trim()||'My visit notes'];if(v.date)lines.push(v.date);
 for(const q of v.questions){if(selected.has(q.id)&&q.text.trim()){lines.push('',`[${q.state}] ${q.text}`);if(notes.has(q.id)&&q.note.trim())lines.push(`My personal note (not confirmed by a clinician): ${q.note}`);}}
 const chosen=v.requests.filter((r,i)=>requests.has(i)&&r.visible&&r.text.trim());if(chosen.length)lines.push('','What helps me communicate',...chosen.map(r=>r.text));
 const steps=(v.actions||[]).filter(a=>actions.has(a.id)&&a.text.trim());if(steps.length)lines.push('','My next steps (written by me)',...steps.map(a=>`[${a.state}] ${a.text}${a.date?`\nDate: ${a.date}`:''}${a.contact?`\nContact: ${a.contact}`:''}`));
 return lines.join('\n');
}
export function backup(v){return JSON.stringify({format:'my-visit-notes-backup',version:2,visit:validateVisit(v)},null,2);}
export function restore(text){const x=JSON.parse(text);if(!x||x.format!=='my-visit-notes-backup'||![1,2].includes(x.version))throw Error('Unsupported backup.');return validateVisit(x.visit);}
export function carryForward(source,questions=new Set(),actions=new Set()){
 const v=validateVisit(source),next=blank();
 next.questions=v.questions.filter(q=>questions.has(q.id)&&q.text.trim()).map(q=>question(q.text));
 next.actions=v.actions.filter(a=>actions.has(a.id)&&a.text.trim()).map(a=>({...action(a.text),date:a.date,contact:a.contact}));
 next.current=next.questions[0]?.id||null;return next;
}
export function libraryBackup(store){return JSON.stringify({format:'my-visit-notes-library',version:1,store:readStore(JSON.stringify(store))},null,2);}
export function restoreLibrary(text){const x=JSON.parse(text);if(!x||x.format!=='my-visit-notes-library'||x.version!==1)throw Error('Unsupported library backup.');return readStore(JSON.stringify(x.store));}
export function planLibraryImport(existing,incoming){
 const base=readStore(JSON.stringify(existing)),other=readStore(JSON.stringify(incoming));
 const fingerprint=v=>JSON.stringify({...v,id:''});
 const seen=new Set(base.visits.map(fingerprint)),ids=new Set(base.visits.map(v=>v.id));
 const additions=[],rows=[];
 for(const v of other.visits){const key=fingerprint(v);if(seen.has(key)){rows.push({title:v.title,date:v.date,result:'Skip identical visit'});continue;}
 const copy=structuredClone(v),collision=ids.has(copy.id);if(collision)copy.id=uid();ids.add(copy.id);seen.add(key);additions.push(copy);rows.push({title:v.title,date:v.date,result:collision?'Add separate copy; keep existing visit':'Add visit'});}
 const preferences=[...new Set(other.preferences.filter(p=>!base.preferences.includes(p)))];
 return {additions,rows,preferences};
}
export function findVisits(visits,search=''){
 const term=search.trim().toLocaleLowerCase();
 return visits.filter(v=>[v.title,v.date,...v.questions.map(q=>q.text),...v.actions.flatMap(a=>[a.text,a.date,a.contact])].some(s=>s.toLocaleLowerCase().includes(term)));
}
