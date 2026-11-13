# Aiapi-status

海獭AI 服务状态页 —— 纯静态站点，使用 Node.js 脚本静态构建，数据为静态占位数据（不接任何真实 API、无后端）。

## 用法

```bash
npm run build     # 静态构建，产出纯 HTML/CSS/JS 到 dist/
npm run serve     # 本地预览 http://localhost:4173（零依赖静态服务器，服务 dist/）
npm run preview   # 构建 + 预览
```

也可以用任意静态服务器托管 `dist/`，如 `npx serve dist`。

## 目录结构

```
build.js          # 静态构建脚本：数据 + 模板 + assets → dist/
server.js         # 本地预览静态服务器（零依赖）
data/status.js    # 全部静态占位数据（厂商/模型/指标/条形图/失败原因等）
assets/logo.png   # 海獭AI 品牌图标（构建时带入 dist/assets/）
src/template.js   # HTML 模板（纯函数，渲染 data）
src/styles.css    # 页面样式
src/app.js        # 交互增强（Tab 切换），页面数据完全静态
dist/             # 构建产物（生成物，不入库）
```

## 后续接真实数据

所有数据集中在 `data/status.js`，页面渲染与数据解耦：
后续只需将 `data/status.js` 替换为真实统计数据（或在 `build.js` 中注入），
`src/template.js` 无需改动。

## 数据约定

- 可用率为百分比数值（`99.9` 表示 99.9%），`null` 表示数据中断（灰色竖条）。
- `spark` 为最近 24 小时逐小时可用率（长度 24，24 小时前 → 现在）。
- 竖条颜色：≥ 99% 绿（正常）、95–99% 黄（不稳定）、< 95% 红（异常）、null 灰（数据中断）。
- `status`：`ok` 正常 / `degraded` 异常。
