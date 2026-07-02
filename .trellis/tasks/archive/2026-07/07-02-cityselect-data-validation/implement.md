# Data Package Implementation Plan

## Files

- Modify `package.json` to add `validate:data`.
- Modify `packages/data/package.json` to depend on `@ikalt/city-select-core`.
- Modify `packages/data/src/index.test.ts` with TDD tests.
- Modify `packages/data/src/index.ts` with data exports and validation helpers.
- Add `packages/data/src/validate-data.ts` as the validation CLI entrypoint.

## Steps

1. Replace the placeholder data tests with failing tests for bundled exports,
   duplicate-code validation, missing-parent validation, hot-city validation,
   and bundled-data success.
2. Run targeted data tests and confirm RED because exports do not exist.
3. Implement MVP bundled records and validation helpers.
4. Add the validation CLI and package/root script wiring.
5. Run targeted data tests and `validate:data`.
6. Run root `lint`, `typecheck`, `format:check`, and `test`.
7. Update `.trellis/spec/backend/database-guidelines.md` if the final validation
   issue contract should be preserved.
8. Commit, archive the data child task, and record the session.

## Validation Commands

- `npm exec --yes --package pnpm@9.15.4 -- pnpm vitest run packages/data/src/index.test.ts`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm validate:data`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm lint`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm typecheck`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm format:check`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm test`

## Risk Points

- Do not copy data from `tmp/`.
- Keep records small but structurally representative.
- Keep validator reusable by tests and CLI.
- Keep data dependent on core, not the reverse.
