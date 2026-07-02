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
- ESLint ignores package-level generated output recursively with `**/dist/**`
  and `**/build/**`; root-only `dist/**` is not enough after package commands
  emit `packages/*/dist`.
- `tsconfig.base.json` includes Node types because workspace package exports
  point at source files. Downstream package builds can type-check imported
  provider/data CLI source under the consumer package context, so package-local
  `types` alone is not enough.

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

## Scenario: Core City Search Engine Contract

### 1. Scope / Trigger

- Trigger: `packages/core` owns the framework-free city search, grouping,
  recent-selection, and region-path API used by data, providers, UI adapters,
  and demos.
- Applies when adding or changing core public exports, search scoring, A-Z
  grouping, recent-city behavior, or region selection result shape.

### 2. Signatures

Chinese-first exports are the primary API, with English aliases for ecosystem
compatibility:

```ts
type 城市 = {
  编码: string
  名称: string
  省份名称?: string
  父级编码?: string
  拼音?: string
  首字母?: string
  别名?: readonly string[]
  级别: "省" | "市" | "区县"
  国家代码?: "CN" | string
  热门?: boolean
  经度?: number
  纬度?: number
}

type City = 城市

function 创建城市搜索索引(城市列表: readonly 城市[]): 城市搜索索引
const createCitySearchIndex: typeof 创建城市搜索索引

function 搜索城市(
  搜索索引或城市列表: 城市搜索索引 | readonly 城市[],
  关键词: string,
  选项?: { 结果上限?: number; 最近访问编码?: readonly string[] },
): 城市搜索结果[]
const searchCities: typeof 搜索城市

function 按首字母分组城市(城市列表: readonly 城市[]): 城市首字母分组[]
const groupCitiesByInitial: typeof 按首字母分组城市

function 更新最近访问城市(
  当前最近访问: readonly 城市[],
  新选择城市: 城市,
  上限?: number,
): 城市[]
const updateRecentCities: typeof 更新最近访问城市

function 创建行政区选择结果(路径: readonly 城市[]): 行政区选择结果
const createRegionSelectionResult: typeof 创建行政区选择结果
```

### 3. Contracts

- `core` accepts caller-provided city records; it must not import bundled data,
  providers, Taro, React, DOM, or network libraries.
- Runtime results return structured objects, not bare city names.
- Empty keywords return deterministic default city results with hot and recent
  weighting.
- Unknown keywords return an empty result list.
- Region selection results include `编码路径`, `名称路径`, and positional `省`,
  `市`, `区县` fields.

### 4. Validation & Error Matrix

- Empty search keyword -> return ranked city results.
- Unknown search keyword -> return `[]`.
- Missing optional pinyin / aliases / hot flag -> search and grouping still run.
- Recent limit `<= 0` -> return `[]`.
- Empty region path -> throw `RangeError`.
- Region path longer than province / city / district -> throw `RangeError`.

### 5. Good/Base/Bad Cases

- Good: build an index once with `创建城市搜索索引`, then pass that index to
  `搜索城市` for repeated searches.
- Base: pass a city array directly to `搜索城市` in tests or small demos.
- Bad: importing `@ikalt/city-select-data` inside `packages/core` to find city
  records.

### 6. Tests Required

- Exact Chinese name search returns the expected city code.
- Chinese prefix search returns the expected city code.
- Pinyin and pinyin-initial searches return the expected city code.
- Alias search returns the expected city code.
- Hot and recent weighting affect default result order.
- A-Z grouping is deterministic and does not depend on host locale.
- Recent-city helper deduplicates by city code and keeps newest selection first.
- Region helper returns code / name paths and rejects invalid path lengths.

### 7. Wrong vs Correct

#### Wrong

```ts
import { 城市列表 } from "@ikalt/city-select-data"

export function 搜索城市(关键词: string) {
  return 城市列表.filter((城市) => 城市.名称.includes(关键词))
}
```

This makes core depend on bundled data and returns a private ranking behavior
that providers and adapters cannot configure.

#### Correct

```ts
const 搜索索引 = 创建城市搜索索引(城市列表)
const 结果 = 搜索城市(搜索索引, "hz", { 最近访问编码: ["330100"] })
```

The caller owns data selection; core owns deterministic matching and ranking.

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
