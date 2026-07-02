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

## Scenario: Built-In Data Validation Contract

### 1. Scope / Trigger

- Trigger: `packages/data` exports bundled MVP city / region data and a
  validation command used by tests, providers, demos, and release checks.
- Applies when changing bundled records, hot-city defaults, validation issue
  shape, or the `validate:data` command.

### 2. Signatures

```ts
type 数据版本信息 = {
  编码: string
  名称: string
}

type 数据校验问题 = {
  代码:
    | "重复编码"
    | "名称为空"
    | "级别非法"
    | "缺少拼音"
    | "缺少首字母"
    | "父级缺失"
    | "热门城市缺失"
  编码?: string
  消息: string
}

type 城市数据校验输入 = {
  城市列表: readonly 城市[]
  行政区列表: readonly 城市[]
  热门城市编码: readonly string[]
}

const 数据版本: 数据版本信息
const 内置城市列表: readonly 城市[]
const 内置行政区列表: readonly 城市[]
const 热门城市编码: readonly string[]

function 校验城市数据(输入: 城市数据校验输入): 数据校验问题[]
function 校验内置数据(): 数据校验问题[]
```

English aliases mirror the Chinese exports:

```ts
const dataVersion: typeof 数据版本
const builtInCities: typeof 内置城市列表
const builtInRegions: typeof 内置行政区列表
const hotCityCodes: typeof 热门城市编码
const validateCityData: typeof 校验城市数据
const validateBuiltInData: typeof 校验内置数据
```

Root command:

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm validate:data
```

### 3. Contracts

- `packages/data` may depend on `@ikalt/city-select-core` public types.
- `packages/core` must not depend on `packages/data`.
- Validation returns structured issues and does not throw for ordinary bad
  records.
- `validate:data` compiles TypeScript first, then runs the emitted Node CLI from
  `packages/data/dist/validate-data.js`.
- CLI success prints version and record counts, then exits 0.
- CLI failure prints each structured issue and exits non-zero.

### 4. Validation & Error Matrix

- Duplicate code inside `城市列表` or inside `行政区列表` -> `重复编码`.
- Empty `名称` -> `名称为空`.
- `级别` outside `省 | 市 | 区县` -> `级别非法`.
- Missing `拼音` -> `缺少拼音`.
- Missing `首字母` -> `缺少首字母`.
- Non-province administrative record with missing / unknown `父级编码` ->
  `父级缺失`.
- Hot-city code not present in `城市列表` -> `热门城市缺失`.

### 5. Good/Base/Bad Cases

- Good: tests call `校验城市数据` with focused fixtures and the full gate runs
  `validate:data`.
- Base: demos consume `内置城市列表`, `内置行政区列表`, and `热门城市编码` directly.
- Bad: adding a new bundled record while only running `vitest` and skipping
  `validate:data`.

### 6. Tests Required

- Bundled exports compile against core `城市` type.
- Bundled data passes `校验内置数据`.
- Duplicate city codes produce `重复编码` with the duplicated code.
- Missing administrative parent links produce `父级缺失` with the child code.
- Missing hot-city references produce `热门城市缺失`.
- `validate:data` exits 0 for the committed bundled dataset.

### 7. Wrong vs Correct

#### Wrong

```ts
export const 热门城市编码 = ["110000", "999999"]
```

This allows a UI chip to point at a city that cannot be selected.

#### Correct

```ts
const 问题列表 = 校验内置数据()
if (问题列表.length > 0) process.exitCode = 1
```

Validation owns data integrity before providers, adapters, or demos consume the
records.

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
