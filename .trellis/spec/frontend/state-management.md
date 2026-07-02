# State Management

> How selection, search, location, provider, and sheet state are managed.

---

## Overview

No global state library is required by the baseline design. Prefer local state
and small hooks in the Taro adapter, with reusable pure state transitions in
`packages/core` when behavior must be shared.

---

## Local Component State

Use local state for:

- current search keyword,
- active letter overlay,
- sheet open/closed state,
- current tab/mode,
- transient animation state,
- focused input state.

---

## Core State Machines

Reusable selection behavior belongs in `packages/core` when it affects multiple
adapters:

- city selection,
- region path selection,
- recent selection weighting,
- search result ranking,
- A-Z grouping.

---

## Provider State

Provider-facing UI must model:

- loading,
- success,
- empty,
- partial failure,
- all failed,
- timeout.

Remote provider results rank after local strong matches. A remote failure must
not break offline domestic city search.

---

## Persistence

Recent city persistence should be adapter-based:

- core defines data shape and update rules,
- Taro adapter reads/writes through platform storage,
- tests can use in-memory adapters.

Default recent city limit is 6 unless a public prop overrides it.

---

## Examples

Region selection returns a structured path:

```ts
type 行政区选择结果 = {
  编码路径: string[]
  名称路径: string[]
  省?: 城市
  市?: 城市
  区县?: 城市
}
```

---

## Forbidden Patterns

- Do not store derived search results as independent source-of-truth state when
  they can be derived from keyword, data, and provider state.
- Do not make a global singleton provider mandatory for tests.
- Do not collapse location disabled, failed, and idle states into one flag.
- Do not persist only city names; persist structured city references.
