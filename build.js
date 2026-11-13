/**
 * 静态构建脚本：data/status.js（静态数据）+ src/（模板与资源）+ assets/（品牌图标等） → dist/
 * 用法：npm run build
 */
const fs = require('fs');
const path = require('path');

const data = require('./data/status');
const { renderPage } = require('./src/template');

const distDir = path.join(__dirname, 'dist');
const srcDir = path.join(__dirname, 'src');
const assetsDir = path.join(__dirname, 'assets');

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

// 1. 渲染 HTML
fs.writeFileSync(path.join(distDir, 'index.html'), renderPage(data), 'utf8');

// 2. 拷贝静态资源（M2：自动发现，新增资源无需改本脚本）
//    - src/ 下除模板入口 template.js 外的所有文件（styles.css、app.js 等）
for (const f of fs.readdirSync(srcDir)) {
  if (f === 'template.js') continue;
  const p = path.join(srcDir, f);
  if (fs.statSync(p).isFile()) {
    fs.copyFileSync(p, path.join(distDir, f));
  }
}

//    - assets/ 整目录（logo 等品牌资源），保持子目录结构
function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) {
    const src = path.join(from, f);
    const dest = path.join(to, f);
    if (fs.statSync(src).isDirectory()) copyDir(src, dest);
    else fs.copyFileSync(src, dest);
  }
}
if (fs.existsSync(assetsDir)) {
  copyDir(assetsDir, path.join(distDir, 'assets'));
}

// 3. 构建清单输出
function listFiles(dir, prefix) {
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) out.push(...listFiles(p, prefix + f + '/'));
    else out.push(prefix + f);
  }
  return out;
}

console.log('构建完成 → dist/');
for (const f of listFiles(distDir, '')) {
  const size = fs.statSync(path.join(distDir, f)).size;
  console.log(`  ${f}  ${(size / 1024).toFixed(1)} KB`);
}
