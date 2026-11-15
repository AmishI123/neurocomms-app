import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const allowedTasks=new Set(['Pass','Fail','Not run']);
const surfaces=new Set(['web','android','ios']);
const dataResults=new Set(['saved','restored','missing','duplicated','unclear','not-recorded']);
const privacyResults=new Set(['private-hidden','privacy-leak','unclear','not-recorded']);
const severities=new Set(['S0','S1','S2','S3']);
const actions=new Set(['fix','rerun','monitor','close','record-result']);
const forbiddenKeys=new Set(['note','notes','privateNote','privateNotes','rawText','sourceText','answer','answers','medicalText','contactDetails']);

export function validate(record){
  const errors=[];
  if(!record||typeof record!=='object'||Array.isArray(record))return ['record must be an object'];
  const visit=(value,path='record')=>{
    if(!value||typeof value!=='object')return;
    for(const [key,child] of Object.entries(value)){
      if(forbiddenKeys.has(key))errors.push(`${path}.${key} is not allowed`);
      visit(child,`${path}.${key}`);
    }
  };
  visit(record);
  if(!/^BETA-[A-Z0-9-]+$/.test(record.caseId||''))errors.push('caseId must start with BETA- and contain no personal identity');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(record.runDate||''))errors.push('runDate must use YYYY-MM-DD');
  if(!surfaces.has(record.surface))errors.push('surface must be web, android or ios');
  if(typeof record.buildHash!=='string'||!record.buildHash.trim())errors.push('buildHash is required');
  if(typeof record.device!=='string'||!record.device.trim())errors.push('device is required');
  if(!record.tasks||typeof record.tasks!=='object'||Array.isArray(record.tasks))errors.push('tasks must be an object');
  else for(let i=1;i<=11;i++)if(!allowedTasks.has(record.tasks[String(i)]))errors.push(`tasks.${i} must be Pass, Fail or Not run`);
  if(!dataResults.has(record.dataResult))errors.push('invalid dataResult');
  if(!privacyResults.has(record.privacyResult))errors.push('invalid privacyResult');
  if(!Array.isArray(record.evidencePaths)||record.evidencePaths.some(path=>typeof path!=='string'||!path||path.startsWith('/')||path.includes('..')))errors.push('evidencePaths must be safe relative paths');
  if(!severities.has(record.severity))errors.push('invalid severity');
  if(record.failureCode!==null&&typeof record.failureCode!=='string')errors.push('failureCode must be null or a short code');
  if(!actions.has(record.nextAction))errors.push('invalid nextAction');
  return errors;
}

if(process.argv[1]===new URL(import.meta.url).pathname){
  const file=process.argv[2];
  if(!file){console.error('Usage: node beta/validate-record.mjs <record.json>');process.exit(64);}
  const record=JSON.parse(readFileSync(resolve(process.cwd(),file),'utf8'));
  const errors=validate(record);
  if(errors.length){console.error(errors.map(error=>`- ${error}`).join('\n'));process.exit(1);}
  console.log(JSON.stringify({valid:true,caseId:record.caseId,surface:record.surface,tasks:Object.keys(record.tasks).length,severity:record.severity},null,2));
}
