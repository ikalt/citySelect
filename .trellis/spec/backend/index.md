# Backend Development Guidelines

> Non-UI TypeScript guidelines for CitySelect core, data, providers, and scripts.

---

## Overview

This project does not have a server backend yet. In this spec layer, "backend"
means non-UI package work:

- `packages/core`: models, search, indexing, grouping, recent-selection logic.
- `packages/data`: built-in China city/region data and generated indexes.
- `packages/providers`: local/mock/composed destination provider contracts.
- `scripts`: data update, validation, index generation, bundle reports.

The current baseline comes from
`docs/superpowers/specs/2026-06-24-city-select-design.md`. Replace or extend
these rules with real implementation examples as packages are created.

---

## Pre-Development Checklist

- [ ] Read [Directory Structure](./directory-structure.md) before adding packages or files.
- [ ] Read [Database Guidelines](./database-guidelines.md) before touching city/region data, generated artifacts, or scripts.
- [ ] Read [Error Handling](./error-handling.md) before adding providers or async flows.
- [ ] Read [Logging Guidelines](./logging-guidelines.md) before adding scripts or diagnostics.
- [ ] Read [Quality Guidelines](./quality-guidelines.md) before reporting work complete.
- [ ] If a change crosses core/data/providers/UI, read `../guides/cross-layer-thinking-guide.md`.

---

## Quality Check

- [ ] Confirm `packages/core` remains framework-free.
- [ ] Confirm data changes run validation or document why validation is not available yet.
- [ ] Confirm provider changes degrade gracefully for timeout, empty, and failure states.
- [ ] Confirm public APIs return structured objects, not bare city names.
- [ ] Confirm `tmp/` reference material is not copied into tracked product files.
- [ ] Run lint, type-check, tests, and data validation once those commands exist.

---

## Guidelines Index

| Guide | Description | Status |
|-------|-------------|--------|
| [Directory Structure](./directory-structure.md) | Package boundaries and file layout | Initial baseline |
| [Database Guidelines](./database-guidelines.md) | Data ownership, generated artifacts, validation | Initial baseline |
| [Error Handling](./error-handling.md) | Provider, script, and core error strategy | Initial baseline |
| [Quality Guidelines](./quality-guidelines.md) | TypeScript, tests, and release gates | Initial baseline |
| [Logging Guidelines](./logging-guidelines.md) | Script diagnostics and forbidden logging | Initial baseline |

---

## Source Baseline

Use the design document as the source of truth until implementation exists.
Do not infer conventions from `tmp/`; those projects are reference material and
must not be committed into the product.

---

**Language**: Write docs in English. Chinese identifiers are allowed in API
examples because Chinese-first API design is an explicit project requirement.
