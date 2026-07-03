# CitySelect

CitySelect 是一个中文优先的跨端城市 / 目的地选择 MVP。当前首版聚焦国内城市选择、全国行政区选择、provider 降级搜索、Taro-facing 适配层和本地 demo，不依赖真实远程服务。

## 当前范围

- `packages/core`：城市类型、搜索索引、搜索排序、A-Z 分组、最近访问、行政区选择结果。
- `packages/data`：全国行政区划生成数据、热门城市、查询 helper、来源元数据和数据校验。
- `packages/providers`：本地城市 provider、模拟目的地 provider、组合 provider、超时 / 失败 / 部分失败状态。
- `packages/taro`：中文优先、英文兼容的 Taro-facing props / state / event 适配层。
- `apps/demo-taro`：可运行的确定性 demo 快照，覆盖城市、省市区、目的地、空态和降级态。

## 快速开始

本仓库在当前环境使用 pnpm fallback：

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm install
npm exec --yes --package pnpm@9.15.4 -- pnpm generate:data
npm exec --yes --package pnpm@9.15.4 -- pnpm size:data
npm exec --yes --package pnpm@9.15.4 -- pnpm test
npm exec --yes --package pnpm@9.15.4 -- pnpm validate:data
npm exec --yes --package pnpm@9.15.4 -- pnpm demo:taro
```

## 数据范围

当前数据版本是 `2026.07-cn-region-full-2023-nbs`：

- `337` 个城市入口，用于热门城市和城市搜索。
- `45111` 条行政区记录。
- 中国大陆覆盖省 / 市 / 区县 / 乡镇街道四级。
- 港澳台包含在全国库中，采用可变深度路径和地区专属 `行政区类型`。
- 第一版不包含村 / 社区 / 居委会第五级。

数据种子来自 `china-division@2.7.0`，作为第三方整理库使用。源快照记录在 `packages/data/source/china-division-2.7.0/`，生成产物记录来源 URL、许可证说明、数据截止日期 `2023-06-30`、层级来源和生成摘要。官方 / 更近第三方源已完成研究，当前因稳定批量入口和覆盖完整性不足暂不替换，详见 [数据与校验](docs/data.md)。

## 数据入口

- `@ikalt/city-select-data/cities`：轻量城市入口，适合城市搜索、热门城市和本地 provider，不解析完整行政区数据。
- `@ikalt/city-select-data/regions`：行政区 lazy 入口，可列出分片、加载省级分片、按编码/父级编码异步取路径或子级，并可预加载用户即将打开的省份。
- `@ikalt/city-select-data`：兼容入口，保留 `内置行政区列表` 和同步查询 helper；这些 API 会解析完整全国行政区数据，属于 heavy compatibility。

发布前检查骨架，`pack:dry-run` 会从已构建的 `packages/data/dist` 生成临时 dist-only 包目录并执行 npm dry-run：

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm pack:dry-run
npm exec --yes --package pnpm@9.15.4 -- pnpm release:check
```

## 文档

- [中文 API](docs/api.zh-CN.md)
- [Provider 接入](docs/provider.md)
- [数据与校验](docs/data.md)
- [设计说明](docs/design.md)

## 首版不包含

首版 MVP 不包含村 / 社区 / 居委会第五级、真实海外 / 酒店 API、Flutter adapter、uni-app adapter、Android / iOS 原生 SDK、npm 发布和 GitHub Pages 发布自动化。
