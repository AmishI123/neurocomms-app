// Recovery records are private. Store only bounded changes, never shared output.
import {uid, validateVisit, blank, STATES, ACTION_STATES} from './model.mjs';
import {validatePreparation} from './preparation-model.mjs';
import {validateHistory,validateOrigin} from './followup-record.mjs';

export const RECOVERY_DAYS = 7;
export const RECOVERY_LIMIT = 100;
const AGE = RECOVERY_DAYS * 86400000;
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);
const copy = x => structuredClone(x);

export function activeRecovery(records, now=Date.now()) {
  return records.filter(r=>r.at + AGE > now).slice(-RECOVERY_LIMIT);
}

export function validateRecovery(records) {
  if (!Array.isArray(records) || records.length>RECOVERY_LIMIT) throw Error('Recovery records are invalid.');
  const ids=new Set();
  return records.map(r=>{
    if (!r || typeof r.id!=='string' || !r.id || ids.has(r.id) || !Number.isSafeInteger(r.at) || r.at<0 || typeof r.label!=='string' || !Array.isArray(r.changes) || !r.changes.length) throw Error('A recovery record is invalid.');
    ids.add(r.id);
    const changes=r.changes.map(c=>{
      c=copy(c);
      if (!c || !['visits','preparations','results'].includes(c.collection) || typeof c.target!=='string' || !c.target || !Array.isArray(c.path) || c.path.some(p=>typeof p!=='string') || !Object.hasOwn(c,'before') || !Object.hasOwn(c,'after')) throw Error('A recovery change is invalid.');
      if(c.collection==='results'&&!c.path.length)throw Error('Result recovery needs an individual field or item.');
      if (c.collection==='preparations' && c.path.length) throw Error('Preparation recovery path is invalid.');
      if (c.path.length && !(c.path.length===1 && ['title','date','privateNotes','requests'].includes(c.path[0])) && !(c.path.length===2 && ['questions','actions'].includes(c.path[0]) && c.path[1]) && !(c.path.length===3 && ['questions','actions'].includes(c.path[0]) && c.path[1] && (c.path[0]==='questions'?['text','note','state','history','origin']:['text','date','contact','state','history','origin']).includes(c.path[2]))) throw Error('Recovery field is invalid.');
      if (!c.path.length) for(const key of ['before','after']) if(c[key]!==null){const clean=c.collection==='visits'?validateVisit(c[key]):validatePreparation(c[key]);if(clean.id!==c.target)throw Error('Recovery target does not match.');c[key]=clean;}
      if(c.path.length)for(const key of ['before','after']){const v=c[key];
        if(c.path.length===2){if(v!==null){const sample=blank();if(v.history===undefined)sample.version=2;sample[c.path[0]]=[v];if(c.path[0]==='questions')sample.current=v.id;c[key]=validateVisit(sample)[c.path[0]][0];if(v.id!==c.path[1])throw Error('Recovery item identifier is invalid.');}}
        else if(c.path[0]==='requests'){const sample=blank();sample.requests=v;validateVisit(sample);}
        else if(c.path[2]==='history')c[key]=validateHistory(v);
        else if(c.path[2]==='origin')c[key]=validateOrigin(v);
        else if(typeof v!=='string'||(c.path[2]==='state'&&!(c.path[0]==='questions'?STATES:ACTION_STATES).includes(v)))throw Error('Recovery wording or state is invalid.');
      }
      if(c.append!==undefined && (c.path.length!==1||c.path[0]!=='privateNotes'||typeof c.append!=='string'||!c.append||c.after!==c.before+c.append))throw Error('Recovery addition is invalid.');
      if(c.index!==undefined&&(!Number.isInteger(c.index)||c.index< -1))throw Error('Recovery position is invalid.');
      return copy(c);
    });
    return {id:r.id,at:r.at,label:r.label,changes};
  });
}

function change(collection,target,path,before,after) {return {collection,target,path,before:copy(before),after:copy(after)};}
export function visitChanges(before,after) {
  const target=(before||after).id;
  if(!before||!after)return [change('visits',target,[],before||null,after||null)];
  const result=[];
  for(const field of ['title','date','privateNotes','requests']) if(!same(before[field],after[field])) result.push(change('visits',target,[field],before[field],after[field]));
  for(const group of ['questions','actions']) {
    const old=new Map(before[group].map(x=>[x.id,x])),next=new Map(after[group].map(x=>[x.id,x]));
    for(const id of new Set([...old.keys(),...next.keys()])) {
      const a=old.get(id),b=next.get(id);
      if(!a||!b){result.push({...change('visits',target,[group,id],a||null,b||null),index:before[group].findIndex(x=>x.id===id)});continue;}
      for(const field of Object.keys(a).filter(k=>k!=='id'))if(!same(a[field],b[field]))result.push(change('visits',target,[group,id,field],a[field],b[field]));
    }
  }
  return result;
}

export function batchChanges(before,after,preparationId=null){
  const changes=visitChanges(before,after);
  for(const c of changes){
    if(c.path.length===1&&c.path[0]==='privateNotes'&&c.after.startsWith(c.before))c.append=c.after.slice(c.before.length);
    if(preparationId){c.collection='results';c.target=preparationId;}
  }
  return changes;
}

export function recordChanges(records,changes,label,now=Date.now(),merge=false) {
  const next=activeRecovery(records,now);
  if(!changes.length)return next;
  const last=next.at(-1);
  // Merge consecutive typing in one field only; never combine removals or batches.
  if(merge && changes.length===1 && last?.changes.length===1 && now-last.at<60000){
    const a=last.changes[0],b=changes[0];
    if(!a.append && !b.append && b.path.length && b.before!==null && b.after!==null && a.collection===b.collection && a.target===b.target && same(a.path,b.path) && same(a.after,b.before)){
      const merged=copy(last);merged.changes[0].after=copy(b.after);merged.at=now;
      return [...next.slice(0,-1),merged];
    }
  }
  return [...next,{id:uid(),at:now,label,changes:copy(changes)}].slice(-RECOVERY_LIMIT);
}

export function captureRecovery(before,after,{label='Visit change',now=Date.now(),merge=true}={}) {
  let records=activeRecovery(after.recovery||[],now),changes=[];
  for(const old of before.visits){const next=after.visits.find(v=>v.id===old.id);changes.push(...visitChanges(old,next));}
  for(const old of before.preparations)if(!after.preparations.some(p=>p.id===old.id))changes.push(change('preparations',old.id,[],old,null));
  return recordChanges(records,changes,label,now,merge);
}

export function currentValue(store,c) {
  const target=c.collection==='results'?store.preparations.find(p=>p.id===c.target)?.result:store[c.collection].find(v=>v.id===c.target);
  if(!c.path.length)return target||null;
  if(!target)throw Error('Recover the removed visit first.');
  if(c.path.length===1)return target[c.path[0]];
  const item=target[c.path[0]].find(x=>x.id===c.path[1]);
  if(c.path.length===2)return item||null;
  if(!item)throw Error('Recover the removed item first.');
  return item[c.path[2]];
}

export function recoveryPreview(store,record,indices) {
  return indices.map(i=>{
    const c=record.changes[i];if(!c)throw Error('Choose a valid recovery item.');
    const current=currentValue(store,c);
    let restore=copy(c.before);
    if(c.append){
      const at=current.indexOf(c.append);
      if(at<0||current.indexOf(c.append,at+1)>=0)throw Error('The added private wording was edited or appears more than once. Recover other items separately; edit the private note directly to keep your newer wording.');
      restore=current.slice(0,at)+current.slice(at+c.append.length);
    }
    return {index:i,current:copy(current),restore,changedSince:!same(current,c.after)};
  });
}

export function applyRecovery(store,recordId,preview,now=Date.now()) {
  const next=copy(store),record=activeRecovery(next.recovery,now).find(r=>r.id===recordId);
  if(!record)throw Error('This recovery record has expired or was erased.');
  if(!preview.length || new Set(preview.map(p=>p.index)).size!==preview.length)throw Error('Choose an item to recover.');
  for(const p of preview){
    const c=record.changes[p.index];if(!c || !same(currentValue(next,c),p.current) || !same(recoveryPreview(next,record,[p.index])[0].restore,p.restore))throw Error('This item changed after the preview. Review it again.');
    const list=c.collection==='results'?next.preparations:next[c.collection],index=list.findIndex(v=>v.id===c.target);
    if(!c.path.length){
      if(c.before!==null && index>=0)throw Error('A copy with this identifier already exists. Keep it and erase the old recovery record if no longer needed.');
      if(c.before===null){if(index>=0)list.splice(index,1);}else list.push(copy(c.before));
    }else{
      const target=c.collection==='results'?list[index].result:list[index];
      if(c.path.length===1)target[c.path[0]]=copy(p.restore);
      else {
        const items=target[c.path[0]],at=items.findIndex(x=>x.id===c.path[1]);
        if(c.path.length===3)items[at][c.path[2]]=copy(c.before);
        else if(c.before===null){if(at>=0)items.splice(at,1);}
        else if(at>=0)throw Error('This item already exists. Recover its wording separately.');
        else items.splice(Math.max(0,Math.min(c.index??items.length,items.length)),0,copy(c.before));
      }
      if(!target.questions.some(q=>q.id===target.current))target.current=target.questions[0]?.id||null;
      if(c.collection==='results'&&list[index].destination.kind==='draft'&&list[index].destination.visitId===target.id)list[index].destination.snapshot=copy(target);
    }
  }
  next.visits=next.visits.map(validateVisit);next.preparations=next.preparations.map(validatePreparation);
  record.changes=record.changes.filter((c,i)=>!preview.some(p=>p.index===i));
  next.recovery=next.recovery.filter(r=>r.changes.length);
  return next;
}
