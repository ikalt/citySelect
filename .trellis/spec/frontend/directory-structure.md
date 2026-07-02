# Directory Structure

> How Taro UI adapter and demo code are organized.

---

## Overview

Frontend code starts with `packages/taro` and `apps/demo-taro`. Flutter files
are planned but not part of the first release implementation.

UI code must not own search ranking, city data, provider merging, or region
hierarchy rules. It adapts the framework and platform surface around core
capabilities.

---

## Directory Layout

```text
packages/taro
apps/demo-taro
packages/flutter_city_select
apps/demo-flutter
```

Expected responsibilities:

- `packages/taro`: Taro + React components, theme tokens, platform adapters,
  safe-area/gesture behavior, and public UI exports.
- `apps/demo-taro`: runnable H5/mini-program/app-container demo and screenshots.
- `packages/flutter_city_select`: later Dart/Flutter adapter consuming generated
  data artifacts and matching provider semantics.
- `apps/demo-flutter`: later Flutter demo app.

---

## Module Organization

Within `packages/taro`, group by public capability:

- city selector,
- region selector,
- destination search,
- shared theme,
- shared UI primitives,
- platform utilities.

Keep adapters thin. When a component needs derived data, add or reuse a core
function instead of computing business rules inside JSX.

---

## Naming Conventions

- Public Chinese components are first-class exports, for example `城市选择器`.
- English aliases such as `CitySelect` are compatibility exports, not separate
  implementations.
- Hook files use `use-*` naming in English filenames even when exposed values
  include Chinese API fields.
- Theme and token files should be shared across components, not duplicated.

---

## Examples

Chinese-first component API from the design baseline:

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

English compatibility alias:

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

---

## Forbidden Patterns

- Do not fork Chinese and English components into separate behavior paths.
- Do not place search ranking or provider merging logic in components.
- Do not commit generated screenshots or assets from `tmp` reference projects.
- Do not make the demo depend on a real remote travel provider.
