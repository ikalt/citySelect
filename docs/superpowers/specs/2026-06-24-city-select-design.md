# CitySelect 跨端目的地选择脚手架设计

日期：2026-06-24

## 目标

建设一个中文优先、现代审美、可长期维护的跨端城市/目的地选择脚手架。第一版聚焦国内城市选择与省市区选择，预留海外城市、酒店、机场、地标等远程搜索能力。

目标平台：

- H5
- 微信小程序等小程序平台
- Android App 容器
- iOS App 容器
- Flutter App

第一版采用一套跨端代码覆盖 H5、小程序和 App 容器，技术路线为 Core-first + Taro adapter。核心能力不绑定 React、Taro、DOM 或小程序 API，UI 适配层先实现 Taro，后续补 Flutter adapter 和 uni-app adapter。

Flutter 作为计划支持平台处理：复用同一份数据规范、索引产物、provider 语义和中文 API 设计，但以 Dart/Flutter package 的形式实现 UI 与平台适配，避免把 TypeScript 运行时强行塞进 Flutter。

## 参考项目吸收点

本地 `tmp/` 目录和 GitHub 调研项目仅作为参考，不进入提交。

吸收的能力：

- 定位城市、热门城市、最近访问。
- 中文、拼音、拼音首字母、别名搜索。
- A-Z 分组列表和右侧字母索引。
- 省市区三级联动和移动端底部选择器。
- 数据层和 UI 层分离。
- 自定义主题、深色模式预留、容器化展示。
- provider 形式预留远程目的地搜索。

不沿用的旧实现：

- 旧 Android View/XML 结构。
- Objective-C 单体 UI 实现。
- Zepto、Webpack 4、旧 better-scroll 等 H5 技术栈。
- 只返回城市名、不返回结构化数据的 API。
- 难以更新的内置静态数据。

## 产品范围

第一版核心范围：

- 国内城市选择：`city` 模式。
- 省市区选择：`region` 模式。
- 中文 API 一等公民。
- 内置基础数据和更新脚本。
- Taro + React UI adapter。
- 可运行 demo app。
- mock 目的地 provider，演示海外/酒店/机场/地标搜索的接口形态。

第一版不做：

- 真实海外酒店 API 接入。
- Flutter Widget package。
- Android Kotlin/Compose 原生 SDK。
- iOS SwiftUI 原生 SDK。
- 全平台原生发布流程自动化。

## 仓库结构

```text
packages/core
packages/data
packages/providers
packages/taro
packages/flutter_city_select
apps/demo-taro
apps/demo-flutter
scripts
docs
```

职责划分：

- `packages/core`：数据模型、搜索引擎、拼音/首字母索引、分组排序、最近访问、选择状态机。
- `packages/data`：内置国内省/市/区基础数据，输出 city 和 region 两种数据格式。
- `packages/providers`：目的地 provider 协议、mock provider、本地城市 provider、组合 provider。
- `packages/taro`：Taro + React UI adapter，提供城市选择器、省市区选择器、目的地搜索组件。
- `packages/flutter_city_select`：计划中的 Flutter adapter，提供 Dart 模型、Flutter Widget、provider 桥接和主题映射。
- `apps/demo-taro`：展示 H5、小程序、Android、iOS 共用体验。
- `apps/demo-flutter`：计划中的 Flutter 示例应用，展示 Android/iOS Flutter 体验。
- `scripts`：数据更新、数据校验、索引生成、包体报告。
- `docs`：中文优先文档、API、provider、数据说明和设计记录。

核心原则：

- `core` 不依赖任何 UI 框架。
- `taro` 只处理界面、手势、动画、安全区和平台差异。
- `flutter_city_select` 不复刻业务规则，优先消费 `data` 生成的 JSON/Dart 产物，并保持与 `core` 一致的搜索语义。
- provider 接口与 UI 解耦。
- 国内城市默认离线可用。
- 海外/酒店搜索通过 provider 扩展。

## 功能设计

### CitySelect

默认主入口，面向美团、携程、飞猪等目的地选择场景。

能力：

- 顶部搜索框。
- 当前定位城市。
- 最近访问城市，默认最多 6 个。
- 热门城市。
- A-Z 城市分组。
- 右侧字母索引。
- 触摸索引时显示字母浮层。
- 中文、拼音、首字母、别名搜索。
- 选择后返回完整结构化对象。

返回对象示例：

```ts
type 城市 = {
  编码: string
  名称: string
  省份名称?: string
  拼音?: string
  首字母?: string
  级别: "省" | "市" | "区县"
  国家代码?: "CN"
}

type City = 城市
```

### RegionSelect

用于地址表单和省市区选择。

能力：

- 省市二级模式。
- 省市区三级模式。
- 底部 sheet 展示。
- 列表或滚轮式选择体验。
- 返回编码路径和中文名称路径。

返回对象示例：

```ts
type 行政区选择结果 = {
  编码路径: string[]
  名称路径: string[]
  省?: 城市
  市?: 城市
  区县?: 城市
}
```

### DestinationSearch

用于预留携程式目的地搜索能力。

第一版接入 mock/local provider，不接真实海外酒店 API。

支持结果类型：

- 城市
- 行政区
- 酒店
- 机场
- 地标

mock 示例应使用中文展示，例如：

- 东京酒店
- 新加坡樟宜机场
- 曼谷市中心
- 首尔明洞

## 中文 API 设计

中文 API 是一等公民，英文 API 作为生态兼容别名。

中文组件示例：

```tsx
<城市选择器
  热门城市={["北京", "上海", "深圳", "杭州"]}
  最近访问上限={6}
  启用拼音搜索
  启用首字母搜索
  on选择={(城市) => {
    console.log(城市.名称, 城市.编码)
  }}
/>
```

英文兼容示例：

```tsx
<CitySelect
  hotCities={["北京", "上海", "深圳", "杭州"]}
  recentLimit={6}
  enablePinyinSearch
  enableInitialSearch
  onSelect={(city) => {
    console.log(city.name, city.code)
  }}
/>
```

字段策略：

- 文档优先展示中文字段。
- TypeScript 导出中文类型名和英文类型别名。
- 运行时对象优先包含中文字段。
- 英文字段可以通过 mapper 或兼容 getter 提供。
- Flutter adapter 同样提供中文优先文档、中文语义配置和 Dart 类型别名；若具体 Dart 发布工具链对中文标识符存在限制，则保留英文稳定导出，并提供中文 helper、中文注释和中文示例作为一等入口。

## Provider 设计

```ts
type 目的地类型 = "城市" | "行政区" | "酒店" | "机场" | "地标"

type 目的地 = {
  类型: 目的地类型
  编码: string
  名称: string
  副标题?: string
  国家?: string
  城市?: string
  经度?: number
  纬度?: number
}

type 目的地Provider = {
  搜索(关键词: string): Promise<目的地[]>
  获取热门?(): Promise<目的地[]>
  获取定位城市?(): Promise<城市 | null>
}
```

内置 provider：

- `本地城市Provider`：搜索内置国内城市数据。
- `模拟目的地Provider`：返回中文 mock 海外目的地。
- `组合Provider`：合并本地和远程结果，处理排序、分组和错误降级。

远程 provider 约束：

- 不在核心包硬编码任何地图或酒店服务商。
- 不在仓库中保存密钥。
- provider 接口必须能处理超时、失败和空结果。
- 远程结果排在本地强匹配之后。

## 数据设计

数据策略：内置基础数据 + 提供更新脚本。

数据包包含：

- `city` 数据：省/市，带编码、拼音、首字母、热门标记。
- `region` 数据：省/市/区县三级。
- 搜索索引：名称、拼音、首字母、别名。
- A-Z 分组索引。
- 数据版本，例如 `2026.06-cn-region`。
- Flutter/Dart 产物：生成 Dart model、常量索引或压缩 JSON asset，供 Flutter adapter 使用。

数据校验：

- 编码唯一。
- 名称非空。
- 层级合法。
- 父子关系完整。
- 拼音和首字母存在。
- 热门城市必须能匹配到正式城市。

搜索排序：

1. 精确名称匹配。
2. 名称前缀匹配。
3. 拼音匹配。
4. 首字母匹配。
5. 别名匹配。
6. 热门城市加权。
7. 最近访问加权。
8. provider 远程结果。

## UI 设计

默认 demo 风格为旅行 App 质感 + 系统组件克制感。

视觉要求：

- 浅色为主，使用轻微天空蓝、薄荷绿、暖白过渡。
- 组件本体不绑定强品牌。
- 主列表高效扫描，不堆叠装饰卡片。
- 热门城市和最近访问使用轻量 chip。
- 图标统一线性风格。
- 主色偏清爽青蓝，避免紫色默认风。

主题 token：

```ts
type CitySelectTheme = {
  color: {
    brand: string
    surface: string
    surfaceElevated: string
    text: string
    textMuted: string
    border: string
    accent: string
    danger: string
  }
  radius: {
    sm: number
    md: number
    lg: number
    sheet: number
  }
  motion: {
    durationFast: number
    durationBase: number
    easingStandard: string
  }
}
```

交互状态：

- 定位：`idle`、`locating`、`success`、`failed`、`disabled`。
- 搜索：默认态、输入态、加载态、结果态、空态、错误态。
- provider：成功、部分失败、全部失败、超时。
- 选择器：打开、关闭、选择中、已选择、取消。

动效：

- sheet 上滑进入，约 220ms。
- 搜索结果 150ms crossfade。
- 字母浮层 scale + fade。
- reduced-motion 下关闭非必要动画。

可访问性：

- 文本对比度满足 WCAG AA。
- 触摸目标不小于 44px。
- 图标按钮必须有可访问标签。
- 搜索输入有明确 label 或 placeholder。
- 长城市名不能挤爆容器。

## 测试策略

`core`：

- 搜索排序。
- 中文、拼音、首字母、别名匹配。
- 最近访问。
- A-Z 分组。
- provider 合并。
- 错误降级。

`data`：

- 编码唯一。
- 层级完整。
- 父子关系正确。
- 拼音和首字母完整。
- 生成产物可被 core 读取。

`providers`：

- mock provider。
- 本地城市 provider。
- 组合 provider。
- 超时、空结果和失败降级。

`taro`：

- 中文 props 映射。
- 英文 props 兼容。
- 状态渲染。
- 选择事件。
- 空态和错误态。

`flutter_city_select`：

- Dart 模型和 JSON asset 读取。
- 中文语义配置和英文兼容 API。
- 城市选择、区域选择、目的地搜索 Widget 状态。
- provider 桥接、错误态和空态。
- Android/iOS 安全区、键盘和滚动行为。

`demo`：

- H5 构建。
- 移动端首屏截图。
- 搜索态截图。
- 空态截图。
- 后续补小程序和 App 构建验证。
- Flutter 阶段补 Android/iOS demo 构建验证。

## 发布策略

第一阶段：

- GitHub 可运行脚手架。
- 中文 README。
- H5 demo 可运行。
- 不急于发布 npm。

第二阶段：

- 发布 npm 包：
  - `@ikalt/city-select-core`
  - `@ikalt/city-select-data`
  - `@ikalt/city-select-providers`
  - `@ikalt/city-select-taro`

第三阶段：

- 补 Flutter adapter：
  - `city_select_flutter`
- 补 uni-app adapter：
  - `@ikalt/city-select-uni`

## 文档计划

- `README.md`：中文优先，项目定位、特性、快速开始、示例截图。
- `docs/design.md`：设计理念和参考项目吸收点。
- `docs/api.zh-CN.md`：中文 API。
- `docs/provider.md`：目的地 provider 接入。
- `docs/data.md`：数据来源、更新脚本、版本策略。
- `docs/flutter.md`：Flutter adapter 使用方式、中文 API、主题映射和 provider 接入。

## 质量门禁

- TypeScript strict。
- ESLint + Prettier。
- Vitest。
- 数据校验脚本。
- commit 前运行相关测试。
- `tmp/` 必须保持未提交。
- 不硬编码密钥。
- 不依赖真实远程服务完成基础测试。

## 后续实施顺序

1. 初始化 pnpm workspace 和基础工具链。
2. 实现 `packages/core` 类型、搜索和索引。
3. 实现 `packages/data` 基础数据和校验脚本。
4. 实现 `packages/providers` 协议与 mock/local provider。
5. 实现 `packages/taro` 中文优先组件 API。
6. 实现 `apps/demo-taro`。
7. 补中文文档、截图和发布说明。
8. 后续实现 `packages/flutter_city_select` 和 `apps/demo-flutter`。

## 未纳入第一版的后续方向

- 接入真实酒店/海外目的地 provider。
- Flutter adapter。
- uni-app adapter。
- React Native adapter。
- Android Kotlin/Compose 原生 SDK。
- iOS SwiftUI 原生 SDK。
- 自动化 npm release 和 GitHub Pages demo。
