const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const root = path.resolve(__dirname, '../../..');

async function serve(request, response) {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(`${root}${path.sep}`)) throw new Error('outside root');
    const data = await fs.readFile(file);
    const types = {'.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.mjs':'text/javascript', '.json':'application/json', '.md':'text/markdown'};
    response.writeHead(200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream'});
    response.end(data);
  } catch {
    response.writeHead(404);
    response.end();
  }
}

async function startStaticServer() {
  const server = http.createServer(serve);
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  return {server, url: pathname => `http://127.0.0.1:${server.address().port}${pathname}`};
}

async function closeStaticServer(server) {
  await new Promise(resolve => server ? server.close(() => resolve()) : resolve());
}

module.exports = {startStaticServer, closeStaticServer};
