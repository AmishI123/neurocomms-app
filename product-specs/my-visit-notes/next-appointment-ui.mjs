import {appointmentChoices,prepareNextAppointment,appointmentPlan,appointmentSource} from './next-appointment-model.mjs';
const node=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;};
export function createNextAppointment({modal,close,context,create,startFresh,download,notify,print}){
 let operation=0;
 function show(...args){modal(...args);const heading=document.querySelector('#dialog-title');heading.tabIndex=-1;heading.focus();document.querySelector('#dialog').scrollTop=0;}
 const errorBox=()=>{const p=node('p');p.setAttribute('role','status');return p;};
 function open(){
  const token=++operation,box=node('div'),error=errorBox();
  box.append(node('p','Choose a saved visit to review what to bring forward. Nothing is selected or changed automatically.'),error);
  try{const c=context();for(const visit of c.visits){const b=node('button',`Plan from: ${visit.title||'Untitled visit'}${visit.date?' — '+visit.date:''}`);b.onclick=()=>{if(token===operation)choose(visit.id);};box.append(b);}if(!c.visits.length)box.append(node('p','No saved visits yet. You can start a fresh visit.'));}catch(e){error.textContent=e.message;}
  show('Prepare the next appointment',box,[['Start a fresh visit',startFresh]]);
 }
 function choose(id){
  const token=++operation,box=node('div'),error=errorBox();let state,source,choices;
  try{state=context();source=state.visits.find(v=>v.id===id);choices=appointmentChoices(source,{includeClosed:true});}catch(e){notify('That saved visit is unavailable. Choose a visit again.');open();return;}
  const picked={questions:[],actions:[],requests:[]},checks=[];
  box.append(node('p',`${choices.title||'Untitled visit'}${choices.date?' — '+choices.date:''}`),node('p','Choose what still matters. The original stays unchanged. Copies start Open or To do. Private preparation notes, answer notes and history are not copied. Source titles and dates stay privately with copied items.'),node('p','This selection is temporary until you create and save the new visit.'),error);
  const unfinished=node('section');unfinished.append(node('h3','Unfinished questions and next steps'));box.append(unfinished);
  const closed=node('details');closed.append(node('summary','Show answered or closed items'));box.append(closed);
  function checkbox(parent,text,group,value){const label=node('label'),input=node('input');input.type='checkbox';input.dataset.nextChoice=group;input.value=String(value);label.append(input,document.createTextNode(text));parent.append(label);checks.push({input,group,value});}
  let remaining=0;
  for(const item of choices.items){const done=['Done','No longer needed'].includes(item.state);if(!done)remaining++;checkbox(done?closed:unfinished,`${item.kind==='question'?'Question':'Next step'}: ${item.text} (${item.state})${item.date?' — '+item.date:''}${item.contact?' — '+item.contact:''}`,item.kind==='question'?'questions':'actions',item.id);}
  if(!remaining)unfinished.append(node('p','No unfinished items. You can choose a communication request, reveal closed items, or start fresh.'));
  const requests=node('section');requests.append(node('h3','Communication requests — choose separately'),node('p','These become editable requests in the new visit. They are not selected for shared summaries.'));
  for(const request of choices.requests)checkbox(requests,request.text,'requests',request.index);
  if(!choices.requests.length)requests.append(node('p','No requests in this visit. You can add your own in What helps.'));box.append(requests);
  const preview=()=>{
   if(token!==operation)return;
   for(const group of Object.keys(picked))picked[group]=checks.filter(c=>c.group===group&&c.input.checked).map(c=>c.value);
   try{
    const latest=context();if(latest.generation!==state.generation||latest.editVersion!==state.editVersion)throw Error('Your open visit changed. Cancel and start again before replacing it.');
    const next=prepareNextAppointment(latest.visits.find(v=>v.id===id),source,picked),view=node('div'),problem=errorBox();
    view.append(node('p','Only these chosen words will be copied. Nothing has been saved yet.'),node('pre',appointmentPlan(next)),node('p',state.replaceWarning?'Creating this appointment replaces your unsaved open visit. Cancel to save it or download its full backup first.':'The earlier saved visit stays unchanged. The new appointment starts as a temporary visit.'),node('p','After creating it, edit the words, put questions in your preferred order, add concerns and review the short plan. Then save on this device.'),problem);
    let consumed=false;
    show('Review the next appointment',view,[['Back to my choices',()=>{if(token===operation)show('Choose work for the next appointment',box,[['Review chosen work',preview],['Choose a different visit',open]]);}],['Create next appointment',()=>{
     if(consumed||token!==operation)return;
     try{const current=context();if(current.generation!==state.generation||current.editVersion!==state.editVersion)throw Error('Your open visit changed. Cancel and start again.');prepareNextAppointment(current.visits.find(v=>v.id===id),source,picked);consumed=true;operation++;close();create(next);notify('New temporary appointment created. Edit and review your plan, then save it. The earlier visit is unchanged.');}catch(e){problem.textContent=e.message;}
    }],['Review latest source again',()=>choose(id)]]);
   }catch(e){error.textContent=e.message;}
  };
  show('Choose work for the next appointment',box,[['Review chosen work',preview],['Choose a different visit',open]]);
 }
 function previewPlan(){
  try{const text=appointmentPlan(context(false).visit),box=node('div'),message=errorBox();box.append(node('p','This exact plan includes your ordered questions, visible communication requests and next steps with dates/contacts. It excludes private notes, answers, history and source context. Copying, downloading or printing does not save or send it.'),node('pre',text),message);
   show('My appointment plan — exact preview',box,[['Download appointment plan',()=>download('my-appointment-plan.txt',text,'text/plain;charset=utf-8')],['Copy appointment plan',async()=>{try{await copyText(text);message.textContent='Plan copied. It was not sent or saved.';}catch{message.textContent='Copy is unavailable. Download the plan instead.';}}],['Print appointment plan',()=>print(text)]]);
  }catch(e){notify(e.message);}
 }
 function inspect(origin){
  try{const source=appointmentSource(context().visits,origin);if(!source)return;const box=node('div');box.append(node('p',`Copied from ${source.captured.title||'Untitled visit'}${source.captured.date?' — '+source.captured.date:''}.`),node('p','This copy and its original change separately. Reviewing the source does not change or replace your open appointment.'));
   if(source.available)box.append(node('h3','Current source wording'),node('pre',source.current.text),node('p',`Current source state: ${source.current.state}. This may differ from the wording or state when copied. Private answers and history are not shown.`));
   else box.append(node('p','The original item is unavailable here. Its captured title and date remain; no other item has been substituted.'));
   show('Where this item came from',box);
  }catch(e){notify(e.message);}
 }
 document.querySelector('#dialog').addEventListener('close',()=>{if(!document.querySelector('#dialog').open)operation++;});
 return {open,previewPlan,inspect};
}
import {copyText} from './platform.mjs';
