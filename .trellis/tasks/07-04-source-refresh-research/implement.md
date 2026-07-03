# 官方与更近数据源研究替换实施计划

## Preconditions

- Prefer waiting until `07-04-bundle-lazy-release` lands source manifest and shard contracts.
- Read-only research may happen earlier.
- Do not change generated data without a source decision note.

## Steps

1. Research official national source
   - Locate 国家地名信息库 publication entry.
   - Verify whether nationwide data can be downloaded or reliably scraped.
   - Record access constraints.

2. Research provincial township sources
   - Sample at least 2-3 provinces.
   - Record format stability and automation feasibility.

3. Research third-party sources
   - Inspect package contents and licenses.
   - Compare coverage and freshness.

4. Write source decision note
   - Choose replace, mix, or defer.
   - Include validation plan and rollback.

5. If replacing/mixing
   - Add source snapshot.
   - Update generator adapters.
   - Update source manifest.
   - Regenerate data.

6. Verification
   - `generate:data`
   - `validate:data`
   - `test`
   - full quality gate if code changes land

## Rollback

- Revert source snapshot and adapter changes.
- Keep previous generated artifacts if validation regresses.
