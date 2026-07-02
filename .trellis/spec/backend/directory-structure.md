# Directory Structure

> How non-UI TypeScript code is organized in this project.

---

## Overview

CitySelect is Core-first. Business rules live outside UI adapters so they can
be shared by Taro, future Flutter assets, and future uni-app adapters.

The first implementation should create the package layout described in the
design document, then keep package boundaries strict.

---

## Directory Layout

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

For this backend spec layer, use:

- `packages/core` for framework-free models, search, grouping, index helpers,
  recent-selection logic, and selection state machines.
- `packages/data` for source data, generated city/region JSON, generated
  indexes, data version metadata, and Dart/Flutter asset outputs.
- `packages/providers` for provider interfaces and built-in providers:
  local city provider, mock destination provider, and composed provider.
- `scripts` for data update, data validation, index generation, and bundle
  reporting.
- `docs` for API, data, provider, and design documentation.

---

## Module Organization

Keep rules in the lowest framework-free layer that can own them:

- Search ranking, pinyin/initial matching, A-Z grouping, and recent weighting
  belong in `packages/core`.
- City/region source records and generated artifacts belong in `packages/data`.
- Async destination lookup, timeout, partial failure, and remote/local merging
  belong in `packages/providers`.
- UI gestures, sheet behavior, safe area handling, and rendering belong outside
  this layer, primarily in `packages/taro`.

If logic must be shared by Taro and Flutter, it does not belong in a React hook
or Taro component.

---

## Naming Conventions

- Package folders use kebab/lowercase names already defined by the design
  baseline.
- TypeScript source files should use descriptive English filenames such as
  `search-index.ts`, `recent-selections.ts`, or `composed-provider.ts`.
- Public API types may use Chinese identifiers with English aliases when the
  design requires Chinese-first API ergonomics.
- Generated data files should include their purpose and version where useful,
  for example `city.2026.06-cn-region.json`.

---

## Examples

Current examples live in the design baseline until packages are implemented:

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

Provider contracts also belong in the non-UI layer:

```ts
type 目的地Provider = {
  搜索(关键词: string): Promise<目的地[]>
  获取热门?(): Promise<目的地[]>
  获取定位城市?(): Promise<城市 | null>
}
```

---

## Forbidden Patterns

- Do not import React, Taro, DOM, mini-program APIs, or Flutter runtime code
  into `packages/core`.
- Do not copy source from `tmp/` into product packages.
- Do not hard-code a map, hotel, or travel vendor inside `core`.
- Do not return only city names from public APIs; return structured objects.
