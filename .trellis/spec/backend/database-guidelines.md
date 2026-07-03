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
- region data: mainland province/city/county/township hierarchy, plus
  Hong Kong / Macau / Taiwan variable-depth paths.
- region manifest: shard key, root codes, counts, level stats, source summary,
  checksum, code-to-shard index, and root region list.
- region shards: mainland records split by province root code, plus a Hong Kong
  / Macau / Taiwan shard.
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
- generated path codes and names are complete,
- mainland administrative code shape is valid for its level,
- pinyin and initials exist,
- hot cities resolve to formal city records,
- generated artifacts can be read by `packages/core`.

Full-region generation must preserve source attribution: source name, source
URL, source type, package version or commit, license notes, data cutoff date,
generation timestamp, generation script version, validation basis, and count
summary. Third-party seeds must be labelled as third-party seeds even when
their upstream data references official public datasets.

## Scenario: Built-In Data Validation Contract

### 1. Scope / Trigger

- Trigger: `packages/data` exports bundled national city / region data and a
  validation command used by tests, providers, demos, and release checks.
- Applies when changing bundled records, hot-city defaults, validation issue
  shape, source metadata, generated artifacts, query helpers, or the
  `validate:data` command.

### 2. Signatures

```ts
type 数据版本信息 = {
  编码: string
  名称: string
}

type 数据来源信息 = {
  来源名称: string
  来源URL: string
  来源类型: "官方源" | "第三方种子"
  许可证?: string
  版本或Commit?: string
  数据截止日期: string
  抓取时间: string
  生成脚本版本: string
  校验依据: readonly string[]
  记录数量: {
    省级: number
    地级: number
    县级: number
    乡级: number
    港澳台: number
  }
}

type 数据校验问题 = {
  代码:
    | "重复编码"
    | "名称为空"
    | "级别非法"
    | "缺少拼音"
    | "缺少首字母"
    | "父级缺失"
    | "层级关系非法"
    | "路径缺失"
    | "路径不一致"
    | "大陆编码非法"
    | "乡级编码非法"
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
const 数据来源: 数据来源信息
const 内置城市列表: readonly 城市[]
const 内置行政区列表: readonly 城市[]
const 热门城市编码: readonly string[]

type 行政区分片信息 = {
  分片键: string
  名称: string
  根编码列表: readonly string[]
  记录数: number
  层级统计: 行政区层级统计
  地区口径?: 地区口径
  checksum: string
}

function 按编码查找行政区(编码: string): 城市 | undefined
function 按父级编码查找行政区(父级编码?: string): 城市[]
function 按级别查找行政区(级别: 行政级别): 城市[]
function 获取行政区路径(编码: string): 城市[]
function 获取行政区分片列表(): readonly 行政区分片信息[]
function 获取行政区分片键列表(): readonly string[]
function 加载行政区分片(分片键: string): Promise<readonly 城市[]>
function 预加载行政区分片(分片键: string): Promise<void>
function 按编码加载行政区(编码: string): Promise<城市 | undefined>
function 按编码加载行政区路径(编码: string): Promise<readonly 城市[]>
function 按父级编码加载行政区子级(父级编码?: string): Promise<readonly 城市[]>
function 校验城市数据(输入: 城市数据校验输入): 数据校验问题[]
function 校验内置数据(): 数据校验问题[]
```

English aliases mirror the Chinese exports:

```ts
const dataVersion: typeof 数据版本
const dataSource: typeof 数据来源
const builtInCities: typeof 内置城市列表
const builtInRegions: typeof 内置行政区列表
const hotCityCodes: typeof 热门城市编码
const findRegionByCode: typeof 按编码查找行政区
const findRegionsByParentCode: typeof 按父级编码查找行政区
const findRegionsByLevel: typeof 按级别查找行政区
const getRegionPath: typeof 获取行政区路径
const listRegionShards: typeof 获取行政区分片列表
const listRegionShardKeys: typeof 获取行政区分片键列表
const loadRegionShard: typeof 加载行政区分片
const prefetchRegionShard: typeof 预加载行政区分片
const loadRegionByCode: typeof 按编码加载行政区
const loadRegionPathByCode: typeof 按编码加载行政区路径
const loadRegionsByParentCode: typeof 按父级编码加载行政区子级
const validateCityData: typeof 校验城市数据
const validateBuiltInData: typeof 校验内置数据
```

Root command:

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm validate:data
npm exec --yes --package pnpm@9.15.4 -- pnpm size:data
npm exec --yes --package pnpm@9.15.4 -- pnpm pack:dry-run
npm exec --yes --package pnpm@9.15.4 -- pnpm release:check
```

### 3. Contracts

- `packages/data` may depend on `@ikalt/city-select-core` public types.
- `packages/core` must not depend on `packages/data`.
- Full data must be generated from committed source snapshots and a deterministic
  script, not hand-maintained as large arrays in `packages/data/src/index.ts`.
- `@ikalt/city-select-data/cities` is the lightweight city/provider entry and
  must not import full region compatibility data.
- `@ikalt/city-select-data/regions` owns lazy region shard access. UI adapters
  and providers must not duplicate shard selection or hierarchy rules.
- Root `@ikalt/city-select-data` may keep `内置行政区列表` and sync region helpers
  for compatibility, but those exports are heavy compatibility because they
  parse the full generated region payload.
- Lazy region loaders return empty arrays for unknown shard/code inputs instead
  of throwing during ordinary lookup.
- `预加载行政区分片` is a semantic prefetch wrapper around the same loader used by
  lazy queries, so preloading and querying cannot diverge.
- `size:data` must report source/generated size, full compatibility size,
  manifest size, shard count, shard total, and largest shard.
- `pack:dry-run` creates a temporary dist-only package staging directory from
  `packages/data/dist` and runs npm dry-run there; it must not publish npm
  packages.
- `release:check` is a publishing readiness gate only; it must not publish npm
  packages.
- Validation returns structured issues and does not throw for ordinary bad
  records.
- `validate:data` compiles TypeScript first, then runs the emitted Node CLI from
  `packages/data/dist/validate-data.js`.
- CLI success prints version, record counts, level counts, source name/source
  type/data cutoff, then exits 0.
- CLI failure prints each structured issue and exits non-zero.
- Hong Kong / Macau / Taiwan records may use variable-depth paths and generated
  stable prefixed codes, but must not collide with mainland numeric codes.
- Village / community / neighborhood committee data is out of scope for the
  first full dataset.

### 4. Validation & Error Matrix

- Duplicate code inside `城市列表` or inside `行政区列表` -> `重复编码`.
- Empty `名称` -> `名称为空`.
- `级别` outside `省 | 市 | 区县 | 乡镇街道` -> `级别非法`.
- Missing `拼音` -> `缺少拼音`.
- Missing `首字母` -> `缺少首字母`.
- Non-province administrative record with missing / unknown `父级编码` ->
  `父级缺失`.
- Illegal mainland parent-child level transition -> `层级关系非法`.
- Missing `路径编码` / `路径名称` -> `路径缺失`.
- Broken path terminal record or missing path code -> `路径不一致`.
- Mainland province/city/county six-digit code shape mismatch ->
  `大陆编码非法`.
- Mainland township/street nine-digit code shape mismatch or invalid prefix ->
  `乡级编码非法`.
- Hot-city code not present in `城市列表` -> `热门城市缺失`.

### 5. Good/Base/Bad Cases

- Good: tests call `校验城市数据` with focused fixtures and the full gate runs
  `validate:data`.
- Base: demos consume public data exports and query helpers directly.
- Bad: adding a new bundled record while only running `vitest` and skipping
  `validate:data`.

### 6. Tests Required

- Bundled exports compile against core `城市` type.
- Bundled data passes `校验内置数据`.
- Duplicate city codes produce `重复编码` with the duplicated code.
- Missing administrative parent links produce `父级缺失` with the child code.
- Broken path records produce `路径缺失` or `路径不一致`.
- Mainland township/street code shape issues produce `乡级编码非法`.
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
  级别: "省" | "市" | "区县" | "乡镇街道"
  行政区类型?: string
  地区口径?: "大陆行政区划" | "香港澳门特别行政区" | "台湾地区"
  路径编码?: readonly string[]
  路径名称?: readonly string[]
  国家代码?: "CN"
}
```

Region selections return paths instead of flattened strings:

```ts
type 行政区选择结果 = {
  编码路径: string[]
  名称路径: string[]
  完整路径: 城市[]
  省?: 城市
  市?: 城市
  区县?: 城市
  乡镇街道?: 城市
}
```

---

## Forbidden Patterns

- Do not maintain parallel hand-edited datasets for TypeScript and Flutter.
- Do not allow tests to pass without running data validation for changed data.
- Do not embed vendor credentials or real remote service data in fixtures.
- Do not rely on `tmp/` reference project data as committed product data.
