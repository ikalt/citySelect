# CitySelect

CitySelect 是一个中文优先的跨端城市 / 目的地选择 MVP。当前首版聚焦国内城市选择、省市区选择、provider 降级搜索、Taro-facing 适配层和本地 demo，不依赖真实远程服务。

## 当前范围

- `packages/core`：城市类型、搜索索引、搜索排序、A-Z 分组、最近访问、行政区选择结果。
- `packages/data`：内置 MVP 城市 / 行政区数据、热门城市、数据校验。
- `packages/providers`：本地城市 provider、模拟目的地 provider、组合 provider、超时 / 失败 / 部分失败状态。
- `packages/taro`：中文优先、英文兼容的 Taro-facing props / state / event 适配层。
- `apps/demo-taro`：可运行的确定性 demo 快照，覆盖城市、省市区、目的地、空态和降级态。

## 快速开始

本仓库在当前环境使用 pnpm fallback：

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm install
npm exec --yes --package pnpm@9.15.4 -- pnpm test
npm exec --yes --package pnpm@9.15.4 -- pnpm validate:data
npm exec --yes --package pnpm@9.15.4 -- pnpm demo:taro
```

## 文档

- [中文 API](docs/api.zh-CN.md)
- [Provider 接入](docs/provider.md)
- [数据与校验](docs/data.md)
- [设计说明](docs/design.md)

## 首版不包含

首版 MVP 不包含真实海外 / 酒店 API、Flutter adapter、uni-app adapter、Android / iOS 原生 SDK、npm 发布和 GitHub Pages 发布自动化。
