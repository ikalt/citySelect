# Data Package Design

## Scope

`packages/data` owns the MVP bundled China city / region dataset and its
validation contract. It consumes core public types, but core must never consume
data. The dataset is intentionally small but representative enough for city
selection, region selection, provider search, and demo flows.

## Public API

- `数据版本` / `dataVersion`: stable version metadata for bundled records.
- `内置城市列表` / `builtInCities`: city-mode records for search and hot cities.
- `内置行政区列表` / `builtInRegions`: province / city / district hierarchy.
- `热门城市编码` / `hotCityCodes`: stable city-code list for demo defaults.
- `校验城市数据` / `validateCityData`: reusable validator for tests and scripts.
- `校验内置数据` / `validateBuiltInData`: validates bundled MVP data.

## Dataset Shape

The MVP dataset includes major domestic demo cities and a small hierarchy for
province / city / district selection. Records use core's `城市` type and preserve
Chinese runtime fields such as `编码`, `名称`, `拼音`, `首字母`, `级别`,
`父级编码`, `省份名称`, and `热门`.

## Validation

Validation returns structured issues instead of throwing so tests can assert
specific failure classes. The CLI wrapper prints issues and exits non-zero only
when validation fails.

Validator issue codes:

- `重复编码`
- `名称为空`
- `级别非法`
- `缺少拼音`
- `缺少首字母`
- `父级缺失`
- `热门城市缺失`

## Command Strategy

Root `validate:data` first compiles TypeScript through the existing project
compiler, then runs the emitted Node CLI. This avoids adding a TS runtime
dependency just for validation.
