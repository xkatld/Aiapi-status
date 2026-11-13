/**
 * 海獭AI 服务状态页 —— 静态占位数据（后续接真实数据时，只需替换本文件的数据来源）。
 *
 * 约定：
 * - 可用率单位为百分比数值（如 99.9 表示 99.9%），null 表示数据中断。
 * - 首字延迟单位为毫秒（渲染时转秒，如 18000 → 18.0s）。
 * - spark 为最近 24 小时的逐小时可用率（数组长度 24，从 24 小时前 → 现在）。
 * - status: 'ok' 正常 / 'degraded' 异常。
 * - providers 为数组，卡片循环渲染可复用；加卡只需补一条数据。
 *   provider 可带 tab 字段（'default' / 'svip'）关联到对应 Tab，模板按 tab 过滤渲染。
 * - failReasons 可选：近 1 小时失败原因（有则渲染，无则省略）。
 */

// 着色阈值（单一事实源）：
// - template.js 的 barLevel 引用：v >= good → 绿，v >= warn → 黄，其余 → 红，null → 灰(数据中断)
// - 图例文案数字同步引用
const thresholds = { good: 99, warn: 95 };

// 顶部 Tab（两档，说明文字占位）
const tabs = [
  {
    id: 'default',
    label: 'Default',
    desc: 'Default 档服务说明（占位，待补充真实服务口径）。'
  },
  {
    id: 'svip',
    label: 'Svip',
    desc: 'Svip 档服务说明（占位，待补充真实服务口径）。'
  }
];

// 异常提示横幅
const banner = {
  level: 'warn',
  title: '部分模型异常',
  desc: '数据心跳 1 分钟前 / 页面每 60 秒自动刷新'
};

// 厂商卡片（演示卡：仅一张，加卡只需补数据）
const providers = [
  {
    id: 'claude',
    tab: 'default',
    name: 'Claude',
    status: 'ok',
    metrics: {
      current: 99.9,
      d1: 99.9,
      d7: 99.8,
      p50: 2400,
      p96: 18000,
      consistency: 99.6
    },
    spark: [
      100, 99.9, 100, 100, 99.8, 100, 100, 99.9, 100, 100, 99.7, 99.9,
      100, 100, 100, 99.9, 99.8, 100, 100, 99.9, 100, 100, 99.9, 100
    ],
    models: [
      {
        name: 'claude-sonnet-4-5',
        status: 'ok',
        current: 99.9,
        d1: 99.9,
        d7: 99.9,
        p50: 2100,
        consistency: 99.7,
        spark: [
          100, 100, 99.9, 100, 100, 99.9, 100, 100, 100, 99.8, 100, 100,
          100, 99.9, 100, 100, 100, 99.9, 100, 97.6, 100, 100, 99.9, 100
        ]
      },
      {
        name: 'claude-opus-4-1',
        status: 'ok',
        current: 99.8,
        d1: 99.7,
        d7: 99.8,
        p50: 3800,
        consistency: 99.5,
        spark: [
          99.9, 99.7, 99.8, 100, 99.6, 99.9, 99.8, 99.7, 99.9, 99.8, 99.5, 99.8,
          99.9, 99.8, 99.9, 99.7, 99.6, 99.8, 99.9, 99.7, 93.6, 99.9, 99.8, 99.8
        ]
      },
      {
        name: 'claude-haiku-4-5',
        status: 'ok',
        current: 100,
        d1: 99.9,
        d7: 99.9,
        p50: 1200,
        consistency: 99.8,
        spark: [
          100, 100, 100, 99.9, 100, 100, 100, 100, 99.9, 100, 100, 100,
          100, 100, 99.9, 100, 100, 100, 100, 99.9, 100, 100, 100, 100
        ]
      }
    ]
  }
];

// 统计口径
const stats = [
  {
    title: '可用率',
    desc: '按真实调用统计：成功调用数 ÷ 总调用数，按小时聚合，最近 24 小时逐小时展示，每分钟更新一次。'
  },
  {
    title: '模型与配置一致率',
    desc: '实际返回的模型与请求配置的模型一致的调用占比，用于衡量是否发生模型降级或路由漂移。'
  },
  {
    title: '隐私',
    desc: '仅统计调用元数据（时间、模型、状态码、耗时），不记录、不存储任何请求与响应内容。'
  }
];

const legend = [
  { color: 'good', label: `≥ ${thresholds.warn}% 正常` },
  { color: 'warn', label: `${thresholds.warn}–${thresholds.good}% 不稳定` },
  { color: 'bad', label: `< ${thresholds.warn}% 异常` },
  { color: 'none', label: '灰色：数据中断' }
];

module.exports = {
  site: {
    title: '海獭AI 服务状态',
    subtitle: '按真实调用统计，每分钟更新。'
  },
  tabs,
  banner,
  providers,
  stats,
  thresholds,
  legend,
  footer: '海獭AI 官方状态页 · 数据来自真实调用'
};
