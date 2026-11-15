// Session-only choices. No private notes are passed to this module.
export function createConversation({context,move,leave}){
 const dialog=document.createElement('dialog');dialog.id='conversation';dialog.setAttribute('aria-labelledby','conversation-heading');document.body.append(dialog);
 let signature,rows=[],picked=[],position=0,request=null,phase='choose',hidden=false,background=[],opener;
 const fingerprint=c=>JSON.stringify([c.id,c.questions,c.requests]);
 const element=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;};
 function button(text,fn){const b=element('button',text);b.type='button';b.onclick=fn;dialog.append(b);return b;}
 function heading(text){const h=element('h2',text);h.id='conversation-heading';h.tabIndex=-1;dialog.append(h);return h;}
 function close(){dialog.close();for(const [el,wasHidden] of background)el.hidden=wasHidden;background=[];delete document.body.dataset.conversation;opener?.isConnected&&opener.focus();}
 function exit(to){close();leave(to,picked.filter(r=>r.kind==='question')[position]?.id);}
 function conceal(){if(phase==='show'||phase==='exit'){phase='show';hidden=true;render();}}
 function showExit(){phase='exit';render();}
 function isFresh(){return signature===fingerprint(context());}
 function render(){
  dialog.replaceChildren();
  if(phase==='choose'){
   heading('Choose words to show');
   dialog.append(element('p','Choose questions and requests. You can edit request wording here for this session. These choices do not change saved requests.'));
   for(const row of rows){const label=element('label'),check=element('input');check.type='checkbox';check.checked=row.selected;check.onchange=()=>{row.selected=check.checked;};label.append(check,document.createTextNode(row.kind==='question'?row.text:'Include this request'));dialog.append(label);
    if(row.kind==='request'){const input=element('textarea');input.value=row.text;input.setAttribute('aria-label','Request wording');input.oninput=()=>{row.text=input.value;};dialog.append(input);}
   }
   const error=element('p');error.setAttribute('role','status');dialog.append(error);
   button('Preview chosen words',()=>{picked=rows.filter(r=>r.selected&&r.text.trim()).map(r=>({...r}));if(!picked.length){error.textContent='Choose at least one nonempty question or request.';return;}phase='preview';render();});
   button('Cancel conversation setup',close);
  }else if(phase==='preview'){
   heading('Check what will be shown');for(const row of picked)dialog.append(element('pre',row.text));
   dialog.append(element('p','Only these words will appear in the conversation view. This is not a lock: someone holding an unlocked device can leave the view. Choices and edited messages last only while this page stays open.'));
   button('Show chosen words',()=>{if(!isFresh()){open();return;}phase='show';hidden=false;request=null;const questions=picked.filter(r=>r.kind==='question');position=Math.max(0,questions.findIndex(r=>r.id===context().current));if(questions[position])move(questions[position].id);render();});
   button('Change choices',()=>{phase='choose';render();});button('Cancel conversation setup',close);
  }else if(phase==='exit'){
   heading('Return to your private workspace?');dialog.append(element('p','Your private notes and other workspace controls can become visible. Take the device back before continuing.'));
   const status=element('p',context().saveStatus);status.id='conversation-save-status';status.setAttribute('role','status');dialog.append(status);
   if(picked.some(r=>r.kind==='question'))button('Open my personal answer note',()=>exit('note'));button('Review after the visit',()=>exit('review'));button('Return to preparation',()=>exit('prepare'));button('Stay in conversation',()=>{phase='show';hidden=true;render();});
  }else{
   const questions=picked.filter(r=>r.kind==='question'),requests=picked.filter(r=>r.kind==='request');
   heading(hidden?'Message hidden':'Conversation');
   if(hidden){dialog.append(element('p','Your place is kept while this page stays open.'));const status=element('p',context().saveStatus);status.id='conversation-save-status';status.setAttribute('role','status');dialog.append(status);if(isFresh())button('Resume message',()=>{if(!isFresh()){render();return;}hidden=false;render();});else dialog.append(element('p','The visit wording changed. Return to your private workspace and choose words again.'));}
   else{
    const row=request||questions[position]||requests[0];const words=element('div',row?.text||'');words.className='big-question';words.dir='auto';dialog.append(words);
    button('Hide message',()=>{hidden=true;render();});
    if(request&&questions.length)button('Return to question',()=>{request=null;render();});
    if(questions.length>1){button('Previous chosen question',()=>{position--;request=null;move(questions[position].id);render();}).disabled=position===0;button('Next chosen question',()=>{position++;request=null;move(questions[position].id);render();}).disabled=position===questions.length-1;}
    if(requests.length){const details=element('details'),summary=element('summary','Show a request');details.append(summary);for(const r of requests){const b=element('button',r.text);b.onclick=()=>{request=r;render();};details.append(b);}dialog.append(details);}
   }
   button('Leave conversation view',showExit);
  }
  dialog.querySelector('h2')?.focus();dialog.scrollTop=0;
 }
 function open(){
  const c=context(),same=signature===fingerprint(c);signature=fingerprint(c);
  if(!same){rows=[...c.questions.map(q=>({...q,kind:'question',selected:false})),...c.requests.map((text,i)=>({id:`r${i}`,kind:'request',text,selected:false})),...['Please give me a moment.','Please explain that another way.','Please write that down.'].map((text,i)=>({id:`example${i}`,kind:'request',text,selected:false}))];picked=[];}
  phase=same&&picked.length?'preview':'choose';
  if(!dialog.open){opener=document.activeElement;background=[...document.body.children].filter(el=>el!==dialog).map(el=>[el,el.hidden]);for(const [el] of background)el.hidden=true;document.body.dataset.conversation='active';dialog.showModal();}
  render();
 }
 dialog.addEventListener('cancel',e=>{e.preventDefault();if(phase==='choose'||phase==='preview')close();else conceal();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&dialog.open)conceal();});
 window.addEventListener('storage',()=>{if(dialog.open)conceal();});
 document.addEventListener('visit-save-status',()=>{const status=dialog.querySelector('#conversation-save-status');if(status)status.textContent=context().saveStatus;});
 return {open,conceal};
}
