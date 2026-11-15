import {createServer} from 'node:http';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {extname,join,normalize,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('.',import.meta.url)));
const port=Number(process.argv.find(value=>value.startsWith('--port='))?.slice(7)||8765);
const types={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.txt':'text/plain; charset=utf-8'};
const server=createServer((request,response)=>{
  try{
    const requestPath=decodeURIComponent(new URL(request.url||'/',`http://${request.headers.host||'localhost'}`).pathname);
    const relative=requestPath==='/'?'/index.html':requestPath;
    const file=normalize(join(root,relative));
    if(!file.startsWith(root+ '/')||!existsSync(file)||!statSync(file).isFile())throw Error('not found');
    response.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    response.end(readFileSync(file));
  }catch(error){
    response.writeHead(error instanceof URIError?400:404,{'Content-Type':'text/plain; charset=utf-8'});
    response.end(error instanceof URIError?'Bad request':'Not found');
  }
});
server.listen(port,'127.0.0.1',()=>{
  console.log(`My Visit Notes is running at http://127.0.0.1:${port}/`);
  console.log('Use Ctrl+C to stop. Data stays in this browser profile.');
});
process.on('SIGINT',()=>server.close(()=>process.exit(0)));
