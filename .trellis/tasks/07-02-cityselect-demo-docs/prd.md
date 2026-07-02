# 实现 CitySelect demo 与中文文档

## Goal

Implement a deterministic runnable demo surface and Chinese-first documentation
that proves the MVP package graph can be used end to end.

## Requirements

- Demo city selection using bundled data and core search.
- Demo province / city / district selection using bundled region data.
- Demo destination search using provider composition and mock destinations.
- Include empty and degraded provider states.
- Add Chinese docs for README / quick start, Chinese API, provider integration,
  data model, validation command, and MVP limitations.

## Acceptance Criteria

- [ ] Demo command or build command runs locally without real remote services.
- [ ] Demo tests or smoke assertions cover city, region, destination, empty, and
      degraded states.
- [ ] Docs link to the implemented package APIs and validation flow.
- [ ] Docs explicitly exclude Flutter, uni-app, native SDKs, real remote APIs,
      and release automation from the first MVP.
- [ ] Root quality gates pass after demo/docs changes.

## Notes

- This child starts after core, data, providers, and Taro adapter are available.
