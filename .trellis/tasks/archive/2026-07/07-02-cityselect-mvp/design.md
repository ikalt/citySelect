# CitySelect MVP Technical Design

## Architecture

CitySelect is delivered as a layered TypeScript workspace. The core package owns
domain models and deterministic algorithms. The data package owns bundled China
city / region records and validation. The providers package owns async
destination search contracts and degradation metadata. The Taro package owns the
Chinese-first adapter API and UI state mapping. The demo package exercises the
whole stack without requiring any real remote service.

The first-version MVP keeps every layer testable in Node. UI-facing APIs may be
Taro-shaped, but core behavior must remain runnable by Vitest and TypeScript
without Taro, React, DOM, map SDKs, hotel APIs, or secrets.

## Package Boundaries

- `packages/core`: framework-free types, aliases, search index, ranking,
  grouping, recent-selection helpers, and region path helpers. It must not
  import from `packages/data`, `packages/providers`, `packages/taro`, or app
  packages.
- `packages/data`: versioned bundled data and data validators. It may depend on
  core types, but it must not depend on providers or UI packages.
- `packages/providers`: provider contracts and async composition. It may depend
  on core types and data for the local provider. It must not import UI code.
- `packages/taro`: adapter state, props normalization, and Chinese / English API
  aliases. It may depend on core, data, and providers. It must keep ranking and
  provider merging delegated to lower layers.
- `apps/demo-taro`: runnable demo surface and examples. It consumes public
  package APIs only.
- `docs`: Chinese-first usage docs, API notes, provider guide, and data guide.

## Data Flow

Bundled records are authored in `packages/data` as versioned structured arrays.
`packages/data` validates hierarchy integrity and exposes city, region, hot-city,
and demo defaults. `packages/core` receives city records from consumers, builds a
search index, and returns structured `城市` objects and metadata. Providers reuse
the same core search behavior for local city results and combine it with mock
remote destination data. The Taro adapter normalizes Chinese and English props,
creates state snapshots, and emits typed selection events. The demo imports the
adapter and providers to show the MVP flows.

## Public Contracts

- Chinese identifiers are first-class exports where TypeScript supports them:
  `城市`, `行政区选择结果`, `目的地`, `目的地Provider`, and Chinese helper names.
- English aliases mirror the Chinese contracts: `City`, `RegionSelectionResult`,
  `Destination`, `DestinationProvider`, and helper aliases.
- Runtime objects prioritize Chinese fields and include English compatibility
  fields only when they help consumers interoperate.
- Provider results include status metadata so UI can distinguish success, empty,
  timeout, partial failure, and total failure.

## Search And Ranking

Core ranking follows the design baseline:

1. exact Chinese name match
2. Chinese name prefix match
3. pinyin match
4. initials match
5. alias match
6. hot-city weighting
7. recent-selection weighting
8. remote provider results after strong local matches

The MVP uses deterministic numeric scores and stable tie-breakers. Search must
handle trimmed input, lowercase pinyin, uppercase initials, empty keywords, and
missing optional fields.

## Error Handling

Core functions return empty arrays or typed results for expected empty states and
throw only for programmer errors such as invalid region paths. Data validation
returns structured issues so tests and scripts can print actionable messages.
Providers catch source failures, preserve successful source results, and return
degradation metadata instead of throwing for ordinary timeout or partial-failure
cases.

## Demo Strategy

The first demo is intentionally local and deterministic. It proves that the
package graph is usable and that the three target flows exist: city selection,
region selection, and destination search. Real Taro build / platform packaging
is a later hardening step unless the MVP task explicitly installs Taro runtime
dependencies.

## Rollback Notes

Each child task should commit independently. If a later adapter or demo decision
needs to change, core, data, and providers should remain valid because their
contracts are tested separately.
