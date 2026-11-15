// Exercise public navigation. Do not force hidden elements or mutate app state.
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export function navigationHashes(){return Object.fromEntries(['platform.mjs','after-review-model.mjs','next-appointment-model.mjs','next-appointment-ui.mjs','draft-record.mjs','draft-model.mjs','draft-ui.mjs','transfer-model.mjs','transfer-record.mjs','journey-ui.mjs','followup-ui.mjs','intake.mjs','tests/navigation.mjs'].map(f=>[f,createHash('sha256').update(readFileSync(new URL('../'+f,import.meta.url))).digest('hex')]));}
export function buttonControl(page,name){const locator=page.getByRole('button',{name,exact:true});return new Proxy(locator,{get(target,key){if(key==='click')return options=>clickButton(page,name,options);const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;}});}
export async function revealControl(page,locator){
 // WebKit can report a nested <details> as visible while its enclosing
 // disclosure is closed. Always open closed ancestors through their summaries
 // before relying on visibility; never force a click into clipped content.
 if(await page.locator('#journey-tools').count()){
  const where=await locator.evaluate(el=>({home:Boolean(el.closest('#welcome')),workspace:Boolean(el.closest('#workspace'))}));
  if(where.home&&await page.locator('#welcome').isHidden())await page.getByRole('button',{name:'Home',exact:true}).click();
  if(where.workspace&&await page.locator('#workspace').isHidden())await page.getByRole('button',{name:'Return to my open visit',exact:true}).click();
 }
 const ancestors=await locator.evaluate(el=>{const all=[...document.querySelectorAll('details')],result=[];for(let p=el.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS'&&!p.open)result.unshift(all.indexOf(p));return result;});
 for(const index of ancestors)await page.locator('details').nth(index).locator(':scope > summary').click();
}
export async function clickButton(page,name,options){
 const modal=page.locator('dialog[open]').last();if(await modal.count()){const inModal=modal.getByRole('button',{name,exact:true});if(await inModal.count()===1){await inModal.click(options);return;}}
 const visible=page.getByRole('button',{name,exact:true});
 if(await visible.count()===1&&await visible.isVisible()){await visible.click(options);return;}
 const target=page.getByRole('button',{name,exact:true,includeHidden:true});
 // A duplicate Home/review follow-up control intentionally represents one tool.
 const chosen=await target.count()>1?target.first():target;
 await revealControl(page,chosen);await chosen.click(options);
}
export async function openSection(page,selector){const target=page.locator(selector);await revealControl(page,target);if(!await target.evaluate(el=>el.open))await target.locator(':scope > summary').click();}
