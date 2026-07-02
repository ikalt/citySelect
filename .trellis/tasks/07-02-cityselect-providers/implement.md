# Providers Implementation Plan

## Files

- Modify `packages/providers/package.json` to depend on core and data packages.
- Modify `packages/providers/src/index.test.ts` with RED provider behavior
  tests.
- Modify `packages/providers/src/index.ts` with provider types and
  implementations.

## Steps

1. Replace the placeholder provider test with failing tests for local city
   search, mock destination search, empty result, timeout, all failure, partial
   failure, and local-before-mock ranking.
2. Run targeted provider tests and confirm RED because exports do not exist.
3. Implement provider contracts and local/mock/composed providers.
4. Update package dependencies and lockfile.
5. Run targeted provider tests.
6. Run root `lint`, `typecheck`, `format:check`, `test`, and `validate:data`.
7. Update provider/error specs with the final response contract.
8. Commit, archive the providers child task, and record the session.

## Validation Commands

- `npm exec --yes --package pnpm@9.15.4 -- pnpm vitest run packages/providers/src/index.test.ts`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm lint`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm typecheck`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm format:check`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm test`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm validate:data`

## Risk Points

- No real network calls, secrets, or vendor-specific contracts.
- No UI imports.
- Preserve local results when a secondary provider fails.
- Do not duplicate bundled data inside providers.
