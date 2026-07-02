# Demo And Docs Implementation Plan

## Files

- Modify `package.json` to add `demo:taro`.
- Modify `apps/demo-taro/package.json` to depend on Taro adapter and providers.
- Modify `apps/demo-taro/src/index.test.ts` with RED snapshot tests.
- Modify `apps/demo-taro/src/index.ts` with deterministic demo snapshot helpers.
- Add `apps/demo-taro/src/run-demo.ts` as the CLI entrypoint.
- Add `README.md`, `docs/api.zh-CN.md`, `docs/provider.md`,
  `docs/data.md`, and `docs/design.md`.

## Steps

1. Write failing demo snapshot tests for city, region, destination, empty, and
   degraded states.
2. Run targeted demo tests and confirm RED.
3. Implement demo snapshot and CLI runner.
4. Add package dependencies, root `demo:taro`, and update lockfile.
5. Add Chinese docs for quick start, API, provider, data, design, and limits.
6. Run targeted demo tests and `demo:taro`.
7. Run root `lint`, `typecheck`, `format:check`, `test`, and `validate:data`.
8. Commit, archive the demo/docs child task, and record the session.

## Validation Commands

- `npm exec --yes --package pnpm@9.15.4 -- pnpm vitest run apps/demo-taro/src/index.test.ts`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm demo:taro`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm lint`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm typecheck`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm format:check`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm test`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm validate:data`

## Risk Points

- Demo must not call real remote APIs.
- Docs must clearly mark Flutter, uni-app, native SDKs, release automation, and
  real remote providers as out of first MVP scope.
- Demo should consume public package APIs only.
