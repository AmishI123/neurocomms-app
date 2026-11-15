export const DISPLAY_KEY='my-visit-notes.display.v1';
export const defaultDisplay=()=>({version:1,size:'standard',spacing:'standard',contrast:'soft'});
export function readDisplay(raw){if(raw===null)return defaultDisplay();const x=JSON.parse(raw);if(!x||x.version!==1||!['standard','large','largest'].includes(x.size)||!['standard','roomy'].includes(x.spacing)||!['soft','high','dark'].includes(x.contrast))throw Error('Reading choices could not be read.');return {version:1,size:x.size,spacing:x.spacing,contrast:x.contrast};}
export function currentDisplay(){return readDisplay(JSON.stringify({version:1,...Object.fromEntries(['size','spacing','contrast'].map(key=>[key,document.querySelector('#reading-'+key).value]))}));}
export function applyTransferredDisplay(value,expectedRaw){
 const clean=readDisplay(JSON.stringify(value));
 if(localStorage.getItem(DISPLAY_KEY)!==expectedRaw)throw Error('Reading choices changed after the preview. Reopen transfer to review them again.');
 localStorage.setItem(DISPLAY_KEY,JSON.stringify(clean));
 window.dispatchEvent(new StorageEvent('storage',{key:DISPLAY_KEY,newValue:JSON.stringify(clean)}));
 return true;
}
if(typeof document!=='undefined'){
 const $=s=>document.querySelector(s);let settings=defaultDisplay();
 const status=text=>$('#reading-status').textContent=text;
 function apply(){document.body.dataset.contrast=settings.contrast;document.body.dataset.spacing=settings.spacing;document.body.style.setProperty('--reading-size',({standard:18,large:21,largest:24})[settings.size]+'px');document.body.style.setProperty('--reading-scale',({standard:1,large:1.16,largest:1.33})[settings.size]);for(const key of ['size','spacing','contrast'])$('#reading-'+key).value=settings[key];window.dispatchEvent(new Event('resize'));}
 try{settings=readDisplay(localStorage.getItem(DISPLAY_KEY));status('Reading choices are separate from your visit notes.');}catch{status('Saved reading choices could not be read. Default display is in use. Saving new choices replaces only the reading settings, not notes.');}apply();
 for(const key of ['size','spacing','contrast'])$('#reading-'+key).addEventListener('change',e=>{settings[key]=e.target.value;apply();status('Changed for this page. Save these choices to keep them after closing.');});
 $('#save-reading').onclick=()=>{try{localStorage.setItem(DISPLAY_KEY,JSON.stringify(settings));status('Reading choices saved on this device. Your notes have not changed.');}catch{status('Reading choices could not be saved. They still work on this page. Your notes have not changed.');}};
 $('#reset-reading').onclick=()=>{try{localStorage.removeItem(DISPLAY_KEY);settings=defaultDisplay();apply();status('Reading choices reset. Your notes have not changed.');}catch{status('Saved reading choices could not be reset. Your notes have not changed.');}};
 window.addEventListener('storage',e=>{if(e.key!==DISPLAY_KEY&&e.key!==null)return;try{settings=readDisplay(localStorage.getItem(DISPLAY_KEY));apply();status('Reading choices updated from this browser. Your notes have not changed.');}catch{status('Reading choices changed elsewhere but could not be read. Current display kept.');}});
}
