# 实现 CitySelect 内置数据与校验

## Goal

Implement the bundled domestic city / region data package for the MVP. The
package should expose versioned city, region, and hot-city data that can be
consumed by core, providers, and the demo, plus validation that proves the data
is structurally safe.

## Requirements

- Export version metadata for the bundled dataset.
- Export city-mode records and province / city / district hierarchy records.
- Include pinyin, initials, administrative level, parent links, and hot-city
  markers where required by core search and demo flows.
- Add data validation that checks unique codes, non-empty names, valid levels,
  valid parent-child links, pinyin / initials presence, and hot-city references.
- Add a root or package script that runs the validation command.

## Acceptance Criteria

- [ ] Data exports compile against `packages/core` public types.
- [ ] Validation fails for duplicated codes in tests.
- [ ] Validation fails for missing parent links in tests.
- [ ] Validation passes for the bundled MVP dataset.
- [ ] Root quality gates pass after the data change.

## Notes

- Keep the dataset credible for demos but small enough for first-version review.
