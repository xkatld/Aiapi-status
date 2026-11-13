/**
 * 页面模板：纯函数，输入 data/status.js 的静态数据，输出完整 HTML 字符串。
 * 后续接真实数据时无需改动本文件。
 */

// C2：着色阈值统一引用 data/status.js 导出的 thresholds（与图例文案同源）
const { thresholds } = require('../data/status');

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** T1：数值化。null/undefined/空串/非有限数值一律返回 null（由调用方兜底展示） */
function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** T1：数值安全渲染，非法值兜底为 —；unit 为附加单位（如 ' ms'） */
function fmtNum(v, unit) {
  const n = num(v);
  return n === null ? '—' : n + (unit || '');
}

/** 毫秒 → 秒展示（如 18000 → 18.0s），非法值兜底 — */
function fmtSec(v) {
  const n = num(v);
  return n === null ? '—' : (n / 1000).toFixed(1) + 's';
}

/** 可用率数值 → 竖条颜色档位：good / warn / bad / none(数据中断) */
function barLevel(v) {
  const n = num(v);
  if (n === null) return 'none';
  if (n >= thresholds.good) return 'good';
  if (n >= thresholds.warn) return 'warn';
  return 'bad';
}

function pct(v) {
  const n = num(v);
  return n === null ? '—' : n.toFixed(1) + '%';
}

/** 24 根竖条 sparkline */
function renderSpark(spark, small) {
  const bars = spark
    .map((v) => {
      const n = num(v);
      const level = barLevel(n);
      const title = n === null ? '数据中断' : n.toFixed(1) + '%';
      return `<span class="bar bar--${level}" title="${title}"></span>`;
    })
    .join('');
  return `<div class="spark${small ? ' spark--sm' : ''}" role="img" aria-label="最近 24 小时可用率">${bars}</div>`;
}

function renderStatusBadge(status) {
  const label = status === 'ok' ? '正常' : '异常';
  return `<span class="badge badge--${status === 'ok' ? 'ok' : 'bad'}"><i class="dot"></i>${label}</span>`;
}

function renderTabs(tabs) {
  const items = tabs
    .map(
      (t, i) =>
        `<button class="tab${i === 0 ? ' tab--active' : ''}" data-tab="${esc(t.id)}" data-desc="${esc(t.desc)}" type="button">${esc(t.label)}</button>`
    )
    .join('');
  return `<nav class="tabs" role="tablist">${items}</nav>
  <p class="tabs-desc" id="tabs-desc">${esc(tabs[0].desc)}</p>`;
}

function renderBanner(banner) {
  return `<div class="banner banner--${esc(banner.level)}">
    <span class="banner-title"><i class="dot dot--red"></i>${esc(banner.title)}</span>
    <span class="banner-desc">${esc(banner.desc)}</span>
  </div>`;
}

/** 指标区：小灰标签在上、大黑数字在下、数字下灰小字 */
function renderMetrics(m) {
  return `<div class="metrics">
    <div class="metric">
      <div class="metric-label">当前可用率</div>
      <div class="metric-value">${pct(m.current)}</div>
      <div class="metric-sub">近 15 分钟</div>
    </div>
    <div class="metric">
      <div class="metric-label">24 小时可用率</div>
      <div class="metric-value">${pct(m.d1)}</div>
      <div class="metric-sub">近 24 小时</div>
    </div>
    <div class="metric">
      <div class="metric-label">7 天可用率</div>
      <div class="metric-value">${pct(m.d7)}</div>
      <div class="metric-sub">近 7 天</div>
    </div>
    <div class="metric">
      <div class="metric-label">首字延迟 p50 / p96</div>
      <div class="metric-value">${fmtSec(m.p50)}</div>
      <div class="metric-sub">p96 ${fmtSec(m.p96)}</div>
    </div>
    <div class="metric">
      <div class="metric-label">模型与配置一致率 <span class="help-icon" title="实际返回模型与请求配置一致的调用占比">?</span></div>
      <div class="metric-value">${pct(m.consistency)}</div>
      <div class="metric-sub">近 24 小时</div>
    </div>
  </div>`;
}

/** 模型名前的小图标 */
function renderModelIcon() {
  return `<svg class="model-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><rect x="1.5" y="1.5" width="13" height="13" rx="3.5" fill="none" stroke="#6b7280" stroke-width="1.4"/><circle cx="8" cy="8" r="2.2" fill="#6b7280"/></svg>`;
}

function renderModelRow(model) {
  return `<tr>
    <td class="cell-model">${renderModelIcon()}<span>${esc(model.name)}</span></td>
    <td><span class="status-text status-text--${model.status === 'ok' ? 'ok' : 'bad'}">${model.status === 'ok' ? '正常' : '异常'}</span></td>
    <td>${pct(model.current)}</td>
    <td>${pct(model.d1)}</td>
    <td>${pct(model.d7)}</td>
    <td>${fmtSec(model.p50)}</td>
    <td>${pct(model.consistency)}</td>
    <td class="cell-spark">${renderSpark(model.spark, true)}</td>
  </tr>`;
}

function renderFailReasons(reasons) {
  const rows = (reasons || [])
    .map((r) => {
      // T1：占比必须是 0–100 的数值，非法值整行跳过，杜绝 HTML/CSS 注入面
      const pctVal = num(r.pct);
      if (pctVal === null || pctVal < 0 || pctVal > 100) return '';
      return `<li class="reason">
        <span class="reason-label">${esc(r.label)}</span>
        <span class="reason-track"><span class="reason-fill" style="width:${pctVal}%"></span></span>
        <span class="reason-pct">${pctVal}%</span>
      </li>`;
    })
    .join('');
  return `<div class="fail-reasons">
    <h4 class="fail-title">近 1 小时失败原因</h4>
    <ul class="reason-list">${rows}</ul>
  </div>`;
}

/** 单张厂商卡片：数据驱动可复用，providers 循环渲染；按 tab 过滤展示，非当前 Tab 的卡片 hidden */
function renderCard(p, activeTab) {
  const tab = p.tab || 'default';
  return `<section class="card" id="provider-${esc(tab)}-${esc(p.id)}" data-tab="${esc(tab)}"${tab === activeTab ? '' : ' hidden'}>
    <header class="card-head">
      <h3 class="card-name">${esc(p.name)}</h3>
      ${renderStatusBadge(p.status)}
    </header>
    <div class="card-body">
      ${renderMetrics(p.metrics)}
      <div class="spark-block">
        ${renderSpark(p.spark)}
        <div class="spark-axis">
          <span>24 小时前</span>
          <span class="spark-axis-center">${pct(p.metrics.d1)} 可用</span>
          <span>现在</span>
        </div>
      </div>
    </div>
    <table class="model-table">
      <thead>
        <tr>
          <th>模型</th><th>状态</th><th>当前</th><th>24 小时</th><th>7 天</th><th>首字 p50</th><th>一致率</th><th>最近 24 小时</th>
        </tr>
      </thead>
      <tbody>${p.models.map(renderModelRow).join('')}</tbody>
    </table>
    ${p.failReasons ? renderFailReasons(p.failReasons) : ''}
  </section>`;
}

function renderStats(stats, legend) {
  const cols = stats
    .map(
      (s) => `<div class="stat">
        <h4 class="stat-title">${esc(s.title)}</h4>
        <p class="stat-desc">${esc(s.desc)}</p>
      </div>`
    )
    .join('');
  const items = legend
    .map(
      (l) => `<span class="legend-item"><span class="legend-swatch legend-swatch--${esc(l.color)}"></span>${esc(l.label)}</span>`
    )
    .join('');
  return `<section class="stats">
    <h3 class="stats-heading">统计口径</h3>
    <div class="stats-grid">${cols}</div>
    <div class="legend">${items}</div>
  </section>`;
}

function renderPage(data) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(data.site.title)}</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<div class="page">
  <header class="hero">
    <div class="brand">
      <img class="brand-logo" src="assets/logo.png" alt="海獭AI 图标">
      <span class="brand-name">海獭AI</span>
    </div>
    <h1 class="hero-title">${esc(data.site.title)}</h1>
    <p class="hero-subtitle">${esc(data.site.subtitle)}</p>
  </header>
  ${renderTabs(data.tabs)}
  ${renderBanner(data.banner)}
  <main class="cards">
    ${data.providers.map((p) => renderCard(p, data.tabs[0].id)).join('\n')}
  </main>
  ${renderStats(data.stats, data.legend)}
  <footer class="footer">${esc(data.footer)}</footer>
</div>
<script src="app.js"></script>
</body>
</html>`;
}

module.exports = { renderPage };
