# Taro Adapter Implementation Plan

## Files

- Modify `packages/taro/package.json` to depend on core, data, and providers.
- Modify `packages/taro/src/index.test.ts` with RED tests for normalized props,
  state snapshots, typed events, and provider-state mapping.
- Modify `packages/taro/src/index.ts` with adapter types and pure helpers.

## Steps

1. Replace placeholder tests with failing tests for Chinese/English prop parity,
   city state, region state, selection callbacks, and provider degraded state
   mapping.
2. Run targeted Taro adapter tests and confirm RED.
3. Implement adapter contracts using lower-layer APIs.
4. Update package dependencies and lockfile.
5. Run targeted Taro adapter tests.
6. Run root `lint`, `typecheck`, `format:check`, `test`, and `validate:data`.
7. Update frontend specs if the final adapter contract should be preserved.
8. Commit, archive the Taro child task, and record the session.

## Validation Commands

- `npm exec --yes --package pnpm@9.15.4 -- pnpm vitest run packages/taro/src/index.test.ts`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm lint`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm typecheck`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm format:check`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm test`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm validate:data`

## Risk Points

- Do not fork Chinese and English behavior paths.
- Do not compute search ranking or provider merging in the adapter.
- Keep runtime deterministic and Node-testable.
- Do not add real platform storage/location side effects in this MVP task.
