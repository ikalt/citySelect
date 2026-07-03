# 官方与更近数据源研究替换技术设计

## Architecture

Source research should produce a decision note before code changes. If a source
is adopted, it feeds the source manifest and existing shard generator created
by `07-04-bundle-lazy-release`.

## Candidate Source Classes

1. Official national source
   - 民政部 / 国家地名信息库。
   - Expected strongest authority, unknown machine-readability.
2. Official provincial township sources
   - 省级民政部门半年发布。
   - Expected fragmented formats.
3. Third-party curated sources
   - More machine-readable.
   - Must be marked as third-party seed.

## Decision Matrix

Each candidate must be scored on:

- coverage level
- data cutoff date
- update frequency
- license / use terms
- machine readability
- reproducibility
- HMT coverage
- township/street coverage
- validation pass/fail

## Replacement Rule

Do not replace the current source unless the candidate preserves or improves
coverage. A newer source that lacks township data can only be a partial source
inside a mixed manifest, not a full replacement.
