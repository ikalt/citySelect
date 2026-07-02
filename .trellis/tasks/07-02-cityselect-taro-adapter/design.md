# Taro Adapter Design

## Scope

`packages/taro` exposes the MVP Taro-facing API surface for city selection,
region selection, and destination search. For this first runnable MVP, the
adapter is a pure TypeScript state and props layer: it provides names, aliases,
normalization, state snapshots, and event helpers that a Taro/React renderer or
demo can consume. It does not duplicate core ranking, data hierarchy, or
provider composition logic.

## Public API

- City selector: `城市选择器`, `CitySelect`, `创建城市选择器状态`,
  `createCitySelectState`, `触发城市选择`, `triggerCitySelect`.
- Region selector: `省市区选择器`, `RegionSelect`, `创建省市区选择器状态`,
  `createRegionSelectState`, `触发行政区选择`, `triggerRegionSelect`.
- Destination search: `目的地搜索`, `DestinationSearch`,
  `映射目的地搜索状态`, `mapDestinationSearchState`.
- Props: Chinese-first props and English aliases normalize into one internal
  shape.

## Data Flow

City selector props normalize hot-city and recent limits, then use `core` and
`data` for search and grouping. Region selector uses `data` records and `core`
region result helpers. Destination search maps `providers` structured responses
into UI states without catching raw provider details.

## State Model

UI-facing state uses discriminated status strings:

- city search: `默认`, `结果`, `空`
- destination/provider: `加载中`, `成功`, `空`, `部分失败`, `全部失败`, `超时`
- selector: state snapshots contain selected structured objects, not display
  strings.

## Alias Strategy

Chinese props are primary. English props are compatibility aliases that normalize
to the same internal fields. When both Chinese and English versions are present,
Chinese props win.

## Test Strategy

Tests prove Chinese and English props produce identical normalized state,
selection callbacks receive structured objects, degraded provider responses map
to distinct UI states, and the adapter imports lower-layer helpers instead of
reimplementing search/provider logic.
