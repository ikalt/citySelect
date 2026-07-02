# Core Engine Implementation Plan

## Files

- Modify `packages/core/src/index.test.ts` with failing behavior tests first.
- Modify `packages/core/src/index.ts` with the public types and pure helpers.

## Steps

1. Replace the placeholder core test with fixture-driven tests for search,
   ranking, grouping, recent helper behavior, and region path helper behavior.
2. Run the targeted core test and confirm it fails because the new exports do
   not exist yet.
3. Replace the placeholder core implementation with the minimal public API that
   satisfies the tests.
4. Run the targeted core test and confirm it passes.
5. Run root `test` and `typecheck` using the pnpm fallback.
6. Update project specs only if implementation reveals a durable convention not
   already captured.
7. Commit the core task changes before moving to the data child.

## Validation Commands

- `npm exec --yes --package pnpm@9.15.4 -- pnpm vitest run packages/core/src/index.test.ts`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm test`
- `npm exec --yes --package pnpm@9.15.4 -- pnpm typecheck`

## Risk Points

- Do not import bundled data into core tests or implementation.
- Keep Chinese exports and English aliases pointing at one implementation path.
- Avoid locale-dependent sorting that could make tests unstable across hosts.
