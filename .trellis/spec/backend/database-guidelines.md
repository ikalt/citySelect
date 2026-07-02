# Database Guidelines

> How data and generated artifacts are handled in this project.

---

## Overview

CitySelect has no application database in the first release. The persisted
source of truth is the built-in city/region dataset plus generated search and
grouping artifacts under `packages/data`.

Treat data artifacts with the same discipline as database schema:

- source records must be reviewable,
- generated outputs must be reproducible,
- validation must fail before invalid data ships.

---

## Data Ownership

- `packages/data` owns built-in China city and region data.
- `packages/core` consumes normalized data and must not know how it is stored.
- `packages/providers` can wrap local data with provider semantics but should
  not duplicate the data source.
- Flutter support should consume JSON/Dart artifacts generated from the same
  data source, not a hand-maintained second dataset.

---

## Generated Artifacts

Generate these artifacts from source data:

- city data: province/city records with code, name, pinyin, initials, and hot
  city markers.
- region data: province/city/district hierarchy.
- search index: name, pinyin, initials, and aliases.
- A-Z group index.
- data version metadata such as `2026.06-cn-region`.
- Flutter/Dart model, constant index, or compressed JSON asset outputs when
  Flutter work begins.

Generated files must be deterministic. If generation is not deterministic,
fix the generator before committing artifacts.

---

## Validation Rules

Every data generation or update path must validate:

- codes are unique,
- names are non-empty,
- levels are legal,
- parent-child relationships are complete,
- pinyin and initials exist,
- hot cities resolve to formal city records,
- generated artifacts can be read by `packages/core`.

---

## Examples

Data records should preserve Chinese-first runtime fields and structured
hierarchy:

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
```

Region selections return paths instead of flattened strings:

```ts
type 行政区选择结果 = {
  编码路径: string[]
  名称路径: string[]
  省?: 城市
  市?: 城市
  区县?: 城市
}
```

---

## Forbidden Patterns

- Do not maintain parallel hand-edited datasets for TypeScript and Flutter.
- Do not allow tests to pass without running data validation for changed data.
- Do not embed vendor credentials or real remote service data in fixtures.
- Do not rely on `tmp/` reference project data as committed product data.
