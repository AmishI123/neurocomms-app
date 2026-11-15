import {validateVisit,carryForward} from './model.mjs';
import {unfinished,workState} from './followup-model.mjs';
import {validateOrigin} from './followup-record.mjs';

// Projections expose only the fields needed for a deliberate selection or preview.
export function appointmentChoices(value,{includeClosed=false}={}){
 const visit=validateVisit(value);
 const items=[];
 for(const [kind,group] of [['question','questions'],['action','actions']])for(const item of visit[group]){
  if(!item.text.trim()||!includeClosed&&!unfinished(kind,item))continue;
  items.push({kind,id:item.id,text:item.text,state:workState(kind,item),...(kind==='action'?{date:item.date,contact:item.contact}:{})});
 }
 return {title:visit.title,date:visit.date,items,requests:visit.requests.flatMap((r,index)=>r.text.trim()?[{index,text:r.text}]:[])};
}
function selected(values,allowed,label){
 if(!Array.isArray(values)||new Set(values).size!==values.length||values.some(id=>!allowed.has(id)))throw Error(`Choose valid ${label} once each.`);
 return new Set(values);
}
export function prepareNextAppointment(current,expected,{questions=[],actions=[],requests=[]}={}){
 if(!current)throw Error('The previous visit is no longer available. Choose a saved visit again.');
 const source=validateVisit(current),snapshot=validateVisit(expected);
 if(JSON.stringify(source)!==JSON.stringify(snapshot))throw Error('The previous visit changed. Review it again before creating the next plan.');
 const q=selected(questions,new Set(source.questions.filter(q=>q.text.trim()).map(q=>q.id)),'questions');
 const a=selected(actions,new Set(source.actions.filter(a=>a.text.trim()).map(a=>a.id)),'next steps');
 const r=selected(requests,new Set(source.requests.flatMap((r,i)=>r.text.trim()?[i]:[])),'communication requests');
 if(!q.size&&!a.size&&!r.size)throw Error('Choose something to bring forward, or start a fresh visit.');
 const next=carryForward(source,q,a);
 next.requests=source.requests.filter((_,i)=>r.has(i)).map(r=>({text:r.text,visible:true}));
 return next;
}
export function appointmentPlan(value){
 const v=validateVisit(value),questions=v.questions.filter(q=>q.text.trim()),requests=v.requests.filter(r=>r.visible&&r.text.trim()),actions=v.actions.filter(a=>a.text.trim());
 const lines=[v.title.trim()||'My next appointment'];if(v.date)lines.push(v.date);
 if(questions.length)lines.push('','Questions — in the order I chose',...questions.map((q,i)=>`${i+1}. ${q.text}`));
 if(requests.length)lines.push('','What helps me communicate',...requests.map(r=>r.text));
 if(actions.length)lines.push('','Next steps to discuss',...actions.map(a=>`${a.text}${a.date?'\nDate: '+a.date:''}${a.contact?'\nContact: '+a.contact:''}`));
 if(!questions.length&&!requests.length&&!actions.length)throw Error('Add a question, communication request or next step before reviewing a plan.');
 return lines.join('\n');
}
export function appointmentSource(visits,value){
 const origin=validateOrigin(value);if(!origin)return null;
 const captured={title:origin.title,date:origin.date};
 const id=Object.hasOwn(origin,'localVisitId')?origin.localVisitId:origin.visitId;
 const raw=id?visits.find(v=>v.id===id):null;
 if(!raw)return {captured,available:false};
 const source=validateVisit(raw),item=source[origin.kind==='question'?'questions':'actions'].find(i=>i.id===origin.itemId);
 if(!item)return {captured,available:false};
 return {captured,available:true,current:{title:source.title,date:source.date,text:item.text,state:workState(origin.kind,item)}};
}
