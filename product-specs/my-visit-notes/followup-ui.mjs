import {workList,findWork,workState,refKey,FOLLOWUP_STATES,carryWork,messageDraft} from './followup-model.mjs';
import {newFollowupDraft,draftSourceState,validateDraft} from './draft-model.mjs';
import {createDraftKeeper,createDraftLibrary} from './draft-ui.mjs';
const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
const label=(text,control)=>{const n=node('label',text);control.setAttribute('aria-label',text);n.append(control);return n;};
const button=(text,fn)=>{const b=node('button',text);b.onclick=fn;return b;};
export function createFollowup({modal,close,context,saveProgress,saveDraft,deleteDraft,restoreDraft,setFocus,openSource,createVisit,download,notify}){
 let view=0,working=false,resumeMessage=null,progressDraft=null,messageKeeper=null;
 document.querySelector('#dialog').addEventListener('close',()=>{view++;working=false;});
 const valid=token=>()=>view===token&&document.querySelector('#dialog').open;
 function refreshStatus(){messageKeeper?.paint();progressDraft?.keeper.paint();const el=document.querySelector('#followup-alert');if(el)el.textContent=context().conflict?'Saved notes changed in another tab. Keep a copy of unfinished work, then reload saved notes before recording progress or making new copies.':context().damaged?'Saved notes could not be read. Recover saved storage before continuing.':'';}
 function check(state){const latest=context();if(latest.conflict||latest.damaged||latest.revision!==state.revision){refreshStatus();throw Error('Saved notes changed or are unavailable. Reload saved notes before continuing.');}}
 async function chooseFocus(ref,state,token){if(await setFocus(ref,state,valid(token)))open();else if(valid(token)()){const alert=document.querySelector('#followup-alert');if(alert)alert.textContent='Focus was not saved. Your previous choice is unchanged.';}}
 function open(){
  const token=++view,state=context(),selected=new Map(),box=node('div'),list=node('div'),search=node('input'),closed=node('input');search.type='search';closed.type='checkbox';
  if(state.conflict||state.damaged){modal('Saved notes need attention','Keep a backup of unfinished work, then use Reload saved visits or the storage recovery controls before following up.');return;}
  const alert=node('p');alert.id='followup-alert';alert.setAttribute('role','alert');box.append(alert);
  box.append(node('p','Saved visits only; unsaved drafts and results kept only in preparation are not included. Looking here does not change your notes. Choose one item to focus on, record what happened, or select items for a message or another visit. No dates are treated as overdue.'));
  if(state.focus){try{const {item}=findWork(state.visits,state.focus);box.append(node('p',`My chosen focus: ${item.text}`),button('Clear my focus',()=>chooseFocus(null,state,token)));}catch{box.append(node('p','The previously chosen focus is no longer available. Choose another item.'));}}
  box.append(label('Search unfinished work',search),label('Include done and no-longer-needed items',closed),list);
  function draw(){list.replaceChildren();const rows=workList(state.visits,{includeClosed:closed.checked,search:search.value});if(!rows.length)list.append(node('p','No matching items. Nothing was changed.'));
   for(const row of rows){const a=node('article'),check=node('input');check.type='checkbox';check.checked=selected.has(refKey(row.ref));check.onchange=()=>check.checked?selected.set(refKey(row.ref),row.ref):selected.delete(refKey(row.ref));a.append(label(`Select ${row.text}`,check),node('p',`${row.title||'Untitled visit'}${row.date?' — '+row.date:''} · ${row.status}`));
    if(row.origin)a.append(node('p',`Copied from ${row.origin.title||'Untitled visit'}${row.origin.date?' — '+row.origin.date:''}. This copy is independent.`));
    a.append(button('View follow-up and history',()=>detail(row.ref)),button('Open original visit',()=>openSource(row.ref)),button('Focus on this item',()=>chooseFocus(row.ref,state,token)));list.append(a);
   }
  }search.oninput=draw;closed.onchange=draw;draw();
  const selectedRefs=()=>{if(!selected.size)throw Error('Select at least one item.');return [...selected.values()];};
  modal('What still needs doing',box,[['Prepare a message or call note',()=>{try{compose(selectedRefs());}catch(e){notify(e.message);}}],['Prepare another visit from selected items',()=>{
   try{check(state);const refs=selectedRefs(),latest=context(),next=carryWork(latest.visits,refs),preview=node('div');preview.append(node('p','These are independent copies with new identities and fresh progress. Original notes stay unchanged. Private preparation notes, answer notes and progress history are not copied. Next-step dates and contacts are copied. Creating this draft replaces your open draft; cancel to back it up first.'));
    for(const item of [...next.questions,...next.actions])preview.append(node('p',`${item.text}${item.date?' — '+item.date:''}${item.contact?' — '+item.contact:''}`),node('p',`Copied from ${item.origin.title||'Untitled visit'}${item.origin.date?' — '+item.origin.date:''}`));
    modal('Review the new visit',preview,[['Create follow-up visit draft',()=>{if(createVisit(next,latest,valid(token)))close();}]]);
   }catch(e){notify(e.message);}
  }]]);
  search.focus();document.querySelector('#dialog').scrollTop=0;
 }
 function detail(ref,stored=null){
  if(stored&&progressDraft){if(progressDraft.keeper.record().id===stored.id){progressDraft.resume();return;}if(progressDraft.keeper.hasWork()){modal('Keep your unfinished progress note?','Return to your current entry or discard its unsaved edits before opening another saved draft. Any saved copy remains.',[['Return to my progress note',()=>progressDraft.resume()],['Discard edits and open saved draft',()=>{progressDraft=null;detail(ref,stored);}]]);return;}progressDraft=null;}
  if(progressDraft){if(refKey(progressDraft.ref)===refKey(ref)){progressDraft.resume();return;}modal('Keep your unfinished progress note?','Another progress entry is still in this page. Return to it or explicitly discard it before editing another item.',[['Return to my progress note',()=>progressDraft.resume()],['Discard and open this item',()=>{progressDraft=null;working=false;detail(ref);}]]);return;}
  let token=++view;const state=context();let found;try{if(stored){const source=stored.sources[0];found={visit:{title:source.title,date:source.date},item:source.expected};}else{check(state);found=findWork(state.visits,ref);}}catch(e){notify(e.message);open();return;}
  const {visit,item}=found,initial=stored||newFollowupDraft(state.visits,[ref],{kind:'progress',entry:{status:workState(ref.kind,item),date:'',note:''}}),box=node('div'),status=node('select'),date=node('input'),note=node('textarea');date.type='date';note.maxLength=5000;date.value=initial.entry.date;note.value=initial.entry.note;
  const alert=node('p');alert.id='followup-alert';alert.setAttribute('role','alert');box.append(alert);
  for(const value of FOLLOWUP_STATES){const option=node('option',value);option.value=value;option.selected=value===initial.entry.status;status.append(option);}
  box.append(node('h3',item.text),node('p',`${visit.title||'Untitled visit'}${visit.date?' — '+visit.date:''}`),node('p',ref.kind==='question'?'Done marks this question Answered. To do reopens it. No longer needed closes it without claiming an answer.':'Your own next step, not medical instructions.'));
  if(ref.kind==='action'){if(item.date)box.append(node('p',`Next-step date: ${item.date}`));if(item.contact)box.append(node('p',`Contact: ${item.contact}`));}
  if(item.origin){box.append(node('p',`Copied from ${item.origin.title||'Untitled visit'}${item.origin.date?' — '+item.origin.date:''}. The original and this copy change separately.`),button('Open the source of this copy',()=>openSource(item.origin)));}
  const history=node('details');history.append(node('summary','Private follow-up history'));
  for(const e of item.history||[])history.append(node('p',`${e.status}${e.date?' — '+e.date:''} · recorded ${new Date(e.at).toLocaleString()}`),node('pre',e.note||'No note recorded.'));
  if(!item.history?.length)history.append(node('p','No follow-up events recorded yet.'));
  box.append(history,node('p','Keep up to the latest 50 events per item. Notes stay private and appear in full backups, not shared summaries. Recoverable copies may remain after editing or removal.'));
  box.append(label('Follow-up state',status),label('Follow-up date (optional)',date),label('Private follow-up note (optional)',note));
  const keeper=createDraftKeeper({initial,saved:stored,read:()=>({entry:{status:status.value,date:date.value,note:note.value}}),modal,show,guard:()=>valid(token),persist:saveDraft,download,context});box.append(keeper.element);
  const edited=()=>{working=true;progressDraft={ref:structuredClone(ref),resume:show,keeper};keeper.paint();};note.oninput=edited;date.oninput=edited;status.onchange=edited;keeper.element.querySelector('input').addEventListener('input',edited);if(stored)progressDraft={ref:structuredClone(ref),resume:show,keeper};
  let busy=false;
  function show(){token=++view;keeper.paint();modal('Record what happened',box,[['Save follow-up',async()=>{if(busy)return;busy=true;try{const draft=keeper.record(),source=draftSourceState(context().visits,draft)[0];if(await saveProgress(source.ref,draft.entry,item,state,valid(token),keeper.expected(),draft)){working=false;if(progressDraft?.resume===show)progressDraft=null;detail(source.ref);}else{alert.textContent='Follow-up was not saved. Your entered note is still here. Keep a copy before closing or reloading.';}}catch(e){alert.textContent=e.message;}finally{busy=false;}}],...keeper.actions(),['Download this private progress draft',()=>download('my-private-progress-draft.txt',`${item.text}\n${status.value}\n${date.value}\n${note.value}`,'text/plain;charset=utf-8')],['Discard this progress draft',()=>modal('Discard this progress draft?','This removes only the working entry kept in this page. Any saved draft and saved progress remain unchanged. Delete a saved draft separately from its list.',[['Discard progress draft',()=>{progressDraft=null;working=false;open();}],['Keep editing progress',show]])],['Return to unfinished work',open]]);refreshStatus();const source=draftSourceState(context().visits,keeper.record())[0];if(source.state!=='current')alert.textContent=source.state==='missing'?'The original item is unavailable. Keep or download this draft; it cannot be recorded against another item.':'The original item changed. Your draft is kept. Review current saved work before starting a new entry.';}
  show();
 }
 function compose(refs){
  if(resumeMessage){modal('Keep your unfinished message?','A message is still kept in this page. Replacing this working editor does not delete its saved draft or saved visits. Save or download unsaved edits first if you want to keep them.',[['Return to my message',()=>resumeMessage()],['Replace message draft',()=>{resumeMessage=null;compose(refs);}]]);return;}
  const token=++view,state=context(),box=node('div'),visit=node('input'),contact=node('input');visit.type=contact.type='checkbox';
  check(state);
  box.append(node('p','Only the selected item wording is included by default. Choose any extra context deliberately. Private preparation, answer notes and follow-up history are never added automatically.'),label('Include visit titles and dates',visit),label('Include next-step contact details',contact));
  modal('Choose message context',box,[['Build editable draft',()=>{
   if(!valid(token)())return;try{check(state);}catch(e){notify(e.message);return;}
   editMessage(newFollowupDraft(state.visits,refs,{text:messageDraft(state.visits,refs,{includeVisit:visit.checked,includeContact:contact.checked})}));
  }]]);
 }
 function editMessage(initial,stored=null){
   let token=++view;const editor=node('textarea');editor.value=initial.text;editor.rows=12;editor.maxLength=1000000;working=true;
   const wrap=node('div');wrap.append(node('p','Save this draft by choice to continue another day. Until saved, it lasts only while this page stays open. Later visit edits do not rewrite your words. This app does not send messages or mark anyone as contacted.'),label('Message or call-note draft',editor));
   const keeper=createDraftKeeper({initial,saved:stored,read:()=>({text:editor.value}),modal,show:edit,guard:()=>valid(token),persist:saveDraft,download,context});messageKeeper=keeper;wrap.append(keeper.element);editor.oninput=keeper.paint;
   function edit(){token=++view;keeper.paint();modal('Edit your follow-up draft',wrap,[['Preview exact message',preview],...keeper.actions(),['Discard this message draft',()=>modal('Discard this message draft?','This removes only the working message kept in this page. Any saved draft, saved visits and downloaded copies remain. Delete a saved draft separately from its list.',[['Discard message',()=>{resumeMessage=null;messageKeeper=null;working=false;open();}],['Keep editing',edit]])]]);}
   function preview(){
    if(!editor.value.trim()){notify('Write a message first.');return;}
    const exact=editor.value,content=node('div');content.append(node('pre',exact),node('p','Only this text will be copied or downloaded. Nothing is sent, and item status stays unchanged.'));
    modal('This is the exact follow-up message',content,[['Copy follow-up message',async()=>{try{await copyText(exact);notify('Follow-up message copied. Nothing was sent.');}catch{notify('Copy is unavailable. Download the message instead.');}}],['Download follow-up message',()=>download('my-follow-up-message.txt',exact,'text/plain;charset=utf-8')],['Return to editing',edit]]);
   }
   resumeMessage=edit;edit();
 }
 function resumeSaved(raw){const d=validateDraft(raw);if(d.kind==='progress'){detail(d.sources[0].ref,d);return;}if(resumeMessage&&messageKeeper?.record().id===d.id){resumeMessage();return;}if(resumeMessage&&messageKeeper?.hasWork()){modal('Keep your unfinished message?','Return to your message or discard its working edits before opening this saved draft. Any saved copy remains.',[['Return to my message',()=>resumeMessage()],['Discard edits and open saved draft',()=>{resumeMessage=null;messageKeeper=null;editMessage(d,d);}]]);return;}editMessage(d,d);}
 const library=createDraftLibrary({modal,context,resume:resumeSaved,remove:deleteDraft,restore:restoreDraft,download});
 return {open,openSaved:library.open,resumeSaved,hasWork:()=>Boolean(resumeMessage&&messageKeeper?.hasWork()||progressDraft?.keeper.hasWork()),hasMessage:()=>Boolean(resumeMessage),hasProgress:()=>Boolean(progressDraft),messageSaved:()=>Boolean(resumeMessage&&!messageKeeper?.hasWork()),progressSaved:()=>Boolean(progressDraft&&!progressDraft.keeper.hasWork()),resumeProgress:()=>progressDraft?progressDraft.resume():open(),resumeMessage:()=>resumeMessage?resumeMessage():open(),refreshStatus};
}
import {copyText} from './platform.mjs';
