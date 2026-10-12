// Tiny static server for local preview: node tools/serve.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.argv[2] || process.env.PORT || 4321);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4',
  '.vtt': 'text/vtt; charset=utf-8', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = normalize(join(root, path));
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    const info = await stat(file);
    const type = types[extname(file).toLowerCase()] || 'application/octet-stream';
    const range = req.headers.range;
    const body = await readFile(file);
    if (range && type === 'video/mp4') {
      const [s, e] = range.replace('bytes=', '').split('-');
      const start = Number(s); const end = e ? Number(e) : info.size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${info.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1, 'Cache-Control': 'no-cache' });
      res.end(body.subarray(start, end + 1));
      return;
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': info.size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' });
    res.end(body);
  } catch {
    try {
      const nf = await readFile(join(root, '404.html'));
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(nf);
    } catch { res.writeHead(404).end('Not found'); }
  }
}).listen(port, '127.0.0.1', () => console.log(`Portfolio preview → http://localhost:${port}`));
