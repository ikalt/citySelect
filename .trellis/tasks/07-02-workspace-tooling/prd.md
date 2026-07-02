# 初始化 pnpm workspace 和基础工具链

## Goal

Create the first runnable TypeScript workspace foundation for CitySelect so
future tasks can add `core`, `data`, `providers`, `taro`, and demo packages
with consistent linting, formatting, type-checking, and test commands.

This task is the first implementation step after the Trellis bootstrap. It
should not implement city-search product behavior yet; it should only establish
the repo tooling and empty package/app shells needed for later work.

## Background

- The product design is documented in
  `docs/superpowers/specs/2026-06-24-city-select-design.md`.
- Trellis backend/frontend specs define the expected package boundaries.
- The repo currently has no `package.json`, `pnpm-workspace.yaml`, `packages/`,
  `apps/`, or TypeScript tooling.
- `node --version` works and reports `v20.19.2`.
- `npm --version` works and reports `9.2.0`.
- `pnpm --version` currently fails through the Windows/Corepack shim at
  `/mnt/d/devSoft/nodejs/pnpm` with `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`.
  The implementation must either make pnpm invokable for this repo or use a
  reproducible fallback command while preserving a pnpm workspace layout.

## Requirements

- Add root workspace metadata:
  - `package.json`
  - `pnpm-workspace.yaml`
  - TypeScript base config
  - ESLint config
  - Prettier config
  - Vitest config if useful at this stage
- Define root scripts for:
  - `lint`
  - `typecheck`
  - `test`
  - `format` or `format:check`
- Create initial package/app directories from the design baseline:
  - `packages/core`
  - `packages/data`
  - `packages/providers`
  - `packages/taro`
  - `apps/demo-taro`
- Keep package shells minimal:
  - package metadata
  - `src/index.ts`
  - local `tsconfig.json`
  - no real city search/data/provider/UI behavior yet
- Keep `tmp/` ignored and do not copy reference project code into tracked files.
- Use TypeScript strict mode.
- Prefer ESM package setup unless a tooling limitation makes CJS necessary.
- Keep future Flutter directories out of this task unless needed for workspace
  references; Flutter adapter is out of scope for first implementation.

## Acceptance Criteria

- [ ] Root workspace files exist and reflect pnpm workspace semantics.
- [ ] The five initial package/app shells exist with minimal TypeScript entry points.
- [ ] `core` package has no React, Taro, DOM, mini-program, or Flutter dependency.
- [ ] Root lint/typecheck/test scripts are present and runnable, or the PR clearly
      documents a local pnpm tooling blocker and the exact fallback used.
- [ ] TypeScript strict mode is enabled for workspace packages.
- [ ] `tmp/` remains ignored and untracked.
- [ ] No product behavior is implemented beyond placeholder exports needed for
      tooling validation.

## Notes

- This is a complex foundational task because it changes repo structure,
  package contracts, and validation commands. Add `design.md` and
  `implement.md` before `task.py start`.
