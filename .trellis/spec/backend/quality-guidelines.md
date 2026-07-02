# Quality Guidelines

> Quality standards for core, data, providers, and scripts.

---

## Overview

The first release should be a maintainable scaffold, not a thin UI wrapper
around copied reference code. Quality gates are part of the product shape.

---

## Required Tooling

Use the design baseline quality gates when the workspace is initialized:

- TypeScript `strict`.
- ESLint.
- Prettier.
- Vitest.
- data validation script.
- relevant tests before commit.

If the tooling is not installed yet, the first implementation task should add
it before feature code.

---

## Scenario: Workspace Tooling Commands

### 1. Scope / Trigger

- Trigger: root workspace tooling uses pnpm semantics, but this WSL environment
  can resolve a broken Windows/Corepack `pnpm` shim.
- Applies to: install, lint, typecheck, format, and test commands.

### 2. Signatures

Use the reproducible pnpm fallback:

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm <command>
```

Root scripts:

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm lint
npm exec --yes --package pnpm@9.15.4 -- pnpm typecheck
npm exec --yes --package pnpm@9.15.4 -- pnpm format:check
npm exec --yes --package pnpm@9.15.4 -- pnpm test
```

### 3. Contracts

- `package.json` declares `"packageManager": "pnpm@9.15.4"`.
- `pnpm-workspace.yaml` owns workspace membership.
- Formatting ignores Trellis/Codex generated or managed files:
  `.agents/`, `.codex/`, `.trellis/`, `AGENTS.md`, `tmp/`, generated build
  directories, and dependency folders.

### 4. Validation & Error Matrix

- Direct `pnpm --version` fails with `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`
  -> use the fallback command above.
- `pnpm install` fails due network/registry -> report the exact failure and do
  not claim validation passed.
- `format:check` changes managed files -> add the managed path to
  `.prettierignore`, restore unrelated formatting, and re-run.

### 5. Good/Base/Bad Cases

- Good: `npm exec --yes --package pnpm@9.15.4 -- pnpm test` runs workspace
  tests through the pinned pnpm version.
- Base: direct `npm --version` and `node --version` can be used only for
  environment diagnostics.
- Bad: running the broken `pnpm` shim directly and treating its failure as a
  project test failure.

### 6. Tests Required

- Lint exits 0.
- Typecheck exits 0.
- Format check exits 0.
- Vitest exits 0 with package/app smoke tests.
- `git ls-files tmp | wc -l` remains `0`.

### 7. Wrong vs Correct

#### Wrong

```bash
pnpm test
```

This may hit the broken Windows/Corepack shim in the current environment.

#### Correct

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm test
```

This uses a pinned pnpm package through npm and has been verified in this repo.

---

## Testing Requirements

`packages/core`:

- search ranking,
- Chinese name, pinyin, initials, and alias matching,
- recent selection weighting,
- A-Z grouping,
- provider result merging,
- error degradation.

`packages/data`:

- unique codes,
- complete hierarchy,
- valid parent-child links,
- pinyin and initials present,
- generated artifacts readable by `core`.

`packages/providers`:

- mock provider,
- local city provider,
- composed provider,
- timeout, empty, and failure degradation.

---

## Code Standards

- Keep `core` framework-free.
- Keep provider interfaces decoupled from UI.
- Prefer structured return objects over strings.
- Keep Chinese-first public API examples working, with English aliases for
  ecosystem compatibility.
- Keep `tmp/` ignored and out of commits.
- Do not require remote services for base test success.

---

## Review Checklist

- [ ] Does this change keep the core/data/provider/UI boundary intact?
- [ ] Are search and data changes covered by Vitest or validation scripts?
- [ ] Does the change avoid real credentials and real remote dependencies?
- [ ] Are generated artifacts deterministic?
- [ ] Are Chinese API fields and English aliases both considered where needed?
- [ ] Is `tmp/` still excluded from tracked files?
