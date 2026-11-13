/**
 * 本地预览静态服务器（零依赖）：服务 dist/ 目录。
 * 用法：npm run serve   （先 npm run build）
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const port = Number(process.env.PORT) || 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // S2：非法转义（如 /%zz）容错，返回 400 而非抛未捕获异常
  let urlPath;
  try {
    urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('400 Bad Request');
  }

  const filePath = path.normalize(path.join(distDir, urlPath === '/' ? 'index.html' : urlPath));

  // S1：防目录穿越——用 path.relative 判断是否逃出 distDir（含分隔符收尾场景）
  const rel = path.relative(distDir, filePath);
  if (rel === '' || rel.startsWith('..') || path.isAbsolute(rel)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || stat.isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream'
    });
    // S3：读取失败兜底，避免 unhandled error 事件导致进程退出
    fs.createReadStream(filePath)
      .on('error', () => {
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        }
        res.end('500 Internal Server Error');
      })
      .pipe(res);
  });
});

server.listen(port, () => {
  console.log(`静态预览已启动：http://localhost:${port}  （服务目录 dist/）`);
});
