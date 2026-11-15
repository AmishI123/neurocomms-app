// Navigation only: this module neither saves nor replaces visit records.
export function createJourney({context}){
 const $=s=>document.querySelector(s),node=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;};
 const main=$('#main'),home=$('#welcome'),workspace=$('#workspace');
 const nav=node('nav');nav.setAttribute('aria-label','App navigation');
 function action(text,name,parent){const b=node('button',text);b.dataset.action=name;parent.append(b);return b;}
 action('Home','home',nav);action('Tools and settings','tools',nav);main.prepend(nav);
 const tools=node('details');tools.id='journey-tools';tools.append(node('summary','Tools and settings'));
 const toolsTitle=node('h2','Tools and saved work');toolsTitle.tabIndex=-1;tools.append(toolsTitle);
 for(const selector of ['section[aria-label="Recover changes"]','#transfer-tools','#preparations','#saved','#reading','#installation'])tools.append($(selector));
 main.append(tools);
 const followup=$('section[aria-label="Follow up after visits"]');
 home.querySelector('h2').textContent='What would you like to do?';home.querySelector('h2').tabIndex=-1;
 const intro=home.querySelectorAll(':scope > p');intro[1].textContent='Start here or return to work you saved.';intro[2].textContent='Saving keeps notes in this browser. There is no account.';
 const choices=home.querySelector('.start-choices');choices.classList.add('home-groups');
 const start=node('section');start.append(node('h3','Start a visit'),node('p','Write questions or choose passages from notes you already have.'));
 start.append(choices.querySelector('[data-action="start"]'),choices.querySelector('[data-action="bring-notes"]'));
 action('Prepare the next appointment','next-appointment',start);
 const example=node('details');example.append(node('summary','Try it without using your own notes'),choices.querySelector('[data-action="example"]'));start.append(example);
 const resume=node('section');resume.append(node('h3','Continue work'));const counts=node('p');counts.id='home-counts';resume.append(counts,choices.querySelector('[data-action="open-saved"]'));action('Continue saved preparation','saved-preparations',resume);
 const current=action('Return to my open visit','resume-open',resume),preparation=action('Return to unfinished preparation','bring-notes',resume),message=action('Return to my message','resume-message',resume);
 const progress=action('Return to my progress note','resume-progress',resume);
 const draftCounts=node('p');draftCounts.id='home-draft-counts';resume.append(draftCounts);action('Open saved follow-up drafts','saved-followup-drafts',resume);
 followup.querySelector('p').textContent='Review unfinished questions and next steps from saved visits. Nothing opens until you choose it.';followup.prepend(node('h3','Follow up'));
 choices.replaceChildren(start,resume,followup);
 const notice=node('p');notice.id='home-session-status';notice.setAttribute('role','status');home.append(notice);
 const finish=node('section');finish.id='journey-finish';finish.append(node('h2','Before you leave'),node('p','Review your questions and next steps above. Home keeps this page’s unfinished work; it does not save it.'));
 const finishStatus=node('p');finishStatus.id='finish-save-status';finish.append(finishStatus);action('Return home and keep this page’s work','home',finish);action('What still needs doing','follow-up',finish);workspace.append(finish);
 const next=node('section');next.id='journey-conversation';next.append(node('h2','Ready to show your words?'),node('p','Review your questions above. Choose communication requests in What helps, or go straight to choosing the words to show. Nothing is shown without your selection and preview.'));
 const conversation=workspace.querySelector('[data-action="conversation"]');conversation.before(next);next.append(conversation);
 const remaining=node('p');remaining.id='journey-remaining';finish.insertBefore(remaining,finishStatus);
 action('Prepare the next appointment','next-appointment',finish);
 const reveal=id=>{tools.open=true;const target=$('#'+id);if(target?.tagName==='DETAILS')target.open=true;target?.scrollIntoView({block:'start'});};
 function refresh(){const c=context();document.body.dataset.screen=home.hidden?c.screen:'home';draftCounts.textContent=`${c.drafts} saved follow-up draft${c.drafts===1?'':'s'}.`;counts.textContent=`${c.visits} saved visit${c.visits===1?'':'s'} · ${c.preparations} saved preparation${c.preparations===1?'':'s'}. ${c.visits+c.preparations?'Choose what to open.':'Nothing saved here yet.'}`;current.hidden=!c.started;preparation.hidden=!c.preparationWork;message.hidden=!c.messageWork;progress.hidden=!c.progressWork;notice.textContent=[c.started?'Open visit: '+c.saveStatus:'',c.preparationWork?'Unfinished preparation is still in this page. Save or download it before closing.':'',c.messageWork&&c.messageSaved?'Your open message draft is saved on this device. Later draft edits need another save.':c.messageWork?'A temporary message is still in this page. Copy or download it before closing.':'',c.progressWork&&c.progressSaved?'Your open progress draft is saved on this device; progress is not recorded yet. Later draft edits need another save.':c.progressWork?'An unsaved progress note is still in this page. Return to save or download it before closing.':''].filter(Boolean).join(' ');finishStatus.textContent=notice.textContent;remaining.textContent=`${c.unanswered} unanswered questions · ${c.nextSteps} unfinished next steps in this visit. You decide what to continue.`;finish.hidden=c.screen!=='review';}
 function showHome(){workspace.hidden=true;home.hidden=false;tools.open=false;for(const details of tools.querySelectorAll('details'))details.open=false;document.body.dataset.screen='home';refresh();home.querySelector('h2').focus();}
 function showWorkspace(){home.hidden=true;workspace.hidden=false;tools.open=false;$('#saved').open=false;$('#preparations').open=false;refresh();}
 function openTools(){tools.open=true;toolsTitle.focus();tools.scrollIntoView({block:'start'});}
 document.addEventListener('visit-save-status',refresh);
 $('#dialog').addEventListener('close',()=>{refresh();if($('#dialog').open)return;const active=document.activeElement;if(active===document.body||!active?.getClientRects().length)(home.hidden?$('#screen h2'):home.querySelector('h2'))?.focus();});
 refresh();
 return {showHome,showWorkspace,openTools,reveal,refresh};
}
