document.getElementById('print').addEventListener('click',()=>window.print());
document.getElementById('notes').addEventListener('click',event=>{
 const show=event.currentTarget.getAttribute('aria-pressed')!=='true';
 document.querySelectorAll('.speaker').forEach(note=>{note.open=show;});
 event.currentTarget.setAttribute('aria-pressed',String(show));
 event.currentTarget.textContent=show?'Hide speaker notes':'Show speaker notes';
});
