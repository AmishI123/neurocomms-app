import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
globalThis.crypto=webcrypto;
import {blank,question,action} from '../model.mjs';
import {reviewState,reviewSummary,nextStepDraft} from '../after-review-model.mjs';
import {readStore,emptyStore} from '../model.mjs';
import {recordChanges,visitChanges} from '../recovery-model.mjs';
import {recordStateChanges} from '../followup-model.mjs';

test('partly answered survives recovery history and a later answer after reopening',()=>{
 const before=visit();before.questions[0].state='Open';
 let after=structuredClone(before);after.questions[0].state='Partly answered';
 after=recordStateChanges(before,after);
 const store=emptyStore();store.visits=[after];
 store.recovery=recordChanges([],visitChanges(before,after),'Changed outcome');
 const reopened=readStore(JSON.stringify(store));
 assert.equal(reopened.visits[0].questions[0].state,'Partly answered');
 const done=structuredClone(after);done.questions[0].state='Answered';
 store.visits=[recordStateChanges(after,done)];
 store.recovery=recordChanges(store.recovery,visitChanges(after,store.visits[0]),'Answered later');
 assert.equal(readStore(JSON.stringify(store)).visits[0].questions[0].state,'Answered');
});

function visit(){const v=blank();v.title='Fictional after-visit';v.date='2026-11-01';v.questions=[question('What happens next?'),{...question('Was the plan clear?'),state:'Partly answered',note:'PRIVATE_ANSWER'}];v.questions[0].state='Answered';v.requests=[{text:'Written instructions',visible:true},{text:'PRIVATE_REQUEST',visible:false}];v.actions=[{...action('Call the office'),date:'2026-11-08',contact:'Fictional office'}];return v;}
test('after-review labels are plain and map existing saved states',()=>{const v=visit();assert.equal(reviewState(v.questions[0]),'Answered');assert.equal(reviewState(v.questions[1]),'Partly answered');v.questions[0].state='Ask later';assert.equal(reviewState(v.questions[0]),'Still unclear');v.questions[0].state='Open';assert.equal(reviewState(v.questions[0]),'Not discussed');});
test('private after-review summary includes only deliberate questions notes and next steps',()=>{const v=visit(),text=reviewSummary(v,{includeQuestions:new Set(v.questions.map(q=>q.id)),includeActions:new Set([v.actions[0].id]),includeNotes:new Set([v.questions[1].id])});assert.match(text,/\[Answered\] What happens next\?/);assert.match(text,/\[Partly answered\] Was the plan clear\?/);assert.match(text,/PRIVATE_ANSWER/);assert.match(text,/Call the office/);assert.match(text,/Fictional office/);assert.doesNotMatch(text,/privateNotes/);});
test('after-review summary leaves unselected private questions and actions out',()=>{const v=visit(),text=reviewSummary(v,{includeQuestions:new Set([v.questions[0].id])});assert.match(text,/What happens next/);assert.doesNotMatch(text,/Was the plan clear|PRIVATE_ANSWER|Call the office/);});
test('after-review summary includes only selected visible communication requests',()=>{const v=visit(),text=reviewSummary(v,{includeRequests:new Set([0])});assert.match(text,/What helps me communicate/);assert.match(text,/Written instructions/);assert.doesNotMatch(text,/PRIVATE_REQUEST/);});
test('turning a question into a next step is a plain editable draft, not an answer or status change',()=>{const v=visit(),before=structuredClone(v),draft=nextStepDraft(v.questions[1]);assert.match(draft.text,/Was the plan clear/);assert.equal(draft.state,'To do');assert.equal(draft.date,'');assert.equal(draft.contact,'');assert.deepEqual(v,before);});
