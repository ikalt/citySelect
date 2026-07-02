# Core Engine Design

## Scope

`packages/core` owns pure TypeScript domain contracts and deterministic helper
functions. It accepts caller-provided data and never reaches into bundled data
or UI packages. This keeps the search engine reusable by providers, Taro, demos,
and future adapters.

## Public API

- Domain types: `城市`, `City`, `行政级别`, `AdministrativeLevel`,
  `行政区选择结果`, `RegionSelectionResult`, `目的地`, `Destination`.
- Search helpers: `创建城市搜索索引`, `createCitySearchIndex`, `搜索城市`,
  `searchCities`.
- Grouping helpers: `按首字母分组城市`, `groupCitiesByInitial`.
- Recent helpers: `更新最近访问城市`, `updateRecentCities`.
- Region helpers: `创建行政区选择结果`, `createRegionSelectionResult`.

## Ranking

`搜索城市` normalizes the keyword and calculates a numeric score per city:

- exact name match: strongest
- name prefix: stronger than pinyin / initials
- pinyin prefix or contains match
- initials prefix or exact match
- alias exact / prefix / contains match
- hot-city boost
- recent-city boost based on supplied recent code order

Results sort by descending score, then hot flag, then city initial, then city
code. Empty keywords return all cities with hot and recent weighting. Unknown
keywords return an empty list.

## Region Helpers

The region helper receives a selected path of `城市` records and produces code
and name paths plus province / city / district slots. It validates that the path
is non-empty and at most three levels because the MVP only supports province /
city / district.

## Error Handling

Search and grouping tolerate optional fields. Region path creation throws
`RangeError` for empty or too-long paths because those are caller programming
errors. Recent helpers never throw for ordinary empty input.

## Test Strategy

Tests use inline city fixtures to keep core independent from data. The later data
task will prove bundled records satisfy the same type contract.
