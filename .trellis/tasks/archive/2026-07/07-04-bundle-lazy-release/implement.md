# 包体积优化、懒加载与发布骨架实施计划

## Preconditions

- User approved keeping heavy sync compatibility exports while adding preferred lazy APIs.
- Do not change source data in this child.
- Before editing, load `trellis-before-dev` and relevant backend/frontend specs.

## Steps

1. Baseline measurement
   - Add or run a temporary size check for current generated artifacts.
   - Record current 19MB full generated file baseline in docs/tests if useful.

2. Generator refactor
   - Split generator rendering into:
     - cities lightweight output
     - full compatibility output
     - region manifest output
     - per-shard region outputs
   - Keep output deterministic.
   - Include source manifest metadata.

3. Data public API
   - Update `packages/data/src/index.ts` to avoid importing full region data for light exports where possible.
   - Add lazy exports and English aliases.
   - Preserve existing heavy sync exports.

4. Tests
   - Add tests for manifest integrity.
   - Add tests for lazy mainland path `330000/330100/330106/330106002`.
   - Add tests for lazy HMT path `台湾省/台北市/大安区`.
   - Add compatibility parity tests between sync and lazy sample paths.

5. Taro/demo
   - Add demo snapshot for lazy-loaded administrative path.
   - Avoid moving hierarchy logic into UI adapter.

6. Size/release commands
   - Add `size:data`.
   - Add `release:check` and/or `pack:dry-run` depending on package metadata readiness.
   - Ensure commands use pnpm fallback in docs.

7. Docs/spec
   - Update README and docs.
   - Update backend database spec with lazy/manifest/size contract.

8. Verification
   - `npm exec --yes --package pnpm@9.15.4 -- pnpm generate:data`
   - `npm exec --yes --package pnpm@9.15.4 -- pnpm lint`
   - `npm exec --yes --package pnpm@9.15.4 -- pnpm typecheck`
   - `npm exec --yes --package pnpm@9.15.4 -- pnpm format:check`
   - `npm exec --yes --package pnpm@9.15.4 -- pnpm test`
   - `npm exec --yes --package pnpm@9.15.4 -- pnpm validate:data`
   - `npm exec --yes --package pnpm@9.15.4 -- pnpm demo:taro`
   - new `size:data` / release command

## Risky Files

- `packages/data/scripts/generate-data.mjs`
- `packages/data/src/index.ts`
- `packages/data/src/generated/`
- `packages/data/src/index.test.ts`
- `packages/taro/src/index.ts`
- `apps/demo-taro/src/index.ts`
- root and package `package.json`
- docs and backend spec

## Rollback Points

- If lazy API is hard to finish, keep split artifacts and manifest behind tests/docs.
- If split artifacts break typecheck, retain JSON-string generated TS modules and reduce type surface.
- If release metadata is too broad, land `size:data` first and defer publish metadata.
