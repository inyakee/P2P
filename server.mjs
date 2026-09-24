import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = dirname(fileURLToPath(import.meta.url));
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/script.js', ['script.js', 'text/javascript; charset=utf-8']],
  ['/assets/abstract-worship.png', ['assets/abstract-worship.png', 'image/png']],
]);
const server = http.createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  if (!['GET', 'HEAD'].includes(request.method)) {
    response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return;
  }
  if (pathname === '/index.html' || pathname === '/index') {
    response.writeHead(308, { Location: '/' }); response.end(); return;
  }
  const file = files.get(pathname);
  if (!file) { response.writeHead(404, { 'Content-Type': 'text/plain' }); response.end('Page not found'); return; }
  try {
    const body = await readFile(join(root, file[0]));
    response.writeHead(200, { 'Content-Type': file[1], 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    response.writeHead(500, { 'Content-Type': 'text/plain' }); response.end('Unable to load the page');
  }
});
const port = Number(process.env.PORT || 3000);
server.listen(port, '127.0.0.1', () => console.log(`P2P is ready at http://localhost:${port}/`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
