# 设计说明

CitySelect 使用 Core-first 分层：

```text
packages/core      -> 类型、搜索、分组、最近访问、行政区结果
packages/data      -> 内置城市 / 行政区数据和校验
packages/providers -> 本地 / mock / 组合 provider 和降级状态
packages/taro      -> Taro-facing props / state / event 适配层
apps/demo-taro     -> 可运行 demo 快照
```

核心原则：

- `core` 不依赖 UI、数据包、provider 或远程服务。
- `data` 只负责内置数据和校验。
- `providers` 负责异步搜索、组合和降级状态。
- `taro` 负责中文 / 英文 API 归一化和 UI-facing 状态，不实现搜索排名或 provider 合并。
- demo 使用确定性本地数据和 mock provider，基础测试不依赖网络。

## MVP 边界

首版覆盖国内城市选择、省市区选择、mock 目的地搜索、Taro-facing 适配、demo 和中文文档。

首版不覆盖 Flutter、uni-app、React Native、Android 原生、iOS 原生、真实远程 API、npm 发布和 GitHub Pages 自动部署。
