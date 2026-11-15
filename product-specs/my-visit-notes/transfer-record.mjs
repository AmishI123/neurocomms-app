import {validateRef} from './followup-record.mjs';
const ids=value=>{
 if(!Array.isArray(value)||value.some(x=>typeof x!=='string'||!x)||new Set(value).size!==value.length)throw Error('A transfer record contains invalid identifiers.');
 return [...value];
};
export function validateTransfers(value){
 if(!Array.isArray(value))throw Error('Transfer records are invalid.');
 const seen=new Set();
 return value.map(r=>{
  if(!r||typeof r.id!=='string'||!/^[a-f0-9]{64}$/.test(r.id)||seen.has(r.id)||!Number.isSafeInteger(r.at)||r.at<0)throw Error('A transfer record is invalid.');
  seen.add(r.id);
  return {id:r.id,at:r.at,visits:ids(r.visits),preparations:ids(r.preparations),drafts:ids(r.drafts),focus:r.focus===null?null:validateRef(r.focus),...(Object.hasOwn(r,'followupDrafts')?{followupDrafts:ids(r.followupDrafts)}:{})};
 });
}
