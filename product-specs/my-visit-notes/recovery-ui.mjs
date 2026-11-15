import {activeRecovery,recoveryPreview} from './recovery-model.mjs';
const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
const value=x=>x===null?'Not present':typeof x==='string'?x:JSON.stringify(x,null,2);
const name=c=>!c.path.length?(c.collection==='visits'?'Whole visit':'Whole preparation'):c.path.length===1?({privateNotes:'Private preparation notes',title:'Visit title',date:'Visit date',requests:'Communication requests'}[c.path[0]]):`${c.path[0]==='questions'?'Question':'Next step'}${c.path[2]?` — ${c.path[2]==='text'?'wording':c.path[2]}`:''}`;

export function createRecoveryUI({modal,context,restore,erase,notify}) {
 let view=0;
 document.querySelector('#dialog').addEventListener('close',()=>{view++;});
 function open(){
  const token=++view,state=context(),box=node('div');
  box.append(node('p','Private recovery records stay here for up to 7 days, limited to the latest 100 changes. Expired records are removed from storage on the next successful write. This app cannot erase downloaded files or copies kept elsewhere.'));
  box.append(node('p',state.temporary?'This open draft and its recovery records are temporary. Save the visit before closing to keep them.':'Saved visit edits and recoverable removals stay on this device. Anyone using this browser may see earlier wording here.'));
  box.append(node('p','Visit and preparation backups do not include recovery history. Recover what you need before downloading a backup.'));
  const records=activeRecovery(state.store.recovery).slice().reverse();
  if(!records.length)box.append(node('p','No recovery records available.'));
  for(const r of records){
   const article=node('article');article.append(node('h3',r.label),node('p',`${new Date(r.at).toLocaleString()} · ${r.changes.length} item(s)`));
   const preview=node('button','Review this change');preview.onclick=()=>choose(r,token);
   const remove=node('button','Erase this recovery record');remove.onclick=()=>modal('Erase this recovery record permanently?','This removes only the recovery copy, not current notes. This cannot be undone.',[['Erase recovery record',async()=>{if(await erase([r.id],state,()=>view===token))open();}]]);
   article.append(preview,remove);box.append(article);
  }
  modal('Fix a mistake',box,records.length?[['Erase all recovery records',()=>modal('Erase all recovery records permanently?','Current visits and preparations stay. Earlier wording and removed copies in this recovery area will no longer be available. Downloaded files are not erased.',[['Erase all recovery records now',async()=>{if(await erase(records.map(r=>r.id),state,()=>view===token))open();}]])]]:[]);
 }
 function choose(record,token){
  const box=node('div'),checks=[];box.append(node('p','Choose only the items you want to change. You will see current and earlier content before confirming.'));
  for(const [i,c] of record.changes.entries()){
   const label=node('label'),input=node('input');input.type='checkbox';input.value=String(i);checks.push(input);label.append(input,document.createTextNode(`${name(c)} — ${c.before===null?'remove an addition':c.after===null?'recover removed content':'restore earlier content'}`));box.append(label);
  }
  modal('Choose what to recover',box,[['Preview selected recovery',()=>{
   try{
    const state=context(),indices=checks.flatMap((c,i)=>c.checked?[i]:[]);if(!indices.length)throw Error('Choose at least one item.');
    const preview=recoveryPreview(state.store,record,indices),content=node('div');
    if(indices.some(i=>record.changes[i].collection==='results'))content.append(node('p','This changes the result kept inside a saved preparation, not a separately saved visit or your open draft. Reopen the completed result from Saved preparations to use the recovered copy.'));
    for(const p of preview){content.append(node('h3',name(record.changes[p.index])));if(p.changedSince)content.append(node('p','Changed since this record: the current content below includes later edits. Confirming will replace or remove this content.'));
     content.append(node('h4','Current content'),node('pre',value(p.current)),node('h4','After recovery'),node('pre',value(p.restore)));
    }
    content.append(node('p','Only the selected items will change. Nothing will be selected for sharing.'));
    modal('Review the recovery',content,[['Confirm selected recovery',async()=>{if(await restore(record.id,preview,state,()=>view===token)){notify('Selected recovery completed. Nothing was shared.');open();}}]]);
   }catch(e){notify(e.message);}
  }],['Return to recovery records',open]]);
 }
 return {open};
}
