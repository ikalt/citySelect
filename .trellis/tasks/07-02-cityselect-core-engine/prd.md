# 实现 CitySelect core 搜索与选择引擎

## Goal

Implement the framework-free `@ikalt/city-select-core` engine that downstream
data, provider, Taro adapter, and demo work can depend on. The package must
provide Chinese-first domain types, deterministic city search, A-Z grouping,
recent-selection helpers, and region path helpers without importing UI,
provider, or bundled data packages.

## Requirements

- R1. Export Chinese-first city, region, destination, and selection types with
  English aliases.
- R2. Build a city search index from caller-provided city records.
- R3. Search by Chinese name, pinyin, pinyin initials, and aliases.
- R4. Rank results deterministically by exact match, prefix match, pinyin,
  initials, alias, hot-city weighting, recent weighting, and stable tie-breaks.
- R5. Group city records by A-Z initials for indexed city lists.
- R6. Provide recent-selection helpers that deduplicate by city code, keep the
  newest selection first, and enforce a configurable limit.
- R7. Provide region path helpers for province / city / district hierarchy
  selection results.
- R8. Keep `packages/core` framework-free and independent from `packages/data`,
  `packages/providers`, `packages/taro`, and app packages.

## Acceptance Criteria

- [ ] `packages/core/src/index.test.ts` covers exact Chinese name search,
      prefix search, pinyin search, initials search, alias search, hot-city
      weighting, recent weighting, A-Z grouping, recent deduplication, and
      region path selection.
- [ ] `packages/core/src/index.ts` exports Chinese names and English aliases for
      public types and helpers.
- [ ] Empty search input returns default ranked city results rather than
      throwing.
- [ ] Unknown search input returns an empty result list.
- [ ] The package has no imports from UI, provider, data, app, DOM, React, Taro,
      or network libraries.
- [ ] Targeted core tests pass.
- [ ] Root `test` and `typecheck` pass after the core change.

## Notes

- This child intentionally uses inline fixtures in tests. Bundled production
  city data belongs to the later `cityselect-data-validation` child task.
