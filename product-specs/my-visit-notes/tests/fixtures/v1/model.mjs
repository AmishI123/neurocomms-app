export const KEY='my-visit-notes.v1';
export const STATES=['Open','Answered','Ask later'];
export const uid=()=>crypto.randomUUID();
export const blank=()=>({version:1,id:uid(),title:'',date:'',privateNotes:'',questions:[],requests:[],current:null});
export const question=text=>({id:uid(),text,state:'Open',note:''});
export function example(){const v=blank();v.title='Fictional routine visit';v.questions=['What happens at the next visit?','Who can I contact with a question?','Can I have the next steps in writing?'].map(question);v.current=v.questions[0].id;return v;}
const string=x=>typeof x==='string';
export function validateVisit(v){
 if(!v||v.version!==1||!string(v.id)||!v.id||!string(v.title)||!string(v.date)||!string(v.privateNotes)||!Array.isArray(v.questions)||!Array.isArray(v.requests))throw Error('This visit format is damaged or unsupported.');
 const ids=new Set();
 const questions=v.questions.map(q=>{if(!q||!string(q.id)||!q.id||ids.has(q.id)||!string(q.text)||!string(q.note)||!STATES.includes(q.state))throw Error('A question is invalid.');ids.add(q.id);return {id:q.id,text:q.text,note:q.note,state:q.state};});
 if(v.current!==null&&!ids.has(v.current))throw Error('The saved place is invalid.');
 const requests=v.requests.map(r=>{if(!r||!string(r.text)||typeof r.visible!=='boolean')throw Error('A communication request is invalid.');return {text:r.text,visible:r.visible};});
 return {version:1,id:v.id,title:v.title,date:v.date,privateNotes:v.privateNotes,questions,requests,current:v.current};
}
export function readStore(raw){
 if(raw===null)return {version:1,revision:0,visits:[]};
 const s=JSON.parse(raw);if(s.version!==1||!Number.isSafeInteger(s.revision)||s.revision<0||!Array.isArray(s.visits))throw Error('Saved visits are damaged or from an unsupported version.');
 const visits=s.visits.map(validateVisit);if(new Set(visits.map(v=>v.id)).size!==visits.length)throw Error('Saved visit identifiers are duplicated.');return {version:1,revision:s.revision,visits};
}
// Explicit projection: preparation notes cannot enter summary output.
export function summary(v,selected=new Set(),notes=new Set(),requests=new Set()){
 const lines=[v.title.trim()||'My visit notes'];if(v.date)lines.push(v.date);
 for(const q of v.questions){if(selected.has(q.id)&&q.text.trim()){lines.push('',`[${q.state}] ${q.text}`);if(notes.has(q.id)&&q.note.trim())lines.push(`My personal note (not confirmed by a clinician): ${q.note}`);}}
 const chosen=v.requests.filter((r,i)=>requests.has(i)&&r.visible&&r.text.trim());if(chosen.length)lines.push('','What helps me communicate',...chosen.map(r=>r.text));
 return lines.join('\n');
}
export function backup(v){return JSON.stringify({format:'my-visit-notes-backup',version:1,visit:validateVisit(v)},null,2);}
export function restore(text){const x=JSON.parse(text);if(x.format!=='my-visit-notes-backup'||x.version!==1)throw Error('Unsupported backup.');return validateVisit(x.visit);}
