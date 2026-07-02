# 设计说明

CitySelect 使用 Core-first 分层：

```text
packages/core      -> 类型、搜索、分组、最近访问、行政区结果
packages/data      -> 源快照、生成脚本、全国行政区数据、查询 helper 和校验
packages/providers -> 本地 / mock / 组合 provider 和降级状态
packages/taro      -> Taro-facing props / state / event 适配层
apps/demo-taro     -> 可运行 demo 快照
```

核心原则：

- `core` 不依赖 UI、数据包、provider 或远程服务。
- `data` 负责源快照、生成产物、来源元数据、查询 helper 和校验。
- `providers` 负责异步搜索、组合和降级状态。
- `taro` 负责中文 / 英文 API 归一化和 UI-facing 状态，不实现搜索排名或 provider 合并。
- demo 使用确定性本地数据和 mock provider，基础测试不依赖网络。

## 数据流

```text
source snapshot -> generate:data -> generated regions.ts -> data public API
      -> core selection/search helpers -> providers / taro / demo
```

`packages/core` 只定义通用类型和框架无关行为。`packages/data` 从源快照生成 `城市` 记录，补齐拼音、首字母、父级编码、路径编码、路径名称、地区口径和来源元数据。`packages/taro` 通过 `编码路径` 组装选择状态，不重新实现层级规则。

## 数据模型

行政区级别为：

```ts
type 行政级别 = "省" | "市" | "区县" | "乡镇街道"
type 地区口径 = "大陆行政区划" | "香港澳门特别行政区" | "台湾地区"
```

大陆记录覆盖四级，乡级使用九位编码。港澳台记录允许可变深度，通过 `地区口径` 和 `行政区类型` 表达地区专属层级，并通过 `路径编码` / `路径名称` 做稳定展示。

## 数据范围

当前版本 `2026.07-cn-region-full-2023-nbs` 包含：

- `337` 个城市入口。
- `45111` 条行政区记录。
- 大陆省级 `31`、地级 `342`、县级 `2975`、乡镇街道 `41352`。
- 港澳台 `411` 条。

数据种子来自 `china-division@2.7.0`，以第三方种子记录，数据截止日期 `2023-06-30`。第一版不包含村 / 社区 / 居委会第五级。

## MVP 边界

首版覆盖国内城市选择、全国行政区选择、mock 目的地搜索、Taro-facing 适配、demo 和中文文档。

首版不覆盖村 / 社区 / 居委会第五级、Flutter、uni-app、React Native、Android 原生、iOS 原生、真实远程 API、npm 发布和 GitHub Pages 自动部署。
