# Component Guidelines

> How CitySelect UI components are designed and implemented.

---

## Overview

Components should feel like a modern travel app while staying reusable and
brand-neutral. They must expose Chinese-first APIs with English compatibility
aliases and structured selection results.

First-release public components:

- `城市选择器` / `CitySelect`,
- `省市区选择器` or `区域选择器` / `RegionSelect`,
- `目的地搜索` / `DestinationSearch`.

---

## Component Structure

Each component should separate:

- public props and events,
- mapping between Chinese props and English aliases,
- state orchestration,
- framework/platform rendering,
- theme token consumption.

Keep pure transforms in `packages/core` or `packages/providers`.

## Scenario: Taro Adapter State Contract

### 1. Scope / Trigger

- Trigger: `packages/taro` exposes the MVP Taro-facing API before the full
  renderer/demo layer exists.
- Applies when changing city selector, region selector, destination search,
  Chinese/English prop mapping, or selection event contracts.

### 2. Signatures

```ts
type 城市选择器Props = {
  搜索关键词?: string
  热门城市?: readonly string[]
  最近访问上限?: number
  启用拼音搜索?: boolean
  启用首字母搜索?: boolean
  on选择?: (城市: 城市) => void
  keyword?: string
  hotCities?: readonly string[]
  recentLimit?: number
  enablePinyinSearch?: boolean
  enableInitialSearch?: boolean
  onSelect?: (city: 城市) => void
}

function 创建城市选择器状态(props?: 城市选择器Props): 城市选择器状态
function 触发城市选择(状态: 城市选择器状态, 城市: 城市): void

function 创建省市区选择器状态(props?: 省市区选择器Props): 省市区选择器状态
function 触发行政区选择(状态: 省市区选择器状态): void

function 映射目的地搜索状态(response: ProviderSearchResponse): 目的地搜索状态
```

Public alias objects share one behavior path:

```ts
const 城市选择器 = { createState: 创建城市选择器状态, triggerSelect: 触发城市选择 }
const CitySelect = 城市选择器
const 省市区选择器 = { createState: 创建省市区选择器状态, triggerSelect: 触发行政区选择 }
const RegionSelect = 省市区选择器
const 目的地搜索 = { mapState: 映射目的地搜索状态 }
const DestinationSearch = 目的地搜索
```

### 3. Contracts

- Chinese props win when both Chinese and English aliases are present.
- English aliases normalize into the same state path; do not fork
  implementations.
- Selection callbacks receive structured `城市` or `行政区选择结果` objects.
- Destination search state maps provider status distinctly: `成功`, `空`,
  `部分失败`, `全部失败`, `超时`, and `加载中`.
- Adapter code may consume core/data/providers, but must not reimplement search
  ranking, region hierarchy, or provider merging.

### 4. Validation & Error Matrix

- Empty city keyword -> city state `默认`.
- Unmatched city keyword -> city state `空`.
- Matched city keyword -> city state `结果`.
- Invalid or incomplete region code path -> no `选择结果`.
- Provider `部分失败` -> UI error hint `部分结果暂不可用`.
- Provider `超时` -> UI error hint `搜索超时，请稍后重试`.

### 5. Good/Base/Bad Cases

- Good: `CitySelect.createState({ keyword: "hz" })` equals
  `创建城市选择器状态({ 搜索关键词: "hz" })`.
- Base: demo consumes state snapshots without a full platform renderer.
- Bad: a Taro hook computes pinyin ranking instead of using `packages/core`.

### 6. Tests Required

- Chinese and English city props produce identical state.
- Chinese component names and English aliases reference the same helper
  functions.
- City and region selection callbacks receive structured objects.
- Provider degraded states map to distinct UI-facing states.

### 7. Wrong vs Correct

#### Wrong

```ts
export function CitySelect(props: EnglishProps) {
  return searchByPinyin(props.keyword)
}
```

This forks English behavior and moves ranking into the UI adapter.

#### Correct

```ts
const state = 创建城市选择器状态({ 搜索关键词: "hz" })
```

One normalized state path owns adapter behavior; core owns ranking.

---

## Props Conventions

- Chinese props are primary in docs and examples.
- English props are compatibility aliases with the same behavior.
- Selection callbacks return structured objects, not only display strings.
- Boolean props should express behavior clearly, for example
  `启用拼音搜索` / `enablePinyinSearch`.
- Numeric limits should have documented defaults, for example recent cities
  default to 6.

---

## Interaction States

Components should account for these states from the design baseline:

- location: `idle`, `locating`, `success`, `failed`, `disabled`;
- search: default, input, loading, results, empty, error;
- provider: success, partial failure, all failed, timeout;
- selector: open, closed, selecting, selected, cancelled.

Do not collapse empty, error, and timeout into the same UI state.

---

## Styling Patterns

Default style:

- light-first,
- subtle sky blue, mint, and warm white accents,
- clean list scanning over decorative cards,
- lightweight chips for hot and recent cities,
- linear icon style,
- fresh cyan-blue primary color,
- avoid default purple-heavy palettes.

Theme tokens follow:

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

---

## Motion

- Sheet entrance: about 220ms upward motion.
- Search result transition: about 150ms crossfade.
- Letter overlay: scale + fade.
- Respect reduced-motion by disabling non-essential animation.

---

## Accessibility

- Text contrast must meet WCAG AA.
- Touch targets must be at least 44px.
- Icon buttons need accessible labels.
- Search input needs a clear label or placeholder.
- Long city names must not overflow their containers.

---

## Examples

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

---

## Forbidden Patterns

- Do not return only a city name from selection events.
- Do not bury provider calls inside presentational child components.
- Do not use oversized decorative card layouts for the main city list.
- Do not hard-code a brand identity into the base package.
