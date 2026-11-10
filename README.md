# 天气应用 · Weather Station

基于 **React 18 + TypeScript + Vite** 的天气应用，支持地点搜索、实时天气、24 小时逐时趋势与 7 日预报，并完整处理加载中与错误状态。

数据来自 [Open-Meteo](https://open-meteo.com/) 公开 API（Geocoding + Forecast），**无需 API Key、无需后端**。

> 应用代码位于 [`weather-app/`](./weather-app/)。

## 快速开始

```bash
cd weather-app
npm install
npm run dev        # http://localhost:5173
```

| 命令 | 说明 |
| --- | --- |
| `npm run typecheck` | TypeScript 严格模式检查 |
| `npm run build` | 类型检查 + 产出 `dist/` |
| `npm run preview` | 预览构建结果，`dist/index.html` 也可直接打开 |

可选：复制 `.env.example` 为 `.env`，覆盖 `VITE_GEOCODING_API_URL`、`VITE_FORECAST_API_URL`、`VITE_REQUEST_TIMEOUT_MS`。

## 功能

- 地点搜索：350ms 防抖、中英文关键词、键盘操作、最近查看、热门城市、浏览器定位
- 实时天气：温度、体感、湿度、风向风速、降水、云量、气压、日出日落、当地时间
- 天气预报：24 小时气温曲线与降雨概率、7 日最高/最低温区间条
- 状态处理：骨架屏、可重试错误面板、空结果提示、定位失败提示、渲染错误边界
- 其他：°C/°F 切换（风速降水同步换算）、偏好本地持久化、随天气变化的背景色调、响应式与无障碍标注


## 目录

```
.
├── README.md              # 本文档（工作区入口说明）
└── weather-app/           # 完整项目
    ├── .env.example
    ├── vite.config.ts
    └── src/{api,app,components,domain,hooks,styles,utils}
```
