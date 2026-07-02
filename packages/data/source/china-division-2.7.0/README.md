# china-division 2.7.0 source snapshot

This directory contains the subset of `china-division@2.7.0` used as the
CitySelect national region seed:

- `dist/provinces.json`
- `dist/cities.json`
- `dist/areas.json`
- `dist/streets.json`
- `dist/HK-MO-TW.json`

The package describes its data as sourced from the National Bureau of
Statistics 2023 statistical zoning and urban-rural classification code dataset
with a cutoff date of 2023-06-30 and publication date of 2023-09-11.

Village / community data from the package is intentionally not copied because
CitySelect first full dataset scope stops at mainland township / street level
and uses variable-depth Hong Kong / Macau / Taiwan paths.

Package metadata:

- npm package: `china-division`
- version: `2.7.0`
- repository: `https://github.com/modood/Administrative-divisions-of-China`
- package metadata license: `MIT`
- included `LICENSE` file: WTFPL v2

CitySelect treats this package as a third-party seed. Generated artifacts must
record the source, package version, license notes, and validation boundary.
