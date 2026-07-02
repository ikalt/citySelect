# Workspace Tooling Implementation Plan

## Execution Order

1. Add root workspace and tooling config files.
2. Add minimal package/app shells for:
   - `packages/core`
   - `packages/data`
   - `packages/providers`
   - `packages/taro`
   - `apps/demo-taro`
3. Install dependencies using the verified pnpm fallback.
4. Run lint, typecheck, format check, and tests.
5. Update this task if validation requires a tooling adjustment.

## Files to Create

Root:

- `package.json`
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `tsconfig.json`
- `eslint.config.js`
- `.prettierrc.json`
- `.prettierignore`
- `vitest.config.ts`

Per package/app:

- `<workspace>/package.json`
- `<workspace>/tsconfig.json`
- `<workspace>/src/index.ts`
- `<workspace>/src/index.test.ts`

## Commands

Use the fallback pnpm command because direct `pnpm` currently fails:

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm install
npm exec --yes --package pnpm@9.15.4 -- pnpm lint
npm exec --yes --package pnpm@9.15.4 -- pnpm typecheck
npm exec --yes --package pnpm@9.15.4 -- pnpm format:check
npm exec --yes --package pnpm@9.15.4 -- pnpm test
```

## Review Gates

- `packages/core/package.json` has no UI framework dependencies.
- Root scripts exist and execute through the fallback pnpm command.
- Tests only assert placeholder package exports; no product behavior is added.
- `tmp/` remains ignored and untracked.
- Generated dependency files such as `pnpm-lock.yaml` are committed only if
  created by the successful install.

## Rollback

If tooling installation or validation cannot be made reliable, remove the new
workspace files and leave only the task planning artifacts with the exact
failure recorded in `prd.md`.
