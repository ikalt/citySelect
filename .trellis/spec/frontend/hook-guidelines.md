# Hook Guidelines

> How custom hooks are designed and used in the Taro adapter.

---

## Overview

Hooks are allowed in `packages/taro` and `apps/demo-taro`, but core behavior
must stay framework-free. A hook may orchestrate search input, provider calls,
location state, sheet state, or recent selection persistence; it should not
implement search ranking itself.

---

## Naming Conventions

- Hook filenames use English `use-*` names.
- Hook exports use `useXxx` naming.
- Hook return values may expose Chinese API field names when mapping to public
  Chinese components.

Examples:

- `use-city-search.ts`,
- `use-location-city.ts`,
- `use-recent-cities.ts`,
- `use-provider-results.ts`,
- `use-letter-index.ts`.

---

## Data Fetching

- Provider calls go through provider interfaces from `packages/providers`.
- Hooks should represent loading, empty, error, partial failure, and timeout
  explicitly.
- Do not call real remote services in base tests or required demo flows.
- Keep local city provider results usable when remote providers fail.

---

## Side Effects

Hooks may own platform side effects:

- reading/writing recent city selections through an adapter,
- requesting location through an injected platform capability,
- measuring or scrolling list sections,
- handling keyboard/safe-area reactions.

Side effects should be injected or isolated so H5, mini-program, and app
containers can share behavior.

---

## Examples

Good hook boundary:

```ts
const state = useProviderResults({
  keyword,
  provider,
  timeoutMs: 3000,
})
```

The hook manages async state. Provider ranking and local/remote composition
remain in `packages/providers`.

---

## Forbidden Patterns

- Do not import React hooks into `packages/core`.
- Do not compute pinyin ranking inside a hook.
- Do not hide provider failures by returning only an empty array.
- Do not couple hooks to one platform storage API without an adapter.
