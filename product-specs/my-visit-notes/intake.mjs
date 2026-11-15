import {blank} from './model.mjs';
import {SOURCE_LIMIT, sourceText, decodeSource, passage, planPassages, appendPassages} from './intake-model.mjs';
import {newPreparation, validatePreparation, preparationBackup, restorePreparation, completePreparation, PREPARATION_FILE_LIMIT} from './preparation-model.mjs';

const names = {question: 'Question', action: 'Personal next step', private: 'Private note'};
const node = (tag, text) => { const el = document.createElement(tag); if (text !== undefined) el.textContent = text; return el; };
const labeled = (text, control) => { const label = node('label', text); control.setAttribute('aria-label', text); label.append(control); return label; };

export function createIntake({modal, close, download, context, commit, notify, preparationAPI}) {
  let source = '', items = [], destination = 'new', version = 0, view = 0;
  let preparation = newPreparation(), savedCopy = null, fixedDestination = null, currentAnchor = null;
  function report(text) { notify(text); const message=node('p',text);message.setAttribute('role','alert');document.querySelector('#dialog-body')?.append(message); }
  document.querySelector('#dialog').addEventListener('close', () => { view++; });
  const working = () => validatePreparation({...preparation, source, items, destination: destinationRecord()});
  function destinationRecord() {
    if (fixedDestination) return structuredClone(fixedDestination);
    const state = context();
    if(destination==='current'&&currentAnchor&&state.visit.id!==currentAnchor.visitId)return structuredClone(currentAnchor);
    if (destination === 'new') return {kind:'new',visitId:null,snapshot:null};
    const target = destination === 'current' ? state.visit : state.saved.find(v=>'saved:'+v.id===destination);
    if (!target) throw Error('Choose an available destination before saving.');
    return {kind:destination==='current'&&!state.enabled?'draft':'saved',visitId:target.id,snapshot:target};
  }
  function hasWork() { try { return savedCopy ? context().conflict||JSON.stringify(working())!==JSON.stringify(savedCopy) : Boolean(source || items.length || preparation.name || preparation.completed.length); } catch { return true; } }
  function paintStatus() {
    const el=document.querySelector('#preparation-status');
    if(el) el.textContent=context().conflict?'Saved data changed in another tab. Keep a private preparation backup and reload before saving or confirming.':savedCopy?(hasWork()?'Changes to preparation are not saved. Save again before leaving.':'Preparation saved on this device. Later edits need another save.'):'Temporary preparation — not saved. Save or download a private preparation backup before leaving.';
  }
  function edited() { version++; paintStatus(); }
  function replacePreparation(p, saved=false) {
    currentAnchor=null;
    preparation=validatePreparation(p); source=preparation.source; items=structuredClone(preparation.items);
    fixedDestination=structuredClone(preparation.destination);
    destination=fixedDestination.kind==='new'?'new':fixedDestination.kind==='draft'?'retained':'saved:'+fixedDestination.visitId;
    savedCopy=saved?structuredClone(preparation):null; version++; open();
  }
  function replaceGuard(fn) {
    if(hasWork()) modal('Replace unfinished preparation?', 'Unsaved preparation will be replaced, not your open visit. Cancel to save or download a private preparation backup first.', [['Replace preparation',fn]]);
    else fn();
  }
  function backupPreparation() {
    try {
      const text=preparationBackup(working());
      modal('Private preparation backup includes source and draft copies','This unencrypted file includes current source text, edited choices, destination draft context and completed results, including any private follow-up history and copied-source titles/dates in those visits. It excludes recovery history and removed copies. Recover needed content first. Keep it privately. It is not a shareable visit summary.',[['Download preparation backup',()=>download('my-private-preparation.json',text,'application/json')],['Return to preparation',open]]);
    } catch(error) { report(error.message); }
  }
  function savePreparation() {
    try {
      const snapshot=working(), expected=savedCopy&&structuredClone(savedCopy), captured=version;
      let busy=false;
      modal('Save private preparation on this device?','This keeps source text, edited selections, destination draft copies and completed results in this browser, including any private follow-up history and copied-source titles/dates in those visits. Anyone using it may see them. It does not separately save your visit. Later edits need another explicit save.',[['Save preparation',async()=>{
        if(busy)return;busy=true;
        const saveView=view;
        try {
          const ok=await preparationAPI.save(snapshot,expected,()=>version===captured&&view===saveView);
          if(ok){savedCopy=structuredClone(snapshot);preparation=structuredClone(snapshot);fixedDestination=structuredClone(snapshot.destination);destination=snapshot.destination.kind==='new'?'new':snapshot.destination.kind==='draft'?'retained':'saved:'+snapshot.destination.visitId;open();}
          else report('Preparation was not saved. Keep a private preparation backup.');
        } catch(error){report(error.message);} finally{busy=false;}
      }],['Return to preparation',open]]);
    }catch(error){report(error.message);}
  }
  function savedPreparations() {
    view++;
    const box=node('div');box.append(node('p','Saved preparation is separate from saved visits. It can include private source text and draft copies. Opening it does not add passages again.'));
    const state=context();
    if(!state.preparations.length)box.append(node('p','No saved preparations yet.'));
    for(const p of state.preparations){
      const article=node('article'),button=node('button',`Resume ${p.name||'Untitled preparation'}`);
      button.onclick=()=>replaceGuard(()=>replacePreparation(p,true));
      const remove=node('button',`Delete preparation ${p.name||'Untitled preparation'}`);
      const deletePreparation=async recoverable=>{
        const deletionView=view;
        try{if(await preparationAPI.remove(p,()=>view===deletionView,recoverable)){if(preparation.id===p.id){preparation=newPreparation();source='';items=[];destination='new';fixedDestination=null;savedCopy=null;version++;}savedPreparations();}else report('Preparation was not deleted.');}catch(error){report(error.message);}
      };
      remove.onclick=()=>modal('Delete this saved preparation?', 'Remove to recovery keeps its saved source, selections and draft/result copies for up to 7 days (latest 100 changes). Delete saved preparation permanently removes those copies and their recovery records. Both clear current unsaved preparation edits. Separately saved visits and downloaded files remain. Minimal completion identifiers stay to prevent an old backup repeating an addition.',[['Remove preparation to recovery',()=>deletePreparation(true)],['Delete saved preparation',()=>deletePreparation(false)]]);
      article.append(button,node('p',`${p.items.length} pending passages · ${p.completed.length} completed batches`),remove);box.append(article);
    }
    const file=node('input');file.type='file';file.accept='.json,application/json';file.id='preparation-import';
    file.onchange=async()=>{
      const selected=file.files[0];file.value='';if(!selected)return;const importView=view;
      try{
        if(selected.size>PREPARATION_FILE_LIMIT)throw Error('Preparation backup exceeds the 10 MiB limit.');
        const restored=restorePreparation(await selected.text());
        if(view!==importView)return;
        modal('Open this private preparation backup?',`${restored.name||'Untitled preparation'}: ${restored.items.length} pending passages, ${restored.completed.length} completed batches. This replaces unfinished preparation after confirmation, not your open visit. It remains temporary until saved.`,[['Open preparation backup',()=>replaceGuard(()=>{restored.id=crypto.randomUUID();replacePreparation(restored,false);})]]);
      }catch(error){report('Could not restore preparation: '+error.message);}
    };
    box.append(labeled('Restore a private preparation backup',file));
    modal('Saved preparations',box,[['Return to preparation',open]]);
  }
  function open() {
    view++;
    if(destination==='current'&&currentAnchor&&context().visit.id!==currentAnchor.visitId){fixedDestination=structuredClone(currentAnchor);destination=fixedDestination.kind==='saved'?'saved:'+fixedDestination.visitId:'retained';}
    const box = node('div');
    box.append(node('p', 'Paste notes or open a UTF-8 .txt file (up to 1 MiB). Preparation stays only in this page unless you choose to save it. It is not included in visit backups. Nothing is uploaded. Saved preparation has its own private backup.'));
    const status=node('p');status.id='preparation-status';status.setAttribute('role','status');box.append(status);
    const name=node('input');name.value=preparation.name;name.oninput=()=>{preparation.name=name.value;edited();};box.append(labeled('Preparation name (optional)',name));
    if(preparation.completed.length)box.append(node('p',`${preparation.completed.length} batches already added. ${items.length} passages are still pending. Completed batches will not be added again.`));
    if(preparation.result){const result=node('button','Open last completed result');result.onclick=()=>preparationAPI.openResult(preparation);box.append(result);}
    const replay=context().receipts.find(r=>r.batchId===preparation.batchId);
    if(replay){
      box.append(node('p','This pending batch was already added on this device. It cannot be added again. Open its recorded result or clear these pending choices.'));
      const original=context().preparations.find(p=>p.id===replay.preparationId),savedVisit=context().saved.find(v=>v.id===replay.visitId);
      if(original?.result?.id===replay.visitId||savedVisit){const button=node('button','Open previously recorded result');button.onclick=()=>preparationAPI.openResult(savedVisit?{result:savedVisit,destination:{kind:'saved'}}:original);box.append(button);}
      else box.append(node('p','The recorded result is no longer available here. No visit has been recreated.'));
    }
    const message = node('p'); message.setAttribute('role', 'status');
    const input = node('textarea'); input.value = source; input.rows = 9; input.id = 'intake-source';
    input.addEventListener('input', () => { source = input.value; edited(); });
    const file = node('input'); file.type = 'file'; file.accept = '.txt,text/plain';
    file.addEventListener('change', async () => {
      const chosen = file.files[0]; file.value = ''; if (!chosen) return;
      const requested = version;
      try {
        if (chosen.size > SOURCE_LIMIT) throw Error('File exceeds the 1 MiB limit.');
        const text = decodeSource(await chosen.arrayBuffer(), chosen.name);
        if (requested !== version) throw Error('Your source changed while the file opened. Choose the file again.');
        const apply = () => { source = text; edited(); open(); };
        if (source) modal('Replace source text?', 'Already chosen passages will stay. Download the old source first if you need it.', [['Keep old source and return', open], ['Download old source', () => download('private-source-notes.txt', source, 'text/plain;charset=utf-8')], ['Replace source text', apply]]);
        else apply();
      } catch (error) { message.textContent = error.message; }
    });
    box.append(labeled('Open a plain-text file', file), labeled('Source notes — temporary and private', input));
    box.append(node('p', 'Select a passage with your pointer or keyboard (Shift + arrow keys), then choose what to make. Or choose Select all source text. Wording is kept; line endings become newlines.'));
    const all = node('button', 'Select all source text'); all.onclick = () => { input.focus(); input.select(); }; box.append(all);
    for (const [kind, label] of [['question', 'Make this a question'], ['action', 'Make this a next step'], ['private', 'Keep as a private note']]) {
      const button = node('button', label); button.onclick = () => {
        try { items.push(passage(source, input.selectionStart, input.selectionEnd, kind)); edited(); renderItems(); message.textContent = 'Passage chosen. The source is unchanged. You can select another passage.'; }
        catch (error) { message.textContent = error.message; }
      }; box.append(button);
    }
    box.append(message, node('h3', 'Chosen passages'));
    const list = node('div'); box.append(list);
    function renderItems() {
      list.replaceChildren();
      if (!items.length) list.append(node('p', 'No passages chosen yet.'));
      items.forEach((item, i) => {
        const article = node('article'); const text = node('textarea'); text.value = item.text;
        text.oninput = () => { item.text = text.value; edited(); };
        const kind = node('select');
        for (const [value, label] of Object.entries(names)) { const option = node('option', label); option.value = value; kind.append(option); }
        kind.value = item.kind; kind.onchange = () => { item.kind = kind.value; edited(); };
        const remove = node('button', `Remove passage ${i + 1}`); remove.onclick = () => { items = items.filter(x => x.id !== item.id); edited(); renderItems(); };
        article.append(labeled(`Passage ${i + 1}`, text), labeled(`Use passage ${i + 1} as`, kind), remove); list.append(article);
      });
    }
    renderItems();
    const target = node('select'); target.id = 'intake-destination';
    const state = context();
    const options = [{id: 'new', title: 'A new temporary visit'}, ...(state.started ? [{id: 'current', title: `Open visit: ${state.visit.title || 'Untitled visit'}`}] : []), ...state.saved.map(v => ({id: `saved:${v.id}`, title: `Saved visit: ${v.title || 'Untitled visit'} ${v.date}`}))];
    if(destination==='retained')options.push({id:'retained',title:'Draft kept with this preparation'});
    if(fixedDestination?.kind==='saved'&&!state.saved.some(v=>v.id===fixedDestination.visitId))options.push({id:destination,title:'Previous destination is missing — choose another'});
    for (const entry of options) { const option = node('option', entry.title); option.value = entry.id; target.append(option); }
    if (!options.some(o => o.id === destination)) destination = 'new';
    target.value = destination; target.onchange = () => { destination = target.value; fixedDestination=null;currentAnchor=null;if(destination==='current')currentAnchor=destinationRecord();edited(); };
    box.append(labeled('Add chosen passages to', target));
    box.append(node('p','Check this destination before continuing. Opening another visit does not move these passages to it. Review will show the destination again before anything is added.'));
    modal('Bring existing notes', box, [
      ['Review chosen passages', () => { try { review(); } catch (error) { message.textContent = error.message; } }],
      ['Save this preparation on this device',savePreparation],
      ['Saved preparations',savedPreparations],
      ['Download private preparation backup',backupPreparation],
      ['Start another preparation',()=>replaceGuard(()=>replacePreparation(newPreparation(),false))],
      ['Download private source text', () => download('private-source-notes.txt', source, 'text/plain;charset=utf-8')],
      ['Clear this working area', () => modal('Clear source and chosen passages?', 'This clears source and pending choices in this page, not saved preparations or visits. Save again to keep the cleared state. Download anything you need first.', [['Return to notes', open], ['Clear temporary notes', () => { source = ''; items = []; preparation.batchId=crypto.randomUUID(); edited(); open(); }]])]
    ]);
    paintStatus();
  }

  function review() {
    const reviewView = ++view;
    sourceText(source);
    if (!items.length) throw Error('Choose at least one passage first.');
    const state = context();
    if(state.receipts.some(r=>r.batchId===preparation.batchId))throw Error('This batch was already added. Do not add it again.');
    const target = destination === 'new' ? blank() : destination === 'retained' ? fixedDestination.snapshot : destination === 'current' ? state.visit : state.saved.find(v => `saved:${v.id}` === destination);
    if (!target) throw Error('That saved visit is no longer available. Choose another destination.');
    const snapshot = structuredClone(target), selections = structuredClone(items), chosenVersion = version, keep = new Set();
    const box = node('div');
    if(fixedDestination?.kind==='saved'&&JSON.stringify(fixedDestination.snapshot)!==JSON.stringify(target))box.append(node('p','The saved destination changed since this preparation was kept. This is a fresh review against its latest content. Confirm only after checking the additions below.'));
    box.append(node('p', `Destination: ${destination === 'new' ? 'new temporary visit' : snapshot.title || 'Untitled visit'}. Only included passages below will be added. Existing content stays unchanged.`));
    box.append(node('p', 'Matching ignores whitespace differences, not meaning. Matches are skipped unless you choose to add them anyway. Private-note matches may be passages within a longer note.'));
    const list = node('div'); box.append(list);
    function draw() {
      list.replaceChildren();
      const plan = planPassages(snapshot, selections, keep);
      plan.rows.forEach((row, i) => {
        const article = node('article'); article.append(node('h3', `${i + 1}. ${names[row.kind]} — ${row.include ? 'Add' : 'Skip'}`), node('pre', row.text));
        if (row.duplicate) {
          article.append(node('p', row.reason)); const check = node('input'); check.type = 'checkbox'; check.checked = keep.has(row.id);
          check.onchange = () => { check.checked ? keep.add(row.id) : keep.delete(row.id); draw(); };
          article.append(labeled(`Add matching passage ${i + 1} anyway`, check));
        }
        list.append(article);
      });
    }
    draw();
    const warning = destination === 'new'
      ? 'Creating this draft replaces the open draft. Unsaved work will be lost. Cancel to back it up first. The new visit stays temporary until you save it.'
      : destination === 'retained'
        ? 'This adds to the draft kept with preparation and opens the result. It replaces your open visit draft. Cancel to back up that draft first. It does not separately save a visit.'
      : destination === 'current'
        ? (state.enabled ? 'This adds to the open visit and attempts to save automatically. If saving fails, keep a full backup of the open visit.' : 'This adds to your temporary open visit. Save it or download a full backup afterward.')
        : 'This saves additions directly to the selected visit on this device, including chosen private notes. Anyone using this browser may see it. Your open draft stays unchanged.';
    box.append(node('p', warning), node('p', 'Questions start Open, without answers. Next steps start To do, without dates or contacts. Private notes never enter shared summaries. Source stays separate from the visit. Saved preparation keeps its source until you save a cleared state or delete that preparation.'));
    if(savedCopy)box.append(node('p','Confirmation also saves your current preparation edits and completion record. A temporary visit result is kept inside preparation, not separately saved as a visit.'));
    if(destination==='retained')box.append(node('p','This opens the kept draft after adding passages and replaces the open visit draft. Cancel to back up open work first.'));
    const message = node('p'); message.setAttribute('role', 'status'); box.append(message);
    let busy = false;
    modal('Review exact additions', box, [['Return to source and selections', open], ['Confirm additions', async () => {
      if (busy) return;
      try {
        if (version !== chosenVersion) throw Error('Your selections changed. Return and review again.');
        if(context().conflict)throw Error('Saved data changed in another tab. Keep a private preparation backup and reload before confirming.');
        const result = appendPassages(snapshot, selections, keep);
        if (!result.additions.length) throw Error('Nothing new is selected to add. Return or explicitly keep a matching passage.');
        busy = true;
        const valid = () => version === chosenVersion && view === reviewView;
        let finished=null;
        const currentPreparation=working();
        currentPreparation.destination=destination==='new'?{kind:'new',visitId:null,snapshot:null}:{kind:destination==='retained'||destination==='current'&&!state.enabled?'draft':'saved',visitId:snapshot.id,snapshot};
        const ok = savedCopy ? Boolean(finished=await preparationAPI.complete({preparation:currentPreparation,expected:savedCopy,snapshot,next:result.visit,added:result.additions.length,skipped:selections.length-result.additions.length,state,valid,destination})) : await commit({destination, state, snapshot, next: result.visit, valid});
        if (!ok) { message.textContent = 'Additions were not made. Your source and selections are still here. Resolve the save problem and review again.'; return; }
        if(finished){preparation=finished;savedCopy=structuredClone(finished);fixedDestination=structuredClone(finished.destination);destination=finished.destination.kind==='saved'?'saved:'+finished.destination.visitId:'retained';}
        else{preparation=completePreparation(currentPreparation,result.visit,result.additions.length,selections.length-result.additions.length);}
        items = []; version++; close(); notify(finished?'Chosen passages and completion saved. Preparation still keeps the source; delete preparation separately when finished. Unselected source was not added to the visit.':'Chosen passages added. Source and completion remain temporary in Bring existing notes. Save preparation or keep a backup before closing. Unselected source was not added to the visit.');
      } catch (error) { message.textContent = error.message; }
      finally { busy = false; }
    }]]);
  }
  return {open, hasWork, savedPreparations, refreshStatus:paintStatus,
    pinOpenDestination:()=>{if(destination==='current'&&(!currentAnchor||currentAnchor.visitId===context().visit.id))currentAnchor=destinationRecord();},
    transferState:()=>{const unsaved=hasWork();try{return {version,unsaved,preparation:unsaved?working():null,error:null};}catch(e){return {version,unsaved:true,preparation:null,error:e.message};}},
    resumeSaved:id=>{const p=context().preparations.find(p=>p.id===id);if(!p){report('That saved preparation is no longer available.');return;}replaceGuard(()=>replacePreparation(p,true));}
  };
}
