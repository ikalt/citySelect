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
