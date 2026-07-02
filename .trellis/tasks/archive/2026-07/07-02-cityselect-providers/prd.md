# 实现 CitySelect providers

## Goal

Implement provider contracts and built-in providers for local city search, mock
destination search, and composed degraded search behavior.

## Requirements

- Export Chinese-first provider and destination types with English aliases.
- Implement a local city provider that searches bundled domestic city data
  through `packages/core`.
- Implement a mock destination provider for overseas city / hotel / airport /
  landmark examples.
- Implement a composed provider that merges local and mock/remote-like sources.
- Return structured status metadata for success, empty, timeout, partial
  failure, and all-failed states.
- Avoid real remote APIs, credentials, and network-dependent base tests.

## Acceptance Criteria

- [ ] Provider tests cover local city search, mock destination search, empty
      results, timeout degradation, source failure, and partial success.
- [ ] Local strong matches rank before mock remote-like results.
- [ ] Provider APIs return structured objects, not bare strings.
- [ ] Root quality gates pass after provider changes.

## Notes

- This child starts after core and data are available.
