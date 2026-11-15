import {readFileSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('../../communication-tool/node_modules/playwright');
const dir=fileURLToPath(new URL('.',import.meta.url));mkdirSync(dir+'icons',{recursive:true});
const browser=await chromium.launch({headless:true});
try{for(const size of [180,192,512]){const page=await browser.newPage({viewport:{width:size,height:size},deviceScaleFactor:1});await page.setContent(`<style>html,body{margin:0;background:#215b53}svg{display:block;width:100%;height:100%}</style>${readFileSync(dir+'icon.svg','utf8')}`);await page.screenshot({path:dir+`icons/icon-${size}.png`});await page.close();}}finally{await browser.close();}
console.log('Rendered 180, 192 and 512 pixel icons from the versioned SVG.');
