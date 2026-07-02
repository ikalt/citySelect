# Workspace Tooling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the first runnable TypeScript pnpm workspace foundation for CitySelect.

**Architecture:** Root-level tooling owns installation and validation. Package shells are minimal TypeScript projects referenced by the root `tsconfig.json`. No city search, region data, provider, or Taro UI behavior is implemented in this plan.

**Tech Stack:** Node.js 20.19.2, pnpm 9.15.4 via `npm exec` fallback, TypeScript, ESLint flat config, Prettier, Vitest.

## Global Constraints

- Direct `pnpm --version` currently fails with `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`; use `npm exec --yes --package pnpm@9.15.4 -- pnpm ...`.
- `packages/core` must not depend on React, Taro, DOM, mini-program, or Flutter APIs.
- Keep `tmp/` ignored and untracked.
- Use TypeScript strict mode.
- Do not implement product behavior beyond placeholder exports needed for tooling validation.

---

## File Structure

- Create `package.json`: private root workspace scripts and dev dependencies.
- Create `pnpm-workspace.yaml`: includes `packages/*` and `apps/*`.
- Create `tsconfig.base.json`: shared strict compiler options.
- Create `tsconfig.json`: project references to all package/app shells.
- Create `eslint.config.js`: TypeScript flat config with managed-path ignores.
- Create `.prettierrc.json`: formatting defaults.
- Create `.prettierignore`: skip dependency, build, tmp, and Trellis/Codex generated paths.
- Create `vitest.config.ts`: shared test include/exclude.
- Create five workspace shells under `packages/core`, `packages/data`, `packages/providers`, `packages/taro`, and `apps/demo-taro`.

---

### Task 1: Root Tooling

**Files:**

- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `tsconfig.json`
- Create: `eslint.config.js`
- Create: `.prettierrc.json`
- Create: `.prettierignore`
- Create: `vitest.config.ts`

**Interfaces:**

- Produces: root scripts `lint`, `typecheck`, `test`, `format`, `format:check`.
- Produces: TypeScript project references consumed by workspace shells.

- [ ] **Step 1: Create root workspace files**

Use these exact root contracts:

```json
{
  "private": true,
  "type": "module",
  "packageManager": "pnpm@9.15.4",
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc -b",
    "test": "vitest run",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  },
  "devDependencies": {
    "@eslint/js": "latest",
    "@types/node": "latest",
    "eslint": "latest",
    "prettier": "latest",
    "typescript": "latest",
    "typescript-eslint": "latest",
    "vitest": "latest"
  }
}
```

- [ ] **Step 2: Add workspace globs**

`pnpm-workspace.yaml`:

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

- [ ] **Step 3: Add TypeScript configs**

`tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "noEmitOnError": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

`tsconfig.json` references:

```json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/data" },
    { "path": "./packages/providers" },
    { "path": "./packages/taro" },
    { "path": "./apps/demo-taro" }
  ]
}
```

- [ ] **Step 4: Add ESLint, Prettier, and Vitest configs**

Use flat ESLint with TypeScript recommended config, Prettier with ASCII-safe defaults, and Vitest includes for `src/**/*.test.ts`.

- [ ] **Step 5: Verify root-only config shape**

Run:

```bash
git status --short
```

Expected: only the new root config files and the Trellis task files are dirty.

---

### Task 2: Workspace Shells

**Files:**

- Create: `packages/core/package.json`, `packages/core/tsconfig.json`, `packages/core/src/index.ts`, `packages/core/src/index.test.ts`
- Create: `packages/data/package.json`, `packages/data/tsconfig.json`, `packages/data/src/index.ts`, `packages/data/src/index.test.ts`
- Create: `packages/providers/package.json`, `packages/providers/tsconfig.json`, `packages/providers/src/index.ts`, `packages/providers/src/index.test.ts`
- Create: `packages/taro/package.json`, `packages/taro/tsconfig.json`, `packages/taro/src/index.ts`, `packages/taro/src/index.test.ts`
- Create: `apps/demo-taro/package.json`, `apps/demo-taro/tsconfig.json`, `apps/demo-taro/src/index.ts`, `apps/demo-taro/src/index.test.ts`

**Interfaces:**

- Produces: placeholder exports with stable names for smoke tests.

- [ ] **Step 1: Create package metadata**

Package names:

```text
@ikalt/city-select-core
@ikalt/city-select-data
@ikalt/city-select-providers
@ikalt/city-select-taro
@ikalt/city-select-demo-taro
```

Each package uses `"type": "module"` and exports `./src/index.ts`.

- [ ] **Step 2: Create package tsconfigs**

Each package/app `tsconfig.json` extends `../../tsconfig.base.json` for packages or `../../tsconfig.base.json` for apps and includes `src/**/*.ts`.

- [ ] **Step 3: Create placeholder exports**

Each `src/index.ts` exports one package identity constant, for example:

```ts
export const citySelectCorePackage = "@ikalt/city-select-core" as const
```

- [ ] **Step 4: Create smoke tests**

Each `src/index.test.ts` imports its package constant and asserts the expected string with Vitest.

- [ ] **Step 5: Confirm core has no UI dependencies**

Run:

```bash
cat packages/core/package.json
```

Expected: no `dependencies` field for React, Taro, DOM, mini-program, or Flutter libraries.

---

### Task 3: Install and Validate

**Files:**

- Create: `pnpm-lock.yaml` after install succeeds.
- Modify: tooling config only if validation exposes a concrete issue.

**Interfaces:**

- Consumes: root scripts from Task 1.
- Consumes: package smoke tests from Task 2.
- Produces: verified baseline commands for future tasks.

- [ ] **Step 1: Install dependencies**

Run:

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm install
```

Expected: exit 0 and `pnpm-lock.yaml` exists.

- [ ] **Step 2: Run lint**

Run:

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm lint
```

Expected: exit 0.

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm typecheck
```

Expected: exit 0.

- [ ] **Step 4: Run format check**

Run:

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm format:check
```

Expected: exit 0.

- [ ] **Step 5: Run tests**

Run:

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm test
```

Expected: five smoke tests pass.

- [ ] **Step 6: Commit**

Commit all task files and workspace files together after validation:

```bash
git add .trellis/tasks/07-02-workspace-tooling docs/superpowers/plans/2026-07-02-workspace-tooling.md package.json pnpm-workspace.yaml tsconfig.base.json tsconfig.json eslint.config.js .prettierrc.json .prettierignore vitest.config.ts packages apps pnpm-lock.yaml
git commit -m "🔧 chore: 初始化 pnpm 工作区"
```

---

## Self-Review

- Spec coverage: PRD requirements map to Task 1 root tooling, Task 2 package shells, and Task 3 validation.
- Placeholder scan: placeholder exports are intentional and limited to tooling validation.
- Type consistency: package identity constants are independent and tested in each package.
