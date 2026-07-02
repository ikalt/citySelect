# Workspace Tooling Design

## Scope

Create the first runnable TypeScript workspace foundation for CitySelect. This
task establishes tooling and empty package/app shells only. City search,
region data, providers, Taro UI behavior, and Flutter support remain out of
scope for later tasks.

## Architecture

Use a pnpm workspace layout with root-level tooling and package-local
TypeScript project references:

- Root owns workspace metadata, dependency installation, lint/typecheck/test
  commands, and shared config.
- `packages/core`, `packages/data`, and `packages/providers` are framework-free
  TypeScript packages.
- `packages/taro` is the future Taro + React adapter package, but this task
  only creates a minimal TypeScript shell.
- `apps/demo-taro` is a private app shell used to prove the workspace can host
  a future demo.

## Package Manager Strategy

The repo should declare `packageManager: "pnpm@9.15.4"` and include
`pnpm-workspace.yaml`.

The local `pnpm` shim currently fails with
`ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`. A verified fallback works:

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm --version
```

Implementation should use that fallback for install and verification commands
when direct `pnpm` is not usable.

## Files and Contracts

Root files:

- `package.json`: private workspace root, ESM, scripts for `lint`,
  `typecheck`, `test`, `format`, and `format:check`.
- `pnpm-workspace.yaml`: includes `packages/*` and `apps/*`.
- `tsconfig.base.json`: shared strict compiler options.
- `tsconfig.json`: project references to package/app tsconfigs.
- `eslint.config.js`: flat ESLint config for TypeScript.
- `.prettierrc.json` and `.prettierignore`: formatting defaults and generated
  or managed paths to skip.
- `vitest.config.ts`: test include/exclude defaults.

Package/app shell files:

- `package.json`
- `tsconfig.json`
- `src/index.ts`
- `src/index.test.ts`

The placeholder exports exist only to make typecheck/test validation meaningful.

## Validation

Required validation commands:

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm install
npm exec --yes --package pnpm@9.15.4 -- pnpm lint
npm exec --yes --package pnpm@9.15.4 -- pnpm typecheck
npm exec --yes --package pnpm@9.15.4 -- pnpm test
```

If dependency installation is blocked by network or registry issues, capture
the exact failure and do not claim full validation passed.

## Risks

- Direct `pnpm` is currently broken in this environment; always use the
  fallback command unless the shim is fixed.
- Tooling config should not lint/format Trellis-generated files by default.
- `packages/core` must not gain React, Taro, DOM, mini-program, or Flutter
  dependencies.
- Do not copy code from `tmp/`.
