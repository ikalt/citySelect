# 数据源更新、包体积优化与发布流程实施计划

## Preconditions

- Current branch `codex/cityselect-mvp` has been pushed to `origin/codex/cityselect-mvp`.
- PR auto-creation requires either `gh` CLI authentication or a GitHub token; current environment has neither.
- User continued on 2026-07-04 after the recommendation to prioritize package size, lazy loading, and release skeleton before source replacement.
- Task remains in planning until user approves implementation.

## Steps

1. Execute child `07-04-bundle-lazy-release`
   - Start this child first after user approval.
   - Its completion should produce a usable lazy data/package skeleton while preserving current source data.

2. Execute child `07-04-source-refresh-research`
   - Start this child after the lazy/source manifest structure exists.
   - If source research needs to happen earlier, keep it read-only and do not replace generated data until child 1 contracts are available.

3. Parent integration review
   - Verify both child tasks satisfy the parent acceptance criteria.
   - Update parent docs/specs if child outputs change the roadmap.

## Parent-Level Steps

1. PR / remote closure
   - Confirm target base branch on GitHub.
   - If `gh` or token becomes available, create PR from `codex/cityselect-mvp`.
   - Otherwise provide compare URL and record blocker.

2. Baseline size and release skeleton
   - Add a reproducible `size:data` report over generated artifacts / package outputs.
   - Add or document `release:check` / `pack:dry-run`.
   - Record current heavy baseline before splitting.

3. Source manifest on current data
   - Add source manifest schema and generated metadata.
   - Record per-level source ownership and cutoff date.
   - Extend `validate:data` output to include manifest summary.

4. Split generated artifacts
   - Generate cities separately from full regions.
   - Generate mainland region shards by province code.
   - Generate HMT shard separately.
   - Add checksums/counts for each shard.

5. Lazy runtime API
   - Add loader API in `packages/data`.
   - Preserve current sync compatibility exports.
   - Add tests for loading:
     - province shard children
     - four-level mainland path
     - HMT path
     - missing code / missing shard behavior

6. Taro/demo integration
   - Add lazy path demo snapshot.
   - Ensure UI-facing state does not reimplement loader/index logic.

7. Package/release flow
   - Add package metadata plan or implementation.
   - Add `size:data` or bundle report command.
   - Add `release:check` or equivalent script.
   - Document PR creation and release dry-run.

8. Source research spike
   - Verify current official publication paths after `行政区划代码管理办法`.
   - Check whether 国家地名信息库 has stable downloadable nationwide code data.
   - Sample 2-3 provincial civil-affairs publication formats for township code feasibility.
   - Compare third-party candidates:
     - `cn-division@2026.0.0`
     - `china-division@2.7.0`
     - `province-city-china@8.5.8`
   - Write a source decision note before changing generator input.
   - Defer source replacement if coverage or stability is weaker than the current data.

9. Documentation/spec update
   - Update README, `docs/data.md`, `docs/api.zh-CN.md`, `docs/design.md`.
   - Update backend spec for source manifest, lazy data contract, and size check.

10. Verification
   - `npm exec --yes --package pnpm@9.15.4 -- pnpm lint`
   - `npm exec --yes --package pnpm@9.15.4 -- pnpm typecheck`
   - `npm exec --yes --package pnpm@9.15.4 -- pnpm format:check`
   - `npm exec --yes --package pnpm@9.15.4 -- pnpm test`
   - `npm exec --yes --package pnpm@9.15.4 -- pnpm validate:data`
   - `npm exec --yes --package pnpm@9.15.4 -- pnpm demo:taro`
   - new size/release check command when added

## Risky Files

- `packages/data/scripts/generate-data.mjs`
- `packages/data/src/index.ts`
- `packages/data/src/generated/`
- `packages/taro/src/index.ts`
- `apps/demo-taro/src/index.ts`
- `package.json`
- package-level `package.json` files
- docs and `.trellis/spec/backend/database-guidelines.md`

## Rollback Points

- Land source manifest without changing data source.
- Land split artifacts generated from current source before changing runtime API.
- Land lazy API additively before changing sync compatibility behavior.
- Treat source replacement as last step after validation proves no coverage regression.
