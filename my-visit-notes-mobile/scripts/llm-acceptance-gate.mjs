import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const root=resolve(new URL('..',import.meta.url).pathname);
const file=resolve(root,'llm-acceptance-judgment.json');
const judgment=JSON.parse(readFileSync(file,'utf8'));
const fail=message=>{throw Error(message);};

if(judgment.product!=='My Visit Notes')fail('Wrong product in LLM judgment');
if(judgment.reviewType!=='llm-evidence-review')fail('Wrong review type');
if(judgment.fictionalDataOnly!==true)fail('LLM review must use fictional data only');
if(judgment.steps?.length!==10)fail('LLM review must contain all ten acceptance steps');
if(judgment.steps.some(step=>!step.id||!step.name||!step.evidence||step.native!=='not-proven')){
  fail('Every native step must remain explicitly not-proven until runtime evidence exists');
}
if(judgment.nativeReleaseApproved!==false)fail('LLM review cannot approve native release without native evidence');
if(!Array.isArray(judgment.notProvenNativeChecks)||judgment.notProvenNativeChecks.length===0){
  fail('Native evidence gaps must be listed');
}
console.log(JSON.stringify({
  passed:true,
  reviewType:judgment.reviewType,
  steps:judgment.steps.length,
  nativeReleaseApproved:judgment.nativeReleaseApproved,
  nativeGaps:judgment.notProvenNativeChecks.length,
  decision:judgment.overallJudgment
},null,2));
