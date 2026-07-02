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
