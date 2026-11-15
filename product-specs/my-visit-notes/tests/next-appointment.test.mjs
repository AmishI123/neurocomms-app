import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
globalThis.crypto=webcrypto;
import {blank,question,action,backup,restore} from '../model.mjs';
import {appointmentChoices,prepareNextAppointment,appointmentPlan,appointmentSource} from '../next-appointment-model.mjs';
function fixture(){const v=blank();v.title='PRIVATE_SOURCE_TITLE';v.date='2026-10-01';v.privateNotes='PRIVATE_PREP';v.questions=[{...question('\nAsk about timing\n'),note:'PRIVATE_ANSWER'}, {...question('Already answered'),state:'Answered'}];v.questions[0].history=[{id:'history',status:'Waiting for reply',date:'',note:'PRIVATE_HISTORY',at:1}];v.actions=[{...action('Call office'),date:'2026-10-10',contact:'Fictional office'}, {...action('Completed task'),state:'Done'}];v.requests=[{text:'Give me time',visible:true},{text:'Write it down',visible:false}];v.current=v.questions[0].id;return v;}
test('next appointment choices default to unfinished work without private notes',()=>{
 const v=fixture(),before=structuredClone(v),out=appointmentChoices(v);assert.equal(out.items.length,2);assert.equal(out.requests.length,2);assert.equal(out.items[0].text,v.questions[0].text);assert.doesNotMatch(JSON.stringify(out),/PRIVATE_PREP|PRIVATE_ANSWER|PRIVATE_HISTORY/);assert.equal(appointmentChoices(v,{includeClosed:true}).items.length,4);assert.deepEqual(v,before);
});
test('next appointment creates only selected independent copies and chosen requests',()=>{
 const v=fixture(),before=structuredClone(v),n=prepareNextAppointment(v,v,{questions:[v.questions[0].id],actions:[v.actions[0].id],requests:[1]});assert.deepEqual(v,before);assert.notEqual(n.id,v.id);assert.notEqual(n.questions[0].id,v.questions[0].id);assert.equal(n.questions[0].state,'Open');assert.deepEqual(n.questions[0].history,[]);assert.equal(n.questions[0].note,'');assert.deepEqual(n.requests,[{text:'Write it down',visible:true}]);assert.equal(n.questions[0].origin.visitId,v.id);assert.equal(n.actions[0].date,v.actions[0].date);assert.equal(n.actions[0].contact,v.actions[0].contact);assert.equal(n.title,'');assert.equal(n.date,'');assert.doesNotMatch(JSON.stringify(n),/PRIVATE_PREP|PRIVATE_ANSWER|PRIVATE_HISTORY/);
});
test('next appointment rejects stale source, invalid or duplicate choices and empty selection',()=>{
 const v=fixture(),choice={questions:[v.questions[0].id]};const changed=structuredClone(v);changed.questions[0].text='New wording';assert.throws(()=>prepareNextAppointment(changed,v,choice),/changed/);for(const selection of [{},{questions:['missing']},{questions:[v.questions[0].id,v.questions[0].id]},{requests:[9]},{requests:[0,0]},{actions:null}])assert.throws(()=>prepareNextAppointment(v,v,selection));assert.throws(()=>prepareNextAppointment(null,v,choice));
});
test('closed items and hidden requests require explicit selection and reset independently',()=>{
 const v=fixture(),n=prepareNextAppointment(v,v,{questions:[v.questions[1].id],actions:[v.actions[1].id],requests:[1]});assert.equal(n.questions[0].state,'Open');assert.equal(n.actions[0].state,'To do');assert.equal(v.questions[1].state,'Answered');assert.equal(v.requests[1].visible,false);assert.equal(prepareNextAppointment(v,v,{requests:[0]}).questions.length,0);
});
test('plan preserves exact ordered words and deliberately visible requests but excludes private source context',()=>{
 const v=fixture(),n=prepareNextAppointment(v,v,{questions:v.questions.map(q=>q.id),actions:[v.actions[0].id],requests:[0,1]});n.title='Next visit';n.questions.reverse();n.questions[0].text='<literal>\nSecond line';n.privateNotes='PRIVATE_NEXT_PREP';n.questions[0].note='PRIVATE_NEXT_ANSWER';n.requests[1].visible=false;const text=appointmentPlan(n);assert.match(text,/1\. <literal>\nSecond line/);assert.match(text,/2\. \nAsk about timing\n/);assert.match(text,/Give me time/);assert.match(text,/Contact: Fictional office/);assert.doesNotMatch(text,/PRIVATE_|Write it down/);assert.throws(()=>appointmentPlan(blank()),/Add/);assert.equal(appointmentPlan(restore(backup(n))),text);
});
test('source inspection projects current words without private answers or history and never mutates',()=>{
 const v=fixture(),n=prepareNextAppointment(v,v,{questions:[v.questions[0].id]}),before=structuredClone(v);const out=appointmentSource([v],n.questions[0].origin);assert.equal(out.available,true);assert.equal(out.current.text,v.questions[0].text);assert.doesNotMatch(JSON.stringify(out),/PRIVATE_PREP|PRIVATE_ANSWER|PRIVATE_HISTORY/);assert.deepEqual(v,before);v.questions[0].text='Later wording';assert.equal(appointmentSource([v],n.questions[0].origin).current.text,'Later wording');assert.equal(n.questions[0].text,'\nAsk about timing\n');
});
test('source inspection respects remapped or explicitly missing sources without guessed fallback',()=>{
 const v=fixture(),n=prepareNextAppointment(v,v,{questions:[v.questions[0].id]}),origin=n.questions[0].origin,copy=structuredClone(v);copy.id='transferred';copy.questions[0].text='Transferred version';assert.equal(appointmentSource([v,copy],{...origin,localVisitId:copy.id}).current.text,'Transferred version');for(const source of [{...origin,localVisitId:null},{...origin,localVisitId:'missing'},{...origin,itemId:'missing'}])assert.equal(appointmentSource([v],source).available,false);assert.deepEqual(appointmentSource([],origin),{captured:{title:v.title,date:v.date},available:false});assert.equal(appointmentSource([v],null),null);
});
test('editing and answering the next appointment never changes the original appointment',()=>{
 const v=fixture(),before=structuredClone(v),n=prepareNextAppointment(v,v,{questions:[v.questions[0].id],actions:[v.actions[0].id],requests:[0]});n.questions[0].text='My revised concern';n.questions[0].state='Answered';n.questions[0].note='My new answer';n.requests[0].text='My new request';n.actions[0].state='Done';assert.deepEqual(v,before);assert.deepEqual(restore(backup(n)),n);
});
