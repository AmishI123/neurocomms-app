import {isNative,copyText,printText,exportText,startNative} from './platform.mjs';
import {KEY,STATES,uid,blank,question,example,validateVisit,readStore,summary,backup,restore,ACTION_STATES,action,emptyStore,carryForward,libraryBackup,restoreLibrary,planLibraryImport,findVisits} from './model.mjs';
import {createIntake} from './intake.mjs';
import {validatePreparation,applyPreparationBatch} from './preparation-model.mjs';
import {activeRecovery,captureRecovery,visitChanges,batchChanges,recordChanges,recoveryPreview,applyRecovery} from './recovery-model.mjs';
import {createRecoveryUI} from './recovery-ui.mjs';
import {createFollowup} from './followup-ui.mjs';
import {findWork,unfinished,recordStateChanges,updateFollowup} from './followup-model.mjs';
import {createTransfer} from './transfer-ui.mjs';
import {createConversation} from './conversation-ui.mjs';
import {createJourney} from './journey-ui.mjs';
import {createNextAppointment} from './next-appointment-ui.mjs';
import {reviewSummary,nextStepDraft,reviewState} from './after-review-model.mjs';
import {saveFollowupDraft,deleteFollowupDraft,finishProgressDraft,planDraftRestore} from './draft-model.mjs';
import {applyTransferPlan} from './transfer-model.mjs';
import {DISPLAY_KEY,currentDisplay,applyTransferredDisplay} from './display.mjs';
const $=s=>document.querySelector(s);const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let visit=blank(),screen='prepare',store=emptyStore(),enabled=false,dirty=false,conflict=false,damaged=false,queue=Promise.resolve(),size=32,lastFocus=null;
let selected=new Set(),noteSelection=new Set(),requestSelection=new Set(),actionSelection=new Set();
let generation=0,editVersion=0,summaryStarted=false,started=false;
let temporaryRecovery=[],lastVisit=structuredClone(visit);
const notify=text=>{$('#notice').textContent=text;};
function status(text){$('#status').dataset.state=conflict||damaged||(enabled&&dirty)?'unsaved':enabled?'saved':'temporary';$('#status').hidden=!started&&!damaged&&!conflict;$('#status').textContent=text||(conflict?'Not saved: another tab changed saved visits. Download your draft before reloading.':damaged?'Saved data could not be read. Your new draft is temporary.':!enabled?'Temporary visit — not saved. Save or download before closing.':dirty?'Changes not saved.': 'Saved on this device. Visit changes save automatically.');document.dispatchEvent(new Event('visit-save-status'));}
function load(){try{store=readStore(localStorage.getItem(KEY));damaged=false;}catch(e){damaged=true;notify(e.message+' Existing data has not been replaced.');}$('#repair').hidden=!damaged;status();renderList();}
function renderList(){$('#visit-list').innerHTML=findVisits(store.visits,$('#visit-search').value).map(v=>`<article><button data-open="${esc(v.id)}">${esc(v.title||'Untitled visit')} ${esc(v.date)}</button><p>${v.questions.filter(q=>unfinished('question',q)&&q.text.trim()).length} unanswered questions · ${v.actions.filter(a=>unfinished('action',a)&&a.text.trim()).length} unfinished next steps</p><button data-carry="${esc(v.id)}">Prepare another visit from ${esc(v.title||'Untitled visit')}</button></article>`).join('')||'<p>No matching saved visits.</p>';}
async function write(operation,{valid=()=>true,settled=()=>{dirty=false;},recover=true,label='Visit change',merge=true}={}){
 if(!navigator.locks){notify('Safe saving is unavailable in this browser. Use a full backup instead.');return false;}
 if(damaged||conflict){status();return false;}
 try{return await navigator.locks.request(KEY,async()=>{
  if(!valid())return false;
  const latest=readStore(localStorage.getItem(KEY));if(latest.revision!==store.revision){conflict=true;status();return false;}
  const next=operation(structuredClone(latest));next.revision=latest.revision+1;
  next.visits=next.visits.map(v=>recordStateChanges(latest.visits.find(old=>old.id===v.id),v));
  if(next.focus){try{const focused=findWork(next.visits,next.focus);if(!unfinished(next.focus.kind,focused.item))next.focus=null;}catch{next.focus=null;}}
  next.recovery=recover?captureRecovery(latest,next,{label,merge}):activeRecovery(next.recovery);
  localStorage.setItem(KEY,JSON.stringify(next));store=next;settled();status();renderList();return true;
 });}catch(e){dirty=true;status('Not saved: storage is unavailable or damaged. Download a full backup.');notify(e.message);return false;}
}
function persist(isBatch=false){
 const requestedGeneration=generation,requestedEdit=editVersion,snapshot=validateVisit(visit);
 const pending=structuredClone(temporaryRecovery);
 const valid=()=>enabled&&generation===requestedGeneration;
 queue=queue.then(async()=>{if(!valid())return;await write(s=>{const i=s.visits.findIndex(x=>x.id===snapshot.id);if(i<0)s.visits.push(snapshot);else s.visits[i]=snapshot;s.recovery=activeRecovery([...s.recovery,...pending.filter(r=>!s.recovery.some(old=>old.id===r.id))]);return s;},{valid,recover:!isBatch,settled:()=>{temporaryRecovery=temporaryRecovery.filter(r=>!pending.some(p=>p.id===r.id));dirty=editVersion!==requestedEdit;}});});return queue;
}
function changed(isBatch=false){visit=recordStateChanges(lastVisit,visit);if(!enabled&&!isBatch)temporaryRecovery=recordChanges(temporaryRecovery,visitChanges(lastVisit,visit),'Draft change',Date.now(),true);lastVisit=structuredClone(visit);editVersion++;dirty=true;status();if(enabled)persist(isBatch);}
function current(){return visit.questions.find(q=>q.id===visit.current)||visit.questions[0];}
function field(label,body){return `<label>${label}${body.replace(/<(input|textarea|select)\b/,`<$1 aria-label="${esc(label)}"`)}</label>`;}
function stateSelect(q){return field('Question state',`<select data-q="${esc(q.id)}" data-field="state">${STATES.map(s=>`<option ${s===q.state?'selected':''}>${s}</option>`).join('')}</select>`);}
function originNote(item){return item.origin?`<p>Copied from ${esc(item.origin.title||'Untitled visit')}${item.origin.date?' — '+esc(item.origin.date):''}. This copy and its original change separately.</p><button data-inspect-source="${esc(item.id)}" data-source-kind="${Object.hasOwn(item,'note')?'question':'action'}">Where this item came from</button>`:'';}
function editor(q,i){return `<article class="question">${originNote(q)}${field(`Question ${i+1}`,`<textarea dir="auto" data-q="${esc(q.id)}" data-field="text">${esc(q.text)}</textarea>`)}<button data-move="${esc(q.id)}" data-dir="-1" ${i===0?'disabled':''}>Move up</button><button data-move="${esc(q.id)}" data-dir="1" ${i===visit.questions.length-1?'disabled':''}>Move down</button><button data-remove="${esc(q.id)}">Remove question ${i+1}</button></article>`;}
function showWorkspace(){started=true;journey.showWorkspace();status();}
function go(next){if(next==='during'&&!visit.questions.some(q=>q.text.trim())){notify('Add a question before starting the visit.');return;}showWorkspace();screen=next;if(next==='review'&&!summaryStarted){selected=new Set(visit.questions.filter(q=>q.text.trim()).map(q=>q.id));noteSelection=new Set();requestSelection=new Set();summaryStarted=true;}render();$('#screen h2')?.focus();}
function render(){
 document.body.dataset.screen=started?screen:'welcome';
 const active=document.activeElement;
 const actionFocus=active?.dataset.actionId&&active?.dataset.actionField?`[data-action-id="${CSS.escape(active.dataset.actionId)}"][data-action-field="${CSS.escape(active.dataset.actionField)}"]`:null;
 const focusKey=active?.dataset.q&&active?.dataset.field?`[data-q="${CSS.escape(active.dataset.q)}"][data-field="${CSS.escape(active.dataset.field)}"]`:null;
 $('#screen').innerHTML=screen==='prepare'?`<section><h2 tabindex="-1">Prepare my visit</h2><div class="row">${field('Visit title (optional)',`<input data-visit="title" value="${esc(visit.title)}">`)}${field('Date (optional)',`<input type="date" data-visit="date" value="${esc(visit.date)}">`)}</div>${visit.questions.map(editor).join('')}<button data-action="add">Add question</button><details class="private"><summary>Private preparation notes</summary><p>These never appear in the conversation display or shared summaries. Full backups include them.</p>${field('Private notes',`<textarea data-visit="privateNotes">${esc(visit.privateNotes)}</textarea>`)}</details><button data-screen="requests">Choose what helps</button><button class="primary" data-screen="during">Start the visit</button></section>`:
 screen==='requests'?`<section><h2 tabindex="-1">What helps me communicate</h2><p>Choose your own words. This step is optional.</p><button data-action="templates">Add editable examples</button><button data-action="save-preferences">Save requests for future visits</button><button data-action="use-preferences">Choose saved requests</button><button data-action="clear-preferences">Clear saved requests</button>${visit.requests.map((r,i)=>`<article>${field('Request',`<textarea data-request="${i}">${esc(r.text)}</textarea>`)}${field(`<input type="checkbox" data-visible="${i}" ${r.visible?'checked':''}> Show this request`,'')}<button data-remove-request="${i}">Remove request</button></article>`).join('')}<button data-action="request">Add my own request</button><button data-action="show-requests">Preview selected requests</button><button data-screen="during">Continue to the visit</button></section>`:
 screen==='during'?`<section><h2 tabindex="-1">During the visit</h2>${current()?`<p>${esc(current().state)} · Question ${visit.questions.indexOf(current())+1} of ${visit.questions.length}</p><div class="big-question" dir="auto" style="--question-size:${size}px">${esc(current().text)}</div><details class="display-options"><summary>Question display</summary>${field('Question text size',`<select id="size"><option value="26" ${size===26?'selected':''}>Large</option><option value="32" ${size===32?'selected':''}>Larger</option><option value="42" ${size===42?'selected':''}>Largest</option></select>`)}</details><div class="visit-controls"><button data-action="previous">Previous</button><button data-action="next">Next</button>${stateSelect(current())}</div><details class="private"><summary>My personal answer note</summary><p>This is your note, not a confirmed clinical answer. It stays hidden when this section is closed.</p>${field('Answer note',`<textarea data-q="${esc(current().id)}" data-field="note">${esc(current().note)}</textarea>`)}</details><button data-action="show-note">Show this answer note</button>`:''}<button data-action="show-requests">Show what helps</button><details><summary>All questions — jump to one</summary>${visit.questions.map((q,i)=>`<button data-jump="${esc(q.id)}">${i+1}. ${esc(q.text||'(empty question)')} — ${esc(q.state)}</button>`).join('')}</details><button data-action="add-during">Add question during visit</button><button data-screen="prepare">Return to preparation</button><button data-action="pause">Pause this visit</button><button class="primary" data-screen="review">Review after the visit</button></section>`:
 `<section class="after-review-screen"><h2 tabindex="-1">After the visit</h2><p>Review what happened in your own words. These labels are your notes, not a medical conclusion. Nothing is marked done automatically.</p><div class="after-review-questions">${visit.questions.map(q=>`<article class="after-review-item">${field(`<input type="checkbox" data-share="${esc(q.id)}" ${selected.has(q.id)?'checked':''}> Include this question`,'')}${field('Question',`<textarea data-q="${esc(q.id)}" data-field="text">${esc(q.text)}</textarea>`)}${field('What happened?',`<select data-q="${esc(q.id)}" data-field="state">${['Open','Answered','Partly answered','Ask later'].map(s=>`<option value="${s}" ${s===q.state?'selected':''}>${s==='Open'?'Not discussed':s==='Ask later'?'Still unclear':s}</option>`).join('')}</select>`)}${field('My personal answer note (not confirmed by a clinician)',`<textarea data-q="${esc(q.id)}" data-field="note">${esc(q.note)}</textarea>`)}<button data-action="make-next-step" data-q="${esc(q.id)}">Turn this into an editable next step</button>${field(`<input type="checkbox" data-share-note="${esc(q.id)}" ${noteSelection.has(q.id)?'checked':''}> Include this answer note`,'')}</article>`).join('')}</div><h3>Communication requests to include</h3><div class="after-review-requests">${visit.requests.map((r,i)=>r.visible?field(`<input type="checkbox" data-share-request="${i}" ${requestSelection.has(i)?'checked':''}> ${esc(r.text)}`,''):'').join('')}</div>${renderActions()}<button class="primary" data-action="summary">Preview selected summary</button><button data-action="after-review-summary">Review what happened and what comes next</button><button data-action="new">Start a new visit</button></section>`;
 // HTML parsing drops a textarea's first newline. Assign values explicitly so
 // recovery previews and editors preserve the same exact private wording.
 for(const t of $('#screen').querySelectorAll('textarea')){
  if(t.dataset.visit)t.value=visit[t.dataset.visit];
  else if(t.dataset.q)t.value=visit.questions.find(q=>q.id===t.dataset.q)[t.dataset.field];
  else if(t.dataset.request!==undefined)t.value=visit.requests[+t.dataset.request].text;
  else if(t.dataset.actionId)t.value=visit.actions.find(a=>a.id===t.dataset.actionId)[t.dataset.actionField];
 }
 document.querySelectorAll('nav button').forEach(b=>b.setAttribute('aria-current',b.dataset.screen===screen?'step':'false'));
 if(focusKey||actionFocus)document.querySelector(focusKey||actionFocus)?.focus();
 if(screen==='prepare'){const p=document.createElement('p');p.textContent='Put questions in the order you want to discuss them. The app does not rank their medical importance.';const b=document.createElement('button');b.dataset.action='appointment-plan';b.textContent='Review my appointment plan';$('#screen > section').append(p,b);}
 journey.refresh();
}
function renderActions(){return `<section class="after-review-actions"><h2>My next steps</h2><p>Write what you want to do. These are your notes, not instructions from this app. Dates are optional; there are no overdue warnings.</p><div class="after-review-action-list">${visit.actions.map((a,i)=>`<article class="after-review-item">${originNote(a)}${field(`Next step ${i+1}`,`<textarea data-action-id="${esc(a.id)}" data-action-field="text">${esc(a.text)}</textarea>`)}${field('Next step date (optional)',`<input type="date" data-action-id="${esc(a.id)}" data-action-field="date" value="${esc(a.date)}">`)}${field('Contact (optional)',`<input data-action-id="${esc(a.id)}" data-action-field="contact" value="${esc(a.contact)}">`)}${field('Next step state',`<select data-action-id="${esc(a.id)}" data-action-field="state">${ACTION_STATES.map(s=>`<option ${s===a.state?'selected':''}>${s}</option>`).join('')}</select>`)}${field(`<input type="checkbox" data-share-action="${esc(a.id)}" ${actionSelection.has(a.id)?'checked':''}> Include this next step, date, and contact in the summary`,'')}<button data-remove-action="${esc(a.id)}">Remove next step ${i+1}</button></article>`).join('')}</div><button data-action="add-action">Add next step</button></section>`;}
const conversation=createConversation({
 context:()=>({id:visit.id,current:visit.current,questions:visit.questions.filter(q=>q.text.trim()).map(q=>({id:q.id,text:q.text})),requests:visit.requests.filter(r=>r.visible&&r.text.trim()).map(r=>r.text),saveStatus:conflict?'Not saved: another tab changed saved visits. Return to your workspace to keep a backup.':damaged?'Saved data cannot be read. Keep a backup from your workspace.':!enabled?'Temporary visit — closing this page can lose your work. Return to your workspace to save or download.':dirty?'Changes are not saved. Return to your workspace to save or download.':'Your visit and current question are saved on this device. Conversation choices last only while this page stays open.'}),
 move:id=>{if(visit.current!==id){visit.current=id;changed();}},
 leave:(to,id)=>{if(id)visit.current=id;go(to==='note'?'during':to);if(to==='note'){const note=$('#screen .private');if(note){note.open=true;note.querySelector('textarea')?.focus();}}}
});
function modal(title,content,actions=[]){if(!$('#dialog').open)lastFocus=document.activeElement;$('#dialog-title').textContent=title;$('#dialog-body').replaceChildren();if(typeof content==='string'){const p=document.createElement('p');p.textContent=content;$('#dialog-body').append(p);}else $('#dialog-body').append(content);$('#dialog-actions').replaceChildren();for(const [label,fn] of actions){const b=document.createElement('button');b.textContent=isNative()?label.replace(/^Download /,'Save or share '):label;b.onclick=fn;$('#dialog-actions').append(b);}if(!$('#dialog').open)$('#dialog').showModal();else $('#dialog-actions button')?.focus();fitDialog();}
function fitDialog(){const dialog=$('#dialog');if(!dialog.open)return;const scale=dialog.getBoundingClientRect().width/dialog.offsetWidth||1;dialog.style.maxHeight=`${(window.visualViewport?.height||innerHeight)*.9/scale}px`;}
window.addEventListener('resize',fitDialog);
window.visualViewport?.addEventListener('resize',fitDialog);
function choiceList(items){const wrap=document.createElement('div');for(const {id,text} of items){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.value=id;label.append(input,document.createTextNode(text));wrap.append(label);}return wrap;}
function chosen(wrap){return new Set([...wrap.querySelectorAll('input:checked')].map(i=>i.value));}
function showCarry(source){
 const snapshot=validateVisit(source),sourceGeneration=generation;
 const wrap=choiceList([...snapshot.questions.filter(q=>q.text.trim()).map(q=>({id:'q:'+q.id,text:`Question: ${q.text} (${q.state})`})),...snapshot.actions.filter(a=>a.text.trim()).map(a=>({id:'a:'+a.id,text:`Next step: ${a.text} (${a.state})${a.date?' — '+a.date:''}${a.contact?' — '+a.contact:''}`}))]);
 const intro=document.createElement('p');intro.textContent='Choose what to bring forward. The original stays unchanged. Questions start Open and next steps start To do. Private preparation notes, answer notes, follow-up history and communication requests are not copied. Source visit titles and dates stay with each copy; originals and copies change independently.';wrap.prepend(intro);
 modal('Choose items for another visit',wrap,[['Preview new visit',()=>{
  const ids=chosen(wrap);if(!ids.size){intro.textContent='Choose at least one question or next step.';return;}
  const next=carryForward(snapshot,new Set([...ids].filter(x=>x.startsWith('q:')).map(x=>x.slice(2))),new Set([...ids].filter(x=>x.startsWith('a:')).map(x=>x.slice(2))));
  const preview=summary(next,new Set(next.questions.map(q=>q.id)),new Set(),new Set(),new Set(next.actions.map(a=>a.id)));
  const box=document.createElement('div');box.append(pre(preview));const warning=document.createElement('p');warning.textContent='Creating this draft replaces the open draft. Unsaved changes will be lost. Cancel to back them up first. The new title and visit date are blank; copied next-step dates and contacts are shown above.';box.append(warning);
  modal('Preview the new visit',box,[['Create new draft',()=>{if(generation!==sourceGeneration){notify('The open visit changed. Start again.');close();return;}close();openVisit(next);notify('New temporary draft created. The earlier visit is unchanged. Add a title and save when ready.');}]]);
 }]]);
}
function choosePreferences(saving){
 const items=saving?visit.requests.filter(r=>r.visible&&r.text.trim()).map(r=>r.text):store.preferences;
 if(!items.length){notify(saving?'Add or show a request first.':'No saved communication requests yet.');return;}
 const generationAtStart=generation,wrap=choiceList(items.map((text,i)=>({id:String(i),text})));
 const intro=document.createElement('p');intro.textContent=saving?'Choose requests to save on this device. Anyone using this browser may see them. Existing saved requests will be kept.':'Choose requests for this visit. This does not include them in a shared summary.';wrap.prepend(intro);
 modal(saving?'Choose requests to save':'Choose saved requests',wrap,[['Preview chosen requests',()=>{
  const texts=[...chosen(wrap)].map(i=>items[+i]);if(!texts.length){intro.textContent='Choose at least one request.';return;}
  modal('Review chosen communication requests',pre(texts.join('\n\n')),[[saving?'Save these requests':'Add these requests to this visit',async()=>{
   if(saving){const ok=await write(s=>{s.preferences=[...new Set([...s.preferences,...texts])];return s;},{settled:()=>{}});if(ok){close();notify('Selected requests saved on this device.');}}
   else {if(generation!==generationAtStart){close();notify('The open visit changed. Choose requests again.');return;}visit.requests.push(...texts.filter(text=>!visit.requests.some(r=>r.text===text)).map(text=>({text,visible:true})));requestSelection.clear();changed();close();render();notify('Chosen requests added. Nothing was selected for sharing.');}
  }]]);
 }]]);
}
function recoveryControls(selector='#import'){journey.reveal('saved');$('#recovery-tools').open=true;close($(selector));$(selector)?.focus();}
function showRecovery(){modal('What do you need help with?','Nothing will be removed by choosing an option.',[
 ['Find a saved visit',()=>{$('#saved').open=true;$('#visit-search').value='';renderList();close($('#visit-search'));$('#visit-search').focus();}],
 ['Browser data was cleared',()=>modal('Recover after browser data was cleared','This app has no server copy. If you downloaded a backup, you can restore it. Without a browser copy or a backup file, deleted notes cannot be recovered here.',[['Show backup restore controls',()=>recoveryControls()]])],
 ['Restore a backup or an older file',()=>modal('Choose the right restore control','An individual backup opens a new draft and asks before replacing your open draft. A library backup previews additions and skipped copies while leaving your draft alone. Supported older files are read; damaged or newer unsupported files are rejected without changing your notes.',[['Show backup restore controls',()=>recoveryControls()]])],
 ['I cannot save or copies conflict',()=>modal('Keep the current draft first','Download a private backup before reloading saved visits. A library import keeps conflicting copies separately and skips identical copies. It does not overwrite newer work. A saved-library download does not include failed edits in this draft.',[['Back up this open draft',()=>modal('Full backup includes private notes','Keep this file privately. It contains all content in your current draft, including private notes.',[['Download private backup',()=>download('my-visit-backup.json',backup(visit),'application/json')]])],['Show reload and restore controls',()=>recoveryControls('#import')]])],
 ['Saved data looks damaged',()=>modal('Protect unreadable data before resetting','Existing saved data is kept in place. If the app reports damaged data, the recovery control offers a raw download before a confirmed reset. Do not reset just because an older app cannot read newer data. Keep a backup of the open draft too.',[['Show data recovery controls',()=>recoveryControls(damaged?'#repair':'#import')]])]
 ]);}
function close(focusTarget){if(focusTarget instanceof HTMLElement)lastFocus=focusTarget;$('#dialog').close();}
$('#cancel-dialog').onclick=close;$('#dialog').addEventListener('close',()=>{lastFocus?.isConnected&&lastFocus.focus();$('#dialog-body').replaceChildren();$('#dialog-actions').replaceChildren();});
const pre=text=>{const n=document.createElement('pre');n.textContent=text;return n;};
async function download(name,text,type){try{const message=await exportText(name,text,type);if(message)notify(message);}catch(error){notify('File export did not finish. Your notes are still here. '+error.message);}}
function replacement(fn){if(dirty||(!enabled&&(visit.questions.length||visit.privateNotes||visit.title||visit.date||visit.requests.length||visit.actions.length))){modal('Replace this open draft?','Unsaved work will be lost. Cancel to download a full backup first.',[['Replace open draft',()=>{close();fn();}]]);}else fn();}
function openVisit(v,isSaved=false){intake.pinOpenDestination();showWorkspace();generation++;editVersion=0;summaryStarted=false;visit=structuredClone(v);lastVisit=structuredClone(visit);temporaryRecovery=[];enabled=isSaved;dirty=false;selected.clear();noteSelection.clear();requestSelection.clear();actionSelection.clear();screen='prepare';notify('');status();render();$('#screen h2')?.focus();}
const nextAppointment=createNextAppointment({modal,close,download,notify,
 context:(readSaved=true)=>({visits:readSaved?readStore(localStorage.getItem(KEY)).visits:[],visit:structuredClone(visit),generation,editVersion,replaceWarning:dirty||(!enabled&&Boolean(visit.questions.length||visit.actions.length||visit.requests.length||visit.privateNotes||visit.title||visit.date))}),
 create:v=>openVisit(v),startFresh:()=>replacement(()=>{close();openVisit(blank());}),
 print:text=>{printText(text).catch(()=>notify('Printing did not open. Export or copy the reviewed text instead.'));}
});
function addQuestion(text){const q=question(text);visit.questions.push(q);if(!visit.current)visit.current=q.id;selected.add(q.id);changed();return q;}
const recoveryUI=createRecoveryUI({modal,notify,
 context:()=>({store:!enabled?{...structuredClone(store),visits:[...store.visits.filter(v=>v.id!==visit.id),structuredClone(visit)],recovery:[...store.recovery,...temporaryRecovery]}:structuredClone(store),temporary:!enabled,generation,editVersion,revision:store.revision}),
 restore:async(id,preview,state,valid)=>{
  const allowed=()=>valid()&&$('#dialog').open&&state.generation===generation&&state.editVersion===editVersion;
  try{
   await queue;
   if(!allowed())return false;
   if(enabled&&dirty)throw Error('The open visit has unsaved changes. Save them or keep a private backup before reopening saved notes for recovery.');
   if(temporaryRecovery.some(r=>r.id===id)){
    const next=applyRecovery(state.store,id,preview);temporaryRecovery=next.recovery.filter(r=>temporaryRecovery.some(t=>t.id===r.id));visit=next.visits.find(v=>v.id===visit.id);changed();
   }else{
    await queue;
    const ok=await write(s=>applyRecovery(s,id,preview),{valid:allowed,label:'Recovery',merge:false,settled:()=>{}});if(!ok)return false;
    if(enabled){const updated=store.visits.find(v=>v.id===visit.id);if(updated){visit=structuredClone(updated);lastVisit=structuredClone(visit);dirty=false;editVersion++;}}
   }
   selected.clear();noteSelection.clear();requestSelection.clear();actionSelection.clear();summaryStarted=true;render();status();return true;
  }catch(e){notify(e.message);return false;}
 },
 erase:async(ids,state,valid)=>{
  const allowed=()=>valid()&&$('#dialog').open&&state.generation===generation&&state.editVersion===editVersion;
  if(!allowed())return false;
  if(ids.some(id=>store.recovery.some(r=>r.id===id))){await queue;const ok=await write(s=>{s.recovery=s.recovery.filter(r=>!ids.includes(r.id));return s;},{valid:allowed,recover:false,settled:()=>{}});if(!ok)return false;}
  temporaryRecovery=temporaryRecovery.filter(r=>!ids.includes(r.id));return true;
 }
});
const intake=createIntake({modal,close,download,notify,
 context:()=>({visit:structuredClone(visit),saved:structuredClone(store.visits),preparations:structuredClone(store.preparations),receipts:structuredClone(store.preparationReceipts),started,enabled,generation,editVersion,revision:store.revision,conflict}),
 preparationAPI:{
  save:async(snapshot,expected,valid)=>preparationWrite(s=>{
   const p=validatePreparation(snapshot),index=s.preparations.findIndex(x=>x.id===p.id);
   if(expected){if(index<0||JSON.stringify(s.preparations[index])!==JSON.stringify(expected))throw Error('Saved preparation changed. Keep a backup and reload before saving.');s.preparations[index]=p;}
   else{if(index>=0)throw Error('A saved preparation already uses this identifier.');s.preparations.push(p);}
   for(const completed of p.completed){
    const receipt=s.preparationReceipts.find(r=>r.batchId===completed.batchId);
    if(receipt&&receipt.visitId!==completed.visitId)throw Error('This backup has a conflicting completion record. Keep it separately; existing data was not changed.');
    if(!receipt)s.preparationReceipts.push({batchId:completed.batchId,preparationId:p.id,visitId:completed.visitId});
   }
   return s;
  },valid),
  remove:async(expected,valid,recoverable=false)=>preparationWrite(s=>{
   const index=s.preparations.findIndex(x=>x.id===expected.id);
   if(index<0||JSON.stringify(s.preparations[index])!==JSON.stringify(expected))throw Error('Saved preparation changed. Open the list again.');
   s.preparations.splice(index,1);if(!recoverable)s.recovery=s.recovery.filter(r=>!r.changes.some(c=>['preparations','results'].includes(c.collection)&&c.target===expected.id));return s;
  },valid,{recover:recoverable,label:'Removed preparation',merge:false}),
  complete:async({preparation,expected,snapshot,next,added,skipped,state,valid,destination})=>{
   let finished;
   const allowed=()=>valid()&&generation===state.generation&&editVersion===state.editVersion;
   const ok=await preparationWrite(s=>{
    const index=s.preparations.findIndex(x=>x.id===expected.id);
    if(index<0||JSON.stringify(s.preparations[index])!==JSON.stringify(expected))throw Error('Saved preparation changed. Review it again.');
    s.preparations[index]=validatePreparation(preparation);
    const applied=applyPreparationBatch(s,preparation,next,added,skipped,preparation.destination.kind==='saved');
    applied.store.recovery=recordChanges(applied.store.recovery,batchChanges(snapshot,next,preparation.destination.kind==='saved'?null:preparation.id),preparation.destination.kind==='saved'?'Added passages':'Added passages in a kept preparation result');
    finished=applied.preparation;return applied.store;
   },allowed,{recover:false});
   if(!ok)return null;
   if(preparation.destination.kind!=='saved')openVisit(next);
   else if(visit.id===next.id){visit=structuredClone(next);editVersion++;dirty=false;render();status();}
   return structuredClone(finished);
  },
  openResult:p=>{
   const latest=store.visits.find(v=>v.id===p.result?.id);
   if(!latest&&p.destination.kind==='saved'){notify('That saved visit is no longer available. Its preparation has not been replayed.');return;}
   const target=latest||p.result;if(!target)return;
   modal('Open the completed result?', 'This opens the result without adding passages again. It replaces your open visit draft. Cancel to back up unsaved visit work first.', [['Open completed visit',()=>{close();openVisit(target,Boolean(latest));}]]);
  }
 },
 commit:async({destination,state,snapshot,next,valid:reviewValid})=>{
  if(!reviewValid())return false;
  if(generation!==state.generation||editVersion!==state.editVersion)throw Error('The open visit changed. Return and review again.');
  if(destination==='new'||destination==='retained'){openVisit(next);temporaryRecovery=recordChanges([],batchChanges(snapshot,next),'Added passages');return true;}
  if(destination==='current'){
   if(JSON.stringify(visit)!==JSON.stringify(snapshot))throw Error('The open visit changed. Return and review again.');
   temporaryRecovery=recordChanges(temporaryRecovery,batchChanges(snapshot,next),'Added passages');visit=next;lastVisit=structuredClone(next);changed(true);render();return true;
  }
  await queue;
  const valid=()=>reviewValid()&&generation===state.generation&&editVersion===state.editVersion;
  const openDirty=dirty;
  const ok=await write(s=>{
   const index=s.visits.findIndex(v=>v.id===snapshot.id);
   if(index<0||JSON.stringify(s.visits[index])!==JSON.stringify(snapshot))throw Error('The saved visit changed. Return and review again.');
   s.visits[index]=next;s.recovery=recordChanges(s.recovery,batchChanges(snapshot,next),'Added passages');return s;
  },{valid,settled:()=>{},recover:false});
  if(ok&&destination==='current'){visit=structuredClone(next);lastVisit=structuredClone(next);editVersion++;dirty=false;render();status();}
  if(generation===state.generation&&editVersion===state.editVersion){dirty=openDirty;status();}
  return ok;
 }
});
const followup=createFollowup({modal,close,download,notify,
 context:()=>({visits:structuredClone(store.visits),drafts:structuredClone(store.followupDrafts),focus:structuredClone(store.focus),generation,editVersion,revision:store.revision,conflict,damaged}),
 saveDraft:(draft,expected,valid)=>preparationWrite(s=>saveFollowupDraft(s,draft,expected),valid,{recover:false}),
 deleteDraft:(expected,valid)=>preparationWrite(s=>deleteFollowupDraft(s,expected),valid,{recover:false}),
 restoreDraft:(draft,state,valid)=>preparationWrite(s=>{if(s.revision!==state.revision)throw Error('Saved notes changed after the restore preview. Review it again.');return planDraftRestore(s,draft).next;},valid,{recover:false}),
 saveProgress:async(ref,entry,expected,state,valid,savedDraft=null,workingDraft=null)=>{
  await queue;const allowed=()=>valid()&&state.generation===generation&&state.editVersion===editVersion;
  if(!allowed())return false;
  if(enabled&&visit.id===ref.visitId&&dirty){notify('Save or back up the open visit changes before recording follow-up.');return false;}
  const wasDirty=dirty;const ok=await write(s=>{if(workingDraft)return finishProgressDraft(s,workingDraft,savedDraft);s.visits=updateFollowup(s.visits,ref,entry,expected);return s;},{valid:allowed,settled:()=>{},label:'Follow-up recorded',merge:false});
  if(ok&&enabled&&visit.id===ref.visitId){visit=structuredClone(store.visits.find(v=>v.id===ref.visitId));lastVisit=structuredClone(visit);editVersion++;dirty=false;render();}
  else if(allowed())dirty=wasDirty;
  status();return ok;
 },
 setFocus:async(ref,state,valid)=>{
  await queue;const allowed=()=>valid()&&state.generation===generation&&state.editVersion===editVersion;
  const wasDirty=dirty,ok=await write(s=>{if(ref){const found=findWork(s.visits,ref);if(!unfinished(ref.kind,found.item))throw Error('Choose an unfinished item to focus on.');}s.focus=ref;return s;},{valid:allowed,settled:()=>{}});if(allowed())dirty=wasDirty;status();return ok;
 },
 openSource:ref=>{try{if(Object.hasOwn(ref,'localVisitId')&&ref.localVisitId===null)throw Error('The source visit is not available in this browser. Its recorded title and date remain with this copy.');const found=findWork(store.visits,{...ref,visitId:ref.localVisitId||ref.visitId});replacement(()=>{close();openVisit(found.visit,true);if(ref.kind==='question'){visit.current=ref.itemId;screen='during';}else screen='review';render();});}catch(e){notify(e.message);}},
 createVisit:(next,state,valid)=>{if(conflict||damaged||!valid()||state.generation!==generation||state.editVersion!==editVersion||state.revision!==store.revision){notify('Notes changed since the preview. Review the selected items again.');return false;}openVisit(next);return true;}
});
const transfer=createTransfer({modal,close,download,
 context:()=>{let displayRaw=null;try{displayRaw=localStorage.getItem(DISPLAY_KEY);}catch{}return {store:structuredClone(store),visit:structuredClone(visit),unsavedVisit:started&&(dirty||!enabled&&Boolean(visit.questions.length||visit.actions.length||visit.title||visit.date||visit.privateNotes||visit.requests.length)),preparation:intake.transferState(),display:currentDisplay(),displayRaw,generation,editVersion,conflict,damaged};},
 commit:async(plan,state,options,valid)=>{
  await queue;
  const allowed=()=>valid()&&state.generation===generation&&state.editVersion===editVersion&&state.preparation.version===intake.transferState().version;
  if(!allowed()||conflict||damaged)return false;
  if(plan.repeated&&!options.includeFocus)return store.revision===state.store.revision;
  const wasDirty=dirty,ok=await write(s=>applyTransferPlan(s,state.store,plan,options),{valid:allowed,recover:false,settled:()=>{}});
  if(generation===state.generation&&editVersion===state.editVersion)dirty=wasDirty;
  status();return ok;
 },
 applyDisplay:applyTransferredDisplay,
 clearHistory:async(state,valid)=>{
  await queue;const allowed=()=>valid()&&generation===state.generation&&editVersion===state.editVersion&&intake.transferState().version===state.preparation.version;
  const wasDirty=dirty,ok=await write(s=>{if(s.revision!==state.store.revision)throw Error('Saved notes changed. Review transfer again.');s.transfers=[];return s;},{valid:allowed,recover:false,settled:()=>{}});if(generation===state.generation&&editVersion===state.editVersion)dirty=wasDirty;status();return ok;
 },
 openVisit:id=>{const target=store.visits.find(v=>v.id===id);if(!target){notify('That transferred visit is no longer available.');return;}replacement(()=>{close();openVisit(target,true);});},
 resumePreparation:id=>intake.resumeSaved(id),
 openFollowupDraft:id=>{const draft=store.followupDrafts.find(d=>d.id===id);if(draft)followup.resumeSaved(draft);else notify('That saved follow-up draft is no longer available.');},
 openDraft:id=>{const p=store.preparations.find(p=>p.id===id);if(!p?.destination.snapshot){notify('That transferred draft is no longer available.');return;}replacement(()=>{close();openVisit(p.destination.snapshot);});}
});
async function preparationWrite(operation,valid=()=>true,options={}){
 await queue;
 const previousDirty=dirty,previousGeneration=generation,previousEdit=editVersion;
 const ok=await write(operation,{valid,settled:()=>{},...options});
 if(generation===previousGeneration&&editVersion===previousEdit){dirty=previousDirty;status();}
 return ok;
}
function promptQuestion(){const wrap=document.createElement('label');wrap.textContent='New question';const input=document.createElement('textarea');input.id='new-question';wrap.append(input);modal('Add a question',wrap,[['Add this question',()=>{if(!input.value.trim()){input.setCustomValidity('Write a question first.');input.reportValidity();return;}input.setCustomValidity('');addQuestion(input.value);close();render();}]]);input.focus();}
function afterReviewPreview(){const questions=new Set([...selected]),actions=new Set([...actionSelection]),notes=new Set([...noteSelection]);const text=reviewSummary(visit,{includeQuestions:questions,includeActions:actions,includeNotes:notes,includeRequests:new Set([...requestSelection])});modal('Review what happened and what comes next',pre(text),[['Download private review',()=>download('my-after-visit-review.txt',text,'text/plain;charset=utf-8')],['Copy private review',async()=>{try{await copyText(text);notify('Review copied. It was not sent or shared.');}catch{notify('Copy is unavailable. Download the private review instead.');}}]]);}
document.addEventListener('input',e=>{const t=e.target;if(t.dataset.visit){visit[t.dataset.visit]=t.value;changed();}if(t.dataset.q&&t.dataset.field!=='state'){visit.questions.find(q=>q.id===t.dataset.q)[t.dataset.field]=t.value;changed();}if(t.dataset.request!==undefined){visit.requests[Number(t.dataset.request)].text=t.value;requestSelection.clear();changed();}});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.q&&t.dataset.field==='state'){visit.questions.find(q=>q.id===t.dataset.q).state=t.value;changed();render();}if(t.dataset.visible!==undefined){visit.requests[+t.dataset.visible].visible=t.checked;changed();}for(const [key,set] of [['share',selected],['shareNote',noteSelection],['shareRequest',requestSelection],['shareAction',actionSelection]])if(t.dataset[key]!==undefined){const value=key==='shareRequest'?+t.dataset[key]:t.dataset[key];t.checked?set.add(value):set.delete(value);}if(t.id==='size'){size=+t.value;$('.big-question').style.setProperty('--question-size',`${size}px`);}});
document.addEventListener('click',async e=>{
 const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.screen){go(d.screen);return;}
 if(d.inspectSource){const item=visit[d.sourceKind==='question'?'questions':'actions'].find(i=>i.id===d.inspectSource);if(item?.origin)nextAppointment.inspect(item.origin);return;}
 if(d.action==='make-next-step'&&d.q){const q=visit.questions.find(x=>x.id===d.q);if(q){const a=nextStepDraft(q);visit.actions.push(a);changed();render();$(`[data-action-id="${a.id}"][data-action-field="text"]`)?.focus();notify('Editable next step added. Review and change its words, date or contact before saving.');}return;}
 if(d.carry){showCarry(store.visits.find(v=>v.id===d.carry));return;}
 if(d.removeAction){const a=visit.actions.find(a=>a.id===d.removeAction);modal('Remove this next step?',a.text,[['Remove next step',()=>{visit.actions=visit.actions.filter(x=>x.id!==a.id);actionSelection.delete(a.id);changed();close();render();}]]);return;}
 if(d.open){replacement(()=>openVisit(store.visits.find(v=>v.id===d.open),true));return;}
 if(d.move){const i=visit.questions.findIndex(q=>q.id===d.move),j=i+Number(d.dir);if(j>=0&&j<visit.questions.length){[visit.questions[i],visit.questions[j]]=[visit.questions[j],visit.questions[i]];visit.current=visit.questions[0]?.id||null;changed();render();}return;}
 if(d.remove){const q=visit.questions.find(q=>q.id===d.remove);modal('Remove this question?',q.text,[['Remove question',()=>{visit.questions=visit.questions.filter(x=>x.id!==q.id);if(visit.current===q.id)visit.current=visit.questions[0]?.id||null;changed();close();render();}]]);return;}
 if(d.removeRequest!==undefined){visit.requests.splice(+d.removeRequest,1);requestSelection.clear();changed();render();return;}
 if(d.jump){visit.current=d.jump;changed();render();return;}
 switch(d.action){
 case 'home':journey.showHome();break;
 case 'next-appointment':await queue;nextAppointment.open();break;
 case 'appointment-plan':nextAppointment.previewPlan();break;
 case 'after-review-summary':afterReviewPreview();break;
 case 'tools':journey.openTools();break;
 case 'resume-open':showWorkspace();render();$('#screen h2')?.focus();break;
 case 'resume-message':followup.resumeMessage();break;
 case 'resume-progress':followup.resumeProgress();break;
 case 'conversation':conversation.open();break;
 case 'bring-notes':intake.open();break;
 case 'saved-preparations':intake.savedPreparations();break;
 case 'start':case 'new':replacement(()=>openVisit(blank()));break;
 case 'open-saved':journey.reveal('saved');$('#visit-search').focus();break;
 case 'recovery':showRecovery();break;
 case 'fix-mistake':await queue;recoveryUI.open();break;
 case 'follow-up':await queue;followup.open();break;
 case 'saved-followup-drafts':await queue;followup.openSaved();break;
 case 'transfer':await queue;transfer.open();break;
 case 'example':replacement(()=>openVisit(example()));break;
 case 'add':addQuestion('');render();$('#screen article:last-of-type textarea')?.focus();break;
 case 'add-during':promptQuestion();break;
 case 'add-action':{const a=action('');visit.actions.push(a);changed();render();$(`[data-action-id="${a.id}"][data-action-field="text"]`)?.focus();break;}
 case 'save-preferences':choosePreferences(true);break;
 case 'use-preferences':choosePreferences(false);break;
 case 'clear-preferences':modal('Clear saved communication requests?','This removes reusable requests on this device, not requests already in visits.',[['Clear saved requests permanently',async()=>{const ok=await write(s=>{s.preferences=[];return s;},{settled:()=>{}});if(ok){close();notify('Saved communication requests cleared.');}}]]);break;
 case 'library-backup':try{if(damaged||conflict)throw Error('Reload or recover saved data first.');await queue;const text=libraryBackup(readStore(localStorage.getItem(KEY)));modal('Saved library includes private content','This file includes every saved visit, its private follow-up history and copied-source context, and saved communication requests. It does not include preparations, saved follow-up drafts, recovery history, removed copies, unsaved changes or an unsaved draft. Recover needed content first. Download private preparation backups separately. Download a full backup of the open visit separately if needed. Keep this library file private.',[['Download private library',()=>download('my-visit-library.json',text,'application/json')]]);}catch(error){notify(error.message);}break;
 case 'request':visit.requests.push({text:'',visible:true});changed();render();break;
 case 'templates':visit.requests.push(...['Please ask one question at a time.','Written answers help.','Please give me time.'].map(text=>({text,visible:true})));changed();render();break;
 case 'show-requests':modal('What helps me communicate',pre(visit.requests.filter(r=>r.visible&&r.text.trim()).map(r=>r.text).join('\n\n')||'No requests selected.'));break;
 case 'show-note':modal('My personal note — not confirmed by a clinician',pre(current()?.note||'No answer note yet.'));break;
 case 'previous':case 'next':{const i=visit.questions.indexOf(current());const q=visit.questions[i+(d.action==='next'?1:-1)];if(q){visit.current=q.id;changed();render();}break;}
 case 'save':modal('Save on this device?','This visit, including private notes, follow-up history and copied-source titles/dates, will stay in this browser until deleted or cleared by the browser. Changes will save automatically. Earlier wording and removed items may stay in Fix a mistake for up to 7 days, limited to the latest 100 changes. Available draft recovery records will also be saved. Anyone using this browser may see them. Erase recovery records there when no longer needed.',[['Save this visit',async()=>{close();enabled=true;dirty=true;await persist();status();}]]);break;
 case 'backup':{const text=backup(visit);modal('Full backup includes private notes','Keep this file for your own recovery. It includes all current questions, answer notes, private preparation notes, follow-up history and copied-source titles/dates. It does not include saved follow-up drafts, recovery history or removed copies. Keep separate private draft backups or use device transfer for saved drafts. Recover needed content before downloading.',[['Download private backup',()=>download('my-visit-backup.json',text,'application/json')]]);break;}
 case 'summary':{const text=summary(visit,selected,noteSelection,requestSelection,actionSelection);modal('This is the exact summary to share',pre(text),[['Download summary',()=>download('my-visit-summary.txt',text,'text/plain;charset=utf-8')],['Copy summary',async()=>{try{await copyText(text);notify('Summary copied.');}catch{notify('Copy is unavailable. Download the summary instead.');}}],['Print summary',()=>{printText(text).catch(()=>notify('Printing did not open. Export or copy the reviewed text instead.'));}]]);break;}
 case 'pause':if(enabled)await persist();modal('Visit paused',enabled&&!dirty&&!conflict?'Your saved visit keeps this question. Reopen it from Saved visits.':'This draft is not safely saved. Cancel to save it or download a full backup before closing.');break;
 case 'delete':case 'clear':{
  const all=d.action==='clear',targetId=visit.id,targetGeneration=generation;
  const remove=async recoverable=>{
   close();await queue;if(generation!==targetGeneration){notify('The open visit changed. Deletion was cancelled.');return;}
   const ok=await write(s=>{s.visits=all?[]:s.visits.filter(v=>v.id!==targetId);if(all)s.preferences=[];
    if(!recoverable)s.recovery=s.recovery.filter(r=>!r.changes.some(c=>c.collection==='visits'&&(all||c.target===targetId)));
    return s;
   },{valid:()=>generation===targetGeneration,recover:recoverable,label:'Removed visit',merge:false});if(ok)openVisit(blank());
  };
  modal(all?'Clear all saved visits?':'Delete this visit?',all?'This permanently removes every saved visit, its recovery history, saved communication requests, and the open visit draft. Saved preparations and their retained draft copies remain; delete them separately in Saved preparations. Saved follow-up drafts remain in their separate list and can contain earlier private words. Delete them separately if wanted. Temporary messages and progress drafts also remain in this page; discard them from their Home return controls if wanted. Downloaded files and the local restored-file record remain. Forget that record separately in Move to another device if wanted.':'Remove to recovery keeps the saved copy for up to 7 days (latest 100 changes). Delete permanently removes this visit and its recovery records now. Both discard the open visit draft. Temporary messages and progress drafts remain in this page; discard them separately from their Home return controls if wanted. Copies in saved preparations or downloaded files remain. Source titles/dates already copied into other visits remain too; manage those copies separately. The local restored-file record keeps identifiers, not wording, to prevent an old transfer recreating deleted notes. You can forget it separately in Move to another device.',[...(!all&&enabled?[['Remove to recovery',()=>remove(true)]]:[]),['Delete permanently',()=>remove(false)]]);break;
 }
 case 'reload':replacement(()=>{conflict=false;load();if(!damaged)openVisit(blank());});break;
 case 'repair':{let raw;try{raw=localStorage.getItem(KEY);}catch{notify('Storage cannot be read. Keep a backup of your current draft; try another browser.');break;}modal('Recover from damaged storage','First download the unreadable data if you want to keep it. It may contain private notes. Reset removes that saved collection, including preparations, saved follow-up drafts and completion records; the current open visit draft stays available.',[['Download unreadable data',()=>download('my-visit-damaged-data.txt',raw||'', 'text/plain')],['Reset damaged saved data',async()=>{if(!navigator.locks){notify('Safe reset is unavailable in this browser.');return;}try{await navigator.locks.request(KEY,()=>{if(localStorage.getItem(KEY)!==raw)throw Error('Saved data changed. Cancel and reload before trying again.');const empty={...emptyStore(),revision:Date.now()};localStorage.setItem(KEY,JSON.stringify(empty));store=empty;damaged=false;conflict=false;enabled=false;dirty=true;$('#repair').hidden=true;close();renderList();status();notify('Damaged saved data was cleared. Your open draft is temporary. Save it if needed.');});}catch(e){notify(e.message);}}]]);break;}
 }
});
$('#import').addEventListener('change',async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;try{if(file.size>10*1024*1024)throw Error('Backup exceeds the 10 MB import limit.');const v=restore(await file.text());modal('Restore this backup as a new draft?',`Visit: ${v.title||'Untitled visit'}. It may contain private notes. Existing saved visits will be preserved; the open draft will be replaced. Cancel to back up your draft first.`,[['Restore as new draft',()=>{close();v.id=uid();openVisit(v);notify('Restored as a temporary draft. Save if you want to keep it here.');}]]);}catch(error){notify(`Could not restore: ${error.message} Your current visit is unchanged.`);}});
$('#visit-search').addEventListener('input',renderList);
document.addEventListener('input',e=>{const t=e.target;if(t.dataset.actionId&&t.dataset.actionField!=='state'){visit.actions.find(a=>a.id===t.dataset.actionId)[t.dataset.actionField]=t.value;changed();}});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.actionId&&t.dataset.actionField==='state'){visit.actions.find(a=>a.id===t.dataset.actionId).state=t.value;changed();render();}});
$('#library-import').addEventListener('change',async e=>{
 const file=e.target.files[0];e.target.value='';if(!file)return;
 try{
  if(file.size>10*1024*1024)throw Error('Backup exceeds the 10 MB import limit.');
  const incoming=restoreLibrary(await file.text());await queue;
  if(damaged||conflict)throw Error('Reload or recover saved data before importing.');
  const latest=readStore(localStorage.getItem(KEY));if(latest.revision!==store.revision)throw Error('Saved data changed. Reload before importing.');
  const revision=store.revision,plan=planLibraryImport(store,incoming);
  const text=[...plan.rows.map(r=>`${r.result}: ${r.title||'Untitled visit'} ${r.date}`),`${plan.additions.length} visits to add; ${plan.rows.length-plan.additions.length} identical visits to skip.`,`${plan.preferences.length} new saved communication requests:`,...plan.preferences,'Existing visits and the open draft will not be replaced. This saves imported private content on this device.'].join('\n');
  modal('Review library import',pre(text),[['Import missing visits and requests',async()=>{
   if(store.revision!==revision){notify('Saved data changed since the preview. Cancel and select the file again.');return;}
   if(!plan.additions.length&&!plan.preferences.length){close();notify('Nothing new to import. Existing data was not changed.');return;}
   const ok=await write(s=>{if(s.revision!==revision)throw Error('Saved data changed since the preview.');s.visits.push(...plan.additions);s.preferences.push(...plan.preferences);return s;},{settled:()=>{}});
   if(ok){close();notify(`Imported ${plan.additions.length} visits and ${plan.preferences.length} communication requests. The open draft is unchanged.`);}
  }]]);
 }catch(error){notify(`Could not import library: ${error.message} Existing visits and the open draft are unchanged.`);}
});
window.addEventListener('storage',e=>{if(e.key===KEY||e.key===null){conflict=true;status();intake.refreshStatus();followup.refreshStatus();}});
window.addEventListener('beforeunload',e=>{if(followup.hasWork()||intake.hasWork()||dirty||(!enabled&&(visit.questions.length||visit.privateNotes||visit.title||visit.date||visit.requests.length||visit.actions.length))){e.preventDefault();e.returnValue='';}});
window.addEventListener('afterprint',()=>{$('#print-output').textContent='';});
const journey=createJourney({context:()=>({started,screen,visits:store.visits.length,preparations:store.preparations.length,drafts:store.followupDrafts.length,messageSaved:followup.messageSaved(),progressSaved:followup.progressSaved(),preparationWork:intake.hasWork(),messageWork:followup.hasMessage(),progressWork:followup.hasProgress(),unanswered:visit.questions.filter(q=>q.text.trim()&&unfinished('question',q)).length,nextSteps:visit.actions.filter(a=>a.text.trim()&&unfinished('action',a)).length,saveStatus:$('#status').textContent})});
load();render();journey.showHome();
if(!isNative()&&'serviceWorker' in navigator){navigator.serviceWorker.register('./sw.js').then(async reg=>{const watch=()=>{const w=reg.installing;$('#offline').textContent='Checking app files for offline use…';w?.addEventListener('statechange',()=>{if(w.state==='redundant')$('#offline').textContent='Offline update failed. Keep a backup and try again when connected.';if(w.state==='installed'&&navigator.serviceWorker.controller)$('#offline').textContent='An update is downloaded. Save your work and close all app tabs to use it. Your saved visits will stay here.';});};reg.addEventListener('updatefound',watch);if(reg.installing)watch();await navigator.serviceWorker.ready;$('#offline').textContent=reg.waiting?'An update is downloaded. Save your work and close all app tabs to use it.':'Offline app files are ready. Saved visits stay on this device.';}).catch(()=>{$('#offline').textContent='Offline setup unavailable. Keep this page open or return while connected.';});}else $('#offline').textContent='This browser cannot install the offline app. Keep this page open while using it.'; 
if(isNative())startNative({notify,conceal:()=>conversation.conceal(),back:()=>{const showing=$('#conversation');if(showing?.open){showing.dispatchEvent(new Event('cancel',{cancelable:true}));return;}if($('#dialog').open){close();return;}if(!$('#workspace').hidden){journey.showHome();return;}notify('You are on Home. Save unfinished work before closing the app.');}}).catch(()=>notify('Some phone controls could not start. Your notes are still available.'));
