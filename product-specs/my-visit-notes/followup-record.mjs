export const FOLLOWUP_STATES=['To do','Contacted','Waiting for reply','Done','No longer needed'];
export const HISTORY_LIMIT=50;
const identifier=x=>typeof x==='string'&&x.length>0;
const text=x=>typeof x==='string';
export function validateRef(value){
 if(!value||!identifier(value.visitId)||!identifier(value.itemId)||!['question','action'].includes(value.kind))throw Error('The follow-up item reference is invalid.');
 return {visitId:value.visitId,kind:value.kind,itemId:value.itemId};
}
export function validateOrigin(value){
 if(value===null)return null;
 const ref=validateRef(value);
 if(!text(value.title)||!text(value.date))throw Error('Copied-item source information is invalid.');
 if(Object.hasOwn(value,'localVisitId')&&value.localVisitId!==null&&!identifier(value.localVisitId))throw Error('The local source link is invalid.');
 return {...ref,title:value.title,date:value.date,...(Object.hasOwn(value,'localVisitId')?{localVisitId:value.localVisitId}:{})};
}
export function validateHistory(items){
 if(!Array.isArray(items)||items.length>HISTORY_LIMIT)throw Error('Follow-up history is invalid.');
 const ids=new Set();
 return items.map(e=>{
  if(!e||!identifier(e.id)||ids.has(e.id)||!FOLLOWUP_STATES.includes(e.status)||!text(e.date)||!text(e.note)||e.note.length>5000||!Number.isSafeInteger(e.at)||e.at<0)throw Error('A follow-up history entry is invalid.');
  if(e.date&&(!/^\d{4}-\d{2}-\d{2}$/.test(e.date)||!Number.isFinite(Date.parse(e.date))||new Date(e.date).toISOString().slice(0,10)!==e.date))throw Error('Choose a valid follow-up date or leave it blank.');
  ids.add(e.id);return {id:e.id,status:e.status,date:e.date,note:e.note,at:e.at};
 });
}
