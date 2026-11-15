import {makeTransfer,readTransfer,planTransfer,TRANSFER_LIMIT} from './transfer-model.mjs';
import {draftContent} from './draft-ui.mjs';
const node=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;};
const label=(text,control)=>{control.setAttribute('aria-label',text);const el=node('label',text);el.append(control);return el;};
const check=text=>{const input=node('input');input.type='checkbox';return {input,el:label(text,input)};};
const choice=text=>{const select=node('select');for(const [value,title]of [['','Choose what to do'],['include','Include a separate private copy'],['exclude','Leave this unsaved work out']]){const o=node('option',title);o.value=value;select.append(o);}return {input:select,el:label(text,select)};};
function visitContent(visit){
 const box=node('div');box.append(node('p',`${visit.title||'Untitled visit'}${visit.date?' — '+visit.date:''}`));
 for(const [kind,items]of [['Question',visit.questions],['Next step',visit.actions]])for(const item of items){
  box.append(node('h4',`${kind}: ${item.text}`),node('p',`Progress: ${item.state}`));
  if(item.note)box.append(node('p','Private answer note'),node('pre',item.note));
  if(item.date)box.append(node('p',`Next-step date: ${item.date}`));if(item.contact)box.append(node('p',`Contact: ${item.contact}`));
  if(item.origin)box.append(node('p',`Copied from ${item.origin.title||'Untitled visit'}${item.origin.date?' — '+item.origin.date:''}`));
  if(item.history.length){const history=node('details');history.append(node('summary','Private follow-up history'));for(const e of item.history)history.append(node('p',`${e.status}${e.date?' — '+e.date:''}`),node('pre',e.note));box.append(history);}
 }
 for(const r of visit.requests)box.append(node('p',`Communication request (${r.visible?'shown':'hidden'}): ${r.text}`));
 if(visit.privateNotes){const notes=node('details');notes.append(node('summary','Private visit notes'),node('pre',visit.privateNotes));box.append(notes);}return box;
}
function preparationContent(p){
 const box=node('div');box.append(node('p',`${p.items.length} pending passages, ${p.completed.length} completed batches.`),node('h4','Private source text'),node('pre',p.source));
 const names={question:'Question',action:'Personal next step',private:'Private note'};for(const item of p.items)box.append(node('p',`${names[item.kind]}: ${item.text}`));
 box.append(node('p',p.destination.kind==='new'?'Destination: new visit':p.destination.kind==='saved'?'Destination: saved visit':'Destination: retained draft'));
 if(p.destination.snapshot){const d=node('details');d.append(node('summary','Destination copy kept with this preparation'),visitContent(p.destination.snapshot));box.append(d);}
 if(p.result){const d=node('details');d.append(node('summary','Last completed result kept with this preparation'),visitContent(p.result));box.append(d);}return box;
}
export function createTransfer({modal,close,context,commit,clearHistory,applyDisplay,openVisit,resumePreparation,openDraft,openFollowupDraft,download}){
 let view=0;document.querySelector('#dialog').addEventListener('close',()=>view++);
 const valid=token=>()=>token===view&&document.querySelector('#dialog').open;
 const same=(a,b)=>a.generation===b.generation&&a.editVersion===b.editVersion&&a.preparation.version===b.preparation.version&&a.store.revision===b.store.revision&&!b.conflict&&!b.damaged;
 function alert(box,text){let el=box.querySelector('[role="alert"]');if(!el){el=node('p');el.setAttribute('role','alert');box.prepend(el);}el.textContent=text;}
 function open(){
  const token=++view,state=context(),box=node('div');
  if(state.conflict||state.damaged){modal('Saved notes need attention','Keep separate backups of unfinished work, then reload or recover saved storage before transferring.');return;}
  box.append(node('p','Move private notes with one file. Nothing is uploaded or synced. The file is unencrypted: anyone with it can read your notes. Keep it somewhere private.'));
  box.append(node('p',`${state.store.visits.length} saved visits; ${state.store.preparations.length} saved preparations; ${state.store.preferences.length} saved communication requests. Follow-up history, source text and kept preparation results are included.`));
  box.append(node('p',`${state.store.followupDrafts.length} saved follow-up drafts are included. Unsaved message or progress edits are not included: save them as drafts first, or keep separate private draft backups. Recently removed content and recovery history are excluded. Recover anything you want first. Preparation copies and saved drafts may still contain earlier private words.`));
  box.append(node('p',`${state.store.transfers.length} previously restored files are recorded on this browser. These records keep file fingerprints and item identifiers, not copies of your wording. They remain after deleting notes so an old file cannot silently bring them back. They are not exported.`));
  if(state.store.transfers.length){const erase=node('button','Forget previously restored files');erase.onclick=()=>{
   const clearToken=++view;let busy=false;
   modal('Forget the local transfer record?', 'This removes only file fingerprints and imported-item identifiers. Current notes, preparation, focus and reading choices stay unchanged. A file imported afterward will be reviewed again and may bring back records you previously deleted. Downloaded files are not erased.', [['Forget restored-file records',async()=>{if(busy)return;busy=true;try{if(await clearHistory(state,valid(clearToken)))open();else{const message=node('p','Transfer records were not erased. Reopen transfer and try again.');message.setAttribute('role','alert');document.querySelector('#dialog-body').append(message);}}finally{busy=false;}}]]);
  };box.append(erase);}
  const reading=check('Include current reading choices');box.append(reading.el,node('p','These are the choices currently shown on this page, including changes not yet saved here. The receiving browser will ask before applying them.'));
  const draft=state.unsavedVisit?choice('Unsaved open visit'):null,prep=state.preparation.unsaved?choice('Unsaved preparation'):null;
  if(draft)box.append(draft.el);if(prep)box.append(prep.el);if(state.preparation.error)box.append(node('p',`Unfinished preparation cannot be included yet: ${state.preparation.error} Return to preparation to fix this, or explicitly leave it out.`));
  box.append(node('h3','Restore a transfer file'));
  const file=node('input');file.type='file';file.accept='.json,application/json';file.id='transfer-import';box.append(label('Choose a private transfer file',file));
  file.onchange=async()=>{const selected=file.files[0];file.value='';if(!selected)return;try{
   if(selected.size>TRANSFER_LIMIT)throw Error('Choose a transfer file no larger than 20 MiB.');
   const incoming=readTransfer(await selected.text());if(!valid(token)())return;if(!same(state,context()))throw Error('Notes changed while the file was read. Reopen transfer and review again.');
   const plan=await planTransfer(state.store,incoming);if(!valid(token)())return;if(!same(state,context()))throw Error('Notes changed while the preview was prepared. Reopen transfer and review again.');preview(plan,state);
  }catch(e){if(valid(token)())alert(box,e.message+' Existing notes and open work are unchanged.');}};
  modal('Move to another device',box,[['Review private transfer download',()=>{try{
   if(!same(state,context()))throw Error('Notes changed. Reopen transfer before downloading.');
   if(draft&&!draft.input.value||prep&&!prep.input.value)throw Error('Choose whether to include each piece of unsaved work.');
   if(prep?.input.value==='include'&&state.preparation.error)throw Error(state.preparation.error);
   const text=makeTransfer(state.store,{display:reading.input.checked?state.display:null,visit:draft?.input.value==='include'?state.visit:null,preparation:prep?.input.value==='include'?state.preparation.preparation:null}),review=node('div');
   review.append(node('p','Download this private snapshot. Downloading does not save unsaved work in this browser and does not prove the file is safely stored elsewhere.'),node('p',`${state.store.visits.length} saved visits and ${state.store.preparations.length} saved preparations, plus ${state.store.followupDrafts.length} saved follow-up drafts. Unsaved visit: ${draft?.input.value||'none'}. Unsaved preparation: ${prep?.input.value||'none'}. Reading choices: ${reading.input.checked?'included':'left out'}. Focus is included when available; recovery history is left out.`));
   modal('Review private transfer download',review,[['Download private transfer file',()=>download('my-private-visit-transfer.json',text,'application/json')],['Return to transfer choices',open]]);
  }catch(e){alert(box,e.message);}}]]);
 }
 function preview(plan,state){
  const token=++view,box=node('div');box.append(node('p','Nothing has changed yet. Import saves private content on this browser. Different records stay separate. Your open visit and preparation will not be replaced. Recovery history is not restored.'));
  for(const warning of plan.warnings)box.append(node('p',warning));
  for(const row of plan.rows){const details=node('details');details.append(node('summary',`${row.result}: ${row.source.title||row.source.name||'Untitled'}`));
   const local=row.kind==='followup-draft'?state.store.followupDrafts.find(d=>d.id===row.source.id):row.kind==='preparation'?state.store.preparations.find(p=>p.id===row.source.id):state.store.visits.find(v=>v.id===row.source.id),render=row.kind==='followup-draft'?draftContent:row.kind==='preparation'?preparationContent:visitContent;
   if(local&&row.result.startsWith('Keep both')){details.append(node('h4','Already on this browser — kept unchanged'),render(local),node('h4','From this file — added separately'));}
   details.append(render(row.source));
   box.append(details);
  }
  if(!plan.repeated){const requests=plan.next.preferences.filter(text=>!state.store.preferences.includes(text));box.append(node('p',`${requests.length} new saved communication requests will be added.`));for(const text of requests)box.append(node('p',text));}
  const focus=plan.focus?check('Use the transferred focus item'):null,display=plan.display?check('Apply the transferred reading choices after saving notes'):null;
  if(focus){const v=plan.next.visits.find(v=>v.id===plan.focus.visitId),item=v?.[plan.focus.kind==='question'?'questions':'actions'].find(i=>i.id===plan.focus.itemId);box.append(node('p',item?`Transferred focus: ${item.text} — ${v.title||'Untitled visit'}`:'The earlier transferred focus is no longer available.'),focus.el);}if(display)box.append(display.el,node('p',`Transferred reading choices: ${{standard:'Standard text',large:'Larger text',largest:'Largest text'}[plan.display.size]}, ${{standard:'standard spacing',roomy:'more space'}[plan.display.spacing]}, ${{soft:'soft background',high:'black on white',dark:'light on dark'}[plan.display.contrast]}. Notes are saved first. If the separate reading-settings save fails, your imported notes remain saved and you can retry settings.`));
  let busy=false;
  modal('Review transfer before saving',box,[['Save this transfer on this device',async()=>{
   if(busy)return;busy=true;try{
    if(!same(state,context()))throw Error('Notes changed since the preview. Reopen transfer to review again.');
    const ok=await commit(plan,state,{includeFocus:Boolean(focus?.input.checked)},valid(token));
    if(!ok){if(valid(token)())alert(box,'Transfer was not saved. Existing notes and open work are unchanged. Keep the file and review again.');return;}
    if(!valid(token)())return;
    let settingsError=null;if(display?.input.checked)try{applyDisplay(plan.display,state.displayRaw);}catch(e){settingsError=e.message;}
    complete(plan,state,Boolean(display?.input.checked),settingsError);
   }catch(e){if(valid(token)())alert(box,e.message);}finally{busy=false;}
  }]]);
  document.querySelector('#dialog-title').setAttribute('tabindex','-1');document.querySelector('#dialog-title').focus();document.querySelector('#dialog').scrollTop=0;
 }
 function complete(plan,state,wantedDisplay,settingsError){
  ++view;const box=node('div'),latest=context();box.append(node('p',plan.repeated?'This file was already restored. Existing edits and deletions were kept.':'Notes and the transfer record are saved. Your previously open work is unchanged.'));
  if(settingsError)alert(box,'Notes are saved, but reading choices were not: '+settingsError);
  else if(wantedDisplay)box.append(node('p','Reading choices were saved too.'));
  const actions=[];
  if(settingsError)actions.push(['Retry reading choices only',()=>{try{applyDisplay(plan.display,state.displayRaw);complete(plan,state,true,null);}catch(e){alert(box,'Notes remain saved. Reading choices were not saved: '+e.message);}}]);
  for(const id of plan.record.visits){const v=latest.store.visits.find(v=>v.id===id);if(v)actions.push([`Open transferred visit: ${v.title||'Untitled visit'}`,()=>openVisit(id)]);else box.append(node('p','A visit from this earlier transfer is no longer available. It was not recreated.'));}
  for(const id of plan.record.preparations){const p=latest.store.preparations.find(p=>p.id===id);if(p)actions.push([`Resume transferred preparation: ${p.name||'Untitled preparation'}`,()=>resumePreparation(id)]);else box.append(node('p','A preparation from this earlier transfer is no longer available. It was not recreated.'));}
  for(const id of plan.record.drafts){const p=latest.store.preparations.find(p=>p.id===id);if(p)actions.push([`Open transferred draft: ${p.destination.snapshot.title||'Untitled visit'}`,()=>openDraft(id)]);else box.append(node('p','A draft copy from this earlier transfer is no longer available. It was not recreated.'));}
  for(const id of plan.record.followupDrafts||[]){const d=latest.store.followupDrafts.find(d=>d.id===id);if(d)actions.push([`Open transferred follow-up draft: ${d.name||'Untitled draft'}`,()=>openFollowupDraft(id)]);else box.append(node('p','A saved follow-up draft from this earlier transfer is no longer available. It was not recreated.'));}
  actions.push(['Return to transfer choices',open]);modal('Transfer result',box,actions);
 }
 return {open};
}
