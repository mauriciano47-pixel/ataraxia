import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 8089;
const DIST = path.resolve(process.cwd(), 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let cleanUrl = req.url ? req.url.split('?')[0] : '/';
  let safePath = path.normalize(decodeURIComponent(cleanUrl)).replace(/^(\.\.[/\\])+/, '');
  if (safePath === '/' || safePath === '\\' || safePath === '') safePath = '/index.html';

  let resolvedPath = path.resolve(DIST, '.' + safePath);
  if (!resolvedPath.startsWith(DIST)) {
    resolvedPath = path.resolve(DIST, 'index.html');
  }

  try {
    const stat = fs.statSync(resolvedPath);
    if (stat.isDirectory()) {
      resolvedPath = path.resolve(DIST, 'index.html');
    }
  } catch {
    resolvedPath = path.resolve(DIST, 'index.html');
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const data = fs.readFileSync(resolvedPath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff'
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  console.log(`[E2E Server] Serving ${DIST} at http://localhost:${PORT}`);
});
