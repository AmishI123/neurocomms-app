// Shared web/native boundary. Only an installed Capacitor app uses plugins.
export const isNative=()=>globalThis.Capacitor?.isNativePlatform?.()===true;
// These unbundled pages use the proxies injected by the installed native
// bridge. registerPlugin belongs to the separate JS SDK, which we do not load.
const plugin=name=>{
 const native=globalThis.Capacitor?.Plugins?.[name];
 if(!native)throw Error(`The ${name} phone feature is unavailable.`);
 return native;
};

export async function copyText(text){
 if(isNative())await plugin('Clipboard').write({string:text});
 else await navigator.clipboard.writeText(text);
}

export async function printText(text){
 if(isNative()){await plugin('VisitPrint').printText({text});return;}
 document.querySelector('#print-output').textContent=text;
 window.print();
}

export function createNativeExporter({filesystem,share,id=()=>crypto.randomUUID()}){
 let busy=false;
 return async(name,text)=>{
  if(busy)throw Error('A file is already open for saving or sharing. Finish that choice first.');
  if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(name))throw Error('Invalid export filename.');
  busy=true;
  try{
   // Each attempt keeps an independent file, including when another app reads it
   // after the chooser closes. These copies are cleared on the next app launch.
   const path=`visit-exports/${id()}/${name}`;
   const {uri}=await filesystem.writeFile({path,data:text,directory:'CACHE',encoding:'utf8',recursive:true});
   await share.share({title:name,files:[uri],dialogTitle:'Save or share this file'});
  }finally{busy=false;}
 };
}

let exporter,exportCleanup=Promise.resolve();
export async function exportText(name,text,type){
 if(isNative()){
  await exportCleanup;
  exporter??=createNativeExporter({filesystem:plugin('Filesystem'),share:plugin('Share')});
  await exporter(name,text);
  return 'The save or share sheet closed. Check your chosen destination for the file.';
 }
 const url=URL.createObjectURL(new Blob([text],{type}));
 const link=document.createElement('a');link.href=url;link.download=name;link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 return null;
}

export async function startNative({back,conceal,notify}){
 if(!isNative())return;
 document.body.dataset.native='true';
 document.querySelector('#offline').textContent='This app is ready offline. Save your notes before closing.';
 document.querySelector('#installation').hidden=true;
 for(const p of document.querySelectorAll('#welcome > p')){
  if(p.textContent==='Saving keeps notes in this browser. There is no account.')p.textContent='Saving keeps notes in this app on this device. There is no account.';
 }
 const help=document.createElement('p');help.className='small';
 help.textContent='Export opens your phone’s save or share sheet. Choose where to keep the file. Closing the sheet does not confirm a backup.';
 document.querySelector('#welcome').append(help);
 exportCleanup=(async()=>{try{
  // Only this app's managed export cache, never saved visits or user files.
  const fs=plugin('Filesystem');
  try{await fs.stat({path:'visit-exports',directory:'CACHE'});}
  catch(error){if(/not exist|not found|no such file/i.test(error.message||''))return;throw error;}
  await fs.rmdir({path:'visit-exports',directory:'CACHE',recursive:true});
 }catch{notify('Earlier temporary export files could not be cleared. Your saved visits are unchanged.');}})();
 // Back and concealment must work even if cache cleanup is slow. Exports await
 // the cleanup barrier separately so it cannot remove a newly created file.
 await listen();
 async function listen(){
  const app=plugin('App');
  await app.addListener('backButton',back);
  await app.addListener('appStateChange',({isActive})=>{if(!isActive)conceal();});
 }
}
