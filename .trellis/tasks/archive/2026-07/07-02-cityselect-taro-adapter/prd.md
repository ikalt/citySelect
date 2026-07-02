# 实现 CitySelect Taro 适配层

## Goal

Implement the MVP Taro-facing adapter API for city selection, region selection,
and destination search while delegating search, ranking, data, and provider
composition to lower layers.

## Requirements

- Export Chinese-first adapter APIs and English aliases for city, region, and
  destination flows.
- Normalize Chinese and English props into one shared behavior path.
- Expose state snapshots suitable for Taro/React rendering without forcing core
  to import UI dependencies.
- Emit typed selection events with structured city / region / destination
  objects.
- Represent loading, empty, success, error, timeout, and degraded provider
  states distinctly.

## Acceptance Criteria

- [ ] Tests prove Chinese and English props produce identical normalized state.
- [ ] Tests prove selection callbacks receive structured typed objects.
- [ ] Tests prove provider degraded states map to UI-facing state.
- [ ] `packages/taro` does not duplicate core search ranking or provider merge
      rules.
- [ ] Root quality gates pass after adapter changes.

## Notes

- First MVP may keep rendering adapters lightweight as long as the public Taro
  API and state behavior are usable by the demo.
