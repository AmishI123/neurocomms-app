import {readFileSync,writeFileSync} from 'node:fs';
import {createServer} from 'node:http';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=fileURLToPath(new URL('../',import.meta.url));const root=resolve(dir,'../..');
const paths=['tests/card-regression.mjs',...['index.html','app.js','styles.css','sw.js','tests/communication-access-card.test.cjs'].map(f=>'../communication-access-card/'+f)];
const sourceHashes=Object.fromEntries(paths.map(f=>[f,createHash('sha256').update(readFileSync(resolve(dir,f))).digest('hex')]));
const server=createServer((req,res)=>{try{let path=new URL(req.url,'http://local').pathname;if(path.endsWith('/'))path+='index.html';const file=resolve(root,'.'+path);if(!file.startsWith(resolve(root,'product-specs/communication-access-card')+'/'))throw Error('Outside card');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[extname(file)]||'text/plain');res.end(readFileSync(file));}catch{res.statusCode=404;res.end('Not found');}});
let serving=false;
try{
 await new Promise((done,reject)=>{server.once('error',reject);server.listen(8765,'127.0.0.1',()=>{serving=true;done();});});
}catch(e){if(e.code!=='EADDRINUSE')throw e;const response=await fetch('http://localhost:8765/product-specs/communication-access-card/index.html');if(!response.ok)throw Error('Port 8765 is busy and does not serve the card test page.');}
let output='';let code;
try{code=await new Promise((done,reject)=>{const child=spawn(process.execPath,['--test',resolve(root,'product-specs/communication-access-card/tests/communication-access-card.test.cjs')],{cwd:root,env:process.env});child.stdout.on('data',b=>{output+=b;process.stdout.write(b);});child.stderr.on('data',b=>{output+=b;process.stderr.write(b);});child.on('error',reject);child.on('exit',done);});}finally{if(serving)await new Promise(r=>server.close(r));}
const passed=Number(output.match(/^# pass (\d+)$/m)?.[1]||0),failed=Number(output.match(/^# fail (\d+)$/m)?.[1]||0);
writeFileSync(dir+'qa/card-results.txt',output);writeFileSync(dir+'qa/card-results.json',JSON.stringify({date:new Date().toISOString(),node:process.version,exitCode:code,passed,failed,sourceHashes},null,2));
if(code!==0||passed!==6||failed!==0)process.exitCode=1;
