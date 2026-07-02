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
