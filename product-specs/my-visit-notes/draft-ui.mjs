import {validateDraft,followupDraftBackup,draftContentKey,readFollowupDraftBackup,DRAFT_BACKUP_LIMIT} from './draft-model.mjs';
const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};

// A keeper describes one editor, not a global autosave preference. The caller
// supplies an operation-specific validity guard for queued writes.
export function createDraftKeeper({initial,saved=null,read,modal,show,guard,persist,download,context}){
 const base=validateDraft(initial),box=node('section'),name=node('input'),status=node('p');name.value=base.name;name.maxLength=200;name.setAttribute('aria-label','Draft name (optional)');const label=node('label','Draft name (optional)');label.append(name);status.setAttribute('role','status');status.className='draft-save-status';box.append(label,status);
 let expected=saved?validateDraft(saved):null,busy=false,error='';
 const record=()=>validateDraft({...base,...read(),name:name.value});
 function hasWork(){try{return !expected||context().conflict||context().damaged||draftContentKey(record())!==draftContentKey(expected)||!context().drafts.some(d=>JSON.stringify(d)===JSON.stringify(expected));}catch{return true;}}
 function paint(){status.textContent=error||(busy?'Draft is not saved yet. Keep this page open.':expected&&!hasWork()?'Draft saved on this device. Later edits need another save.':expected?'Draft changes are not saved. Save again or download before closing.':'Temporary draft — not saved. Save or download before closing.');}
 name.oninput=()=>{error='';paint();};
 async function save(){
  if(busy)return;
  let next;try{next={...record(),updatedAt:Date.now()};}catch(e){error=e.message;paint();return;}
  const valid=guard();busy=true;error='';paint();
  try{const ok=await persist(next,expected,valid);if(!valid())return;if(ok){expected=validateDraft(next);error='';}else error='Draft was not saved. Your working words are still here. Download a private draft backup before closing.';show();}
  catch(e){if(valid()){error=e.message;show();}}
  finally{busy=false;paint();}
 }
 function saveChoice(){
  if(expected){save();return;}
  modal('Keep this private draft on this device?','This keeps the draft and its source context in this browser. A progress draft also keeps the original item, including its private notes and history, so newer changes can be detected. Anyone using this browser may open it. Nothing is sent or recorded as progress. Later edits need another save. Downloaded backups are unencrypted.',[['Save private draft',save],['Return to draft',show]]);
 }
 const backup=()=>{try{download('my-private-followup-draft.json',followupDraftBackup(record()),'application/json');}catch(e){error=e.message;paint();}};
 paint();return {element:box,paint,record,expected:()=>expected,hasWork,actions:()=>[['Save draft on this device',saveChoice],['Download private draft backup',backup]]};
}

export function draftContent(value){
 const d=validateDraft(value),box=node('div');box.append(node('p',d.kind==='message'?'Message draft — nothing has been sent.':'Progress draft — this has not been recorded as progress.'));
 for(const s of d.sources)box.append(node('p',`${s.title||'Untitled visit'}${s.date?' — '+s.date:''}`),node('pre',s.text));
 if(d.kind==='message')box.append(node('pre',d.text));else{
  box.append(node('p',d.entry.status),node('p',d.entry.date||'No follow-up date'),node('pre',d.entry.note));
  const original=node('details');original.append(node('summary','Original private item kept with this draft'));const item=d.sources[0].expected;
  if(item.note)original.append(node('pre',item.note));if(item.contact)original.append(node('p',item.contact));
  for(const e of item.history)original.append(node('p',`${e.status} ${e.date}`),node('pre',e.note));box.append(original);
 }
 return box;
}
export function createDraftLibrary({modal,context,resume,remove,restore,download}){
 let view=0;document.querySelector('#dialog').addEventListener('close',()=>view++);
 const valid=token=>()=>view===token&&document.querySelector('#dialog').open;
 function open(){
  const token=++view,state=context(),box=node('div'),alert=node('p');alert.setAttribute('role','alert');box.append(alert);
  box.append(node('p','These are private saved drafts, not sent messages or recorded progress. Choose one to open. Deleting a draft does not delete its visits or downloaded files.'));
  if(state.conflict||state.damaged){box.append(node('p','Saved notes changed or cannot be read. Keep any working drafts before reloading or recovering saved data.'));modal('Saved follow-up drafts',box);return;}
  if(!state.drafts.length)box.append(node('p','No saved follow-up drafts yet. Save a draft from its editor when you want to continue another day.'));
  for(const draft of state.drafts){
   const article=node('article');article.append(node('h3',draft.name||'Untitled draft'),node('p',draft.kind==='message'?'Message draft':'Progress draft'));
   const button=(name,fn)=>{const b=node('button',name);b.onclick=fn;article.append(b);};
   button(`Open draft: ${draft.name||'Untitled draft'}`,()=>resume(draft));
   button(`Download draft backup: ${draft.name||'Untitled draft'}`,()=>download('my-private-followup-draft.json',followupDraftBackup(draft),'application/json'));
   button(`Delete draft: ${draft.name||'Untitled draft'}`,()=>{
    let busy=false;modal('Delete this saved draft?',draftContent(draft),[['Delete saved draft',async()=>{if(busy)return;busy=true;try{if(await remove(draft,valid(token)))open();else if(valid(token)()){const p=node('p','Draft was not deleted. Saved or working content may have changed. Reopen the list to review.');p.setAttribute('role','alert');document.querySelector('#dialog-body').append(p);}}finally{busy=false;}}],['Keep saved draft',open]]);
   });box.append(article);
  }
  const input=node('input');input.type='file';input.accept='.json,application/json';input.id='followup-draft-import';input.setAttribute('aria-label','Choose a private follow-up draft backup');const label=node('label','Restore a private follow-up draft backup');label.append(input);box.append(label);
  input.onchange=async()=>{const file=input.files[0];input.value='';if(!file)return;try{
   if(file.size>DRAFT_BACKUP_LIMIT)throw Error('Choose a draft backup no larger than 10 MiB.');const draft=readFollowupDraftBackup(await file.text());if(!valid(token)())return;
   const preview=draftContent(draft);preview.prepend(node('p','Restore this as a separate private saved draft. This file does not carry its source visits, so progress cannot be applied to a guessed local source. Exact words remain available; use a full device transfer to carry visits and their draft links together. Identical restored copies are skipped. Your current editor is not replaced.'));
   let busy=false;modal('Review private draft restore',preview,[['Keep restored draft on this device',async()=>{if(busy)return;busy=true;try{if(await restore(draft,state,valid(token)))open();else if(valid(token)()){const p=node('p','Draft was not restored. Keep the file and review again.');p.setAttribute('role','alert');preview.append(p);}}finally{busy=false;}}],['Cancel draft restore',open]]);
  }catch(e){if(valid(token)())alert.textContent=e.message;}};
  modal('Saved follow-up drafts',box);
 }
 return {open};
}
