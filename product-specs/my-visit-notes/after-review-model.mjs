import {validateVisit,action} from './model.mjs';

export const AFTER_REVIEW_STATES=['Answered','Partly answered','Still unclear','Not discussed'];

export function reviewState(question){
 const q=question||{};
 if(q.state==='Answered')return 'Answered';
 if(q.state==='Partly answered')return 'Partly answered';
 if(q.state==='Ask later')return 'Still unclear';
 return 'Not discussed';
}

export function reviewSummary(visit,{includeNotes=new Set(),includeQuestions=new Set(),includeActions=new Set(),includeRequests=new Set()}={}){
 const v=validateVisit(visit),questions=v.questions.filter(q=>includeQuestions.has(q.id)&&q.text.trim());
 const actions=v.actions.filter(a=>includeActions.has(a.id)&&a.text.trim());
 const requests=v.requests.filter((r,i)=>includeRequests.has(i)&&r.visible&&r.text.trim());
 const lines=[v.title.trim()||'After-visit notes'];
 if(v.date)lines.push(v.date);
 if(questions.length)lines.push('','What happened',...questions.map(q=>{const line=`[${reviewState(q)}] ${q.text}`;return includeNotes.has(q.id)&&q.note.trim()?`${line}\nMy personal note (not confirmed by a clinician): ${q.note}`:line;}));
 if(actions.length)lines.push('','What I will do next',...actions.map(a=>`${a.text}${a.date?'\nDate: '+a.date:''}${a.contact?'\nContact: '+a.contact:''}`));
 if(requests.length)lines.push('','What helps me communicate',...requests.map(r=>r.text));
 return lines.join('\n');
}

export function nextStepDraft(question){
 const v=validateVisit({version:3,id:'draft',title:'',date:'',privateNotes:'',questions:[question],requests:[],actions:[],current:question.id});
 const q=v.questions[0];
 return action(`Follow up on: ${q.text}`);
}
