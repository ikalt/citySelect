# Frontend Development Guidelines

> UI adapter guidelines for CitySelect Taro components and demo apps.

---

## Overview

The first UI adapter is Taro + React. Frontend code should present the
CitySelect experience across H5, mini-programs, and app containers while
leaving business rules in `packages/core`, `packages/data`, and
`packages/providers`.

The current baseline comes from
`docs/superpowers/specs/2026-06-24-city-select-design.md`. Replace or extend
these rules with real implementation examples as packages are created.

---

## Pre-Development Checklist

- [ ] Read [Directory Structure](./directory-structure.md) before creating UI packages or demo files.
- [ ] Read [Component Guidelines](./component-guidelines.md) before adding public components.
- [ ] Read [Hook Guidelines](./hook-guidelines.md) before adding custom hooks or provider glue.
- [ ] Read [State Management](./state-management.md) before changing selection, search, location, or provider state.
- [ ] Read [Type Safety](./type-safety.md) before adding public props or events.
- [ ] Read [Quality Guidelines](./quality-guidelines.md) before reporting UI work complete.
- [ ] If UI consumes new data/provider shapes, read `../guides/cross-layer-thinking-guide.md`.

---

## Quality Check

- [ ] Confirm Chinese-first props and English aliases share one behavior path.
- [ ] Confirm selection events return structured typed objects.
- [ ] Confirm UI does not own search ranking, provider merging, or region hierarchy rules.
- [ ] Confirm empty, error, timeout, and partial-failure states are distinct.
- [ ] Confirm accessibility basics: WCAG AA contrast, 44px targets, labels, no text overflow.
- [ ] Run lint, type-check, tests, and demo build once those commands exist.

---

## Guidelines Index

| Guide | Description | Status |
|-------|-------------|--------|
| [Directory Structure](./directory-structure.md) | UI adapter and demo layout | Initial baseline |
| [Component Guidelines](./component-guidelines.md) | Chinese-first public components, props, composition | Initial baseline |
| [Hook Guidelines](./hook-guidelines.md) | Custom hooks and platform glue | Initial baseline |
| [State Management](./state-management.md) | Search, location, provider, sheet, and selection state | Initial baseline |
| [Quality Guidelines](./quality-guidelines.md) | Accessibility, visual, testing, and build gates | Initial baseline |
| [Type Safety](./type-safety.md) | Props, events, aliases, validation | Initial baseline |

---

## Source Baseline

Use the design document as the source of truth until implementation exists.
Do not infer conventions from `tmp/`; those projects are reference material and
must not be committed into the product.

---

**Language**: Write docs in English. Chinese identifiers are allowed in API
examples because Chinese-first API design is an explicit project requirement.
