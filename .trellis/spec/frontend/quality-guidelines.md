# Quality Guidelines

> Quality standards for Taro UI and demo work.

---

## Overview

The UI should be practical, inspectable, and mobile-first. It should feel like a
modern travel app without turning base components into marketing screens.

---

## Testing Requirements

`packages/taro` should cover:

- Chinese props mapping,
- English props compatibility,
- state rendering,
- selection events,
- empty state,
- error state.

`apps/demo-taro` should verify:

- H5 build,
- mobile first-screen screenshot,
- search state screenshot,
- empty state screenshot,
- later mini-program and app-container build checks.

## Scenario: Demo Taro Command

### 1. Scope / Trigger

- Trigger: `apps/demo-taro` provides the first runnable MVP demo command.
- Applies when changing root `demo:taro`, demo CLI entrypoints, or demo runtime
  dependencies.

### 2. Signatures

Run through the workspace pnpm fallback:

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm demo:taro
```

Root script:

```json
{
  "demo:taro": "tsc -b && TMPDIR=/tmp tsx apps/demo-taro/src/run-demo.ts"
}
```

### 3. Contracts

- `demo:taro` must run without real remote services.
- The command first runs `tsc -b`, then executes the deterministic demo
  snapshot.
- `TMPDIR=/tmp` is intentional in WSL because the default Windows temp path can
  make `tsx` fail to create its IPC pipe.
- Demo output covers city selection, province / city / district selection,
  destination search, empty state, and degraded provider state.

### 4. Validation & Error Matrix

- `tsx` pipe error under `/mnt/c/.../Temp` -> keep `TMPDIR=/tmp` in the script.
- Missing workspace dependency -> run `pnpm install` through the fallback and
  update `pnpm-lock.yaml`.
- Demo calls a real remote service -> fail the task; MVP demos must remain
  deterministic.

### 5. Good/Base/Bad Cases

- Good: `demo:taro` prints a JSON snapshot with `杭州`, `西湖区`, and
  `新加坡樟宜机场`.
- Base: demo tests call `创建Demo快照` directly.
- Bad: demo command depends on a travel provider API key.

### 6. Tests Required

- Demo snapshot test covers city, region, destination, empty, and degraded
  states.
- `demo:taro` exits 0.

### 7. Wrong vs Correct

#### Wrong

```json
{ "demo:taro": "tsx apps/demo-taro/src/run-demo.ts" }
```

This can fail in WSL when `tsx` chooses a Windows temp directory for IPC and
also skips the TypeScript build gate.

#### Correct

```json
{ "demo:taro": "tsc -b && TMPDIR=/tmp tsx apps/demo-taro/src/run-demo.ts" }
```

The command verifies the workspace and runs the deterministic demo in a Linux
temp directory.

---

## Accessibility

- Text contrast must meet WCAG AA.
- Touch targets must be at least 44px.
- Icon buttons need accessible labels.
- Search input needs a clear label or placeholder.
- Long city names must not overflow their containers.
- Reduced-motion mode disables non-essential motion.

---

## Visual Standards

- Use a light-first visual system.
- Prefer efficient scanning over decorative card stacks.
- Hot and recent cities use lightweight chips.
- Use linear icons.
- Keep the primary color fresh cyan-blue.
- Avoid default purple-heavy themes.
- Avoid making the first screen a landing page; show the usable selector/demo.

---

## Performance

- Keep domestic city search offline-capable.
- Avoid requiring remote providers for initial render.
- Virtualize or otherwise control long lists if rendering becomes expensive.
- Keep derived search/grouping data in core helpers or memoized selectors.

---

## Forbidden Patterns

- Do not let text overlap or overflow in buttons, chips, or list rows.
- Do not place the primary experience in decorative cards.
- Do not hide core flows behind a marketing hero.
- Do not depend on real remote APIs for required screenshots or base tests.
