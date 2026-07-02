# CitySelect MVP Implementation Plan

## Execution Model

This parent task stays in planning and integration ownership. Implementation
should happen in child tasks, each with its own PRD / design / implementation
notes, quality check, spec update, commit, and archive.

## Child Task Order

1. `cityselect-core-engine`
   - Build framework-free domain types, search index, ranking, A-Z grouping,
     recent-selection helpers, and region path helpers.
   - Validation: targeted Vitest tests for search, grouping, recent weighting,
     and region path behavior, then root `test` and `typecheck`.
2. `cityselect-data-validation`
   - Add bundled city / region data, version metadata, hot-city defaults, and a
     validation command.
   - Validation: data tests plus validation command, then root quality gates.
3. `cityselect-providers`
   - Add provider contract, local city provider, mock destination provider, and
     composed provider with timeout / partial failure metadata.
   - Validation: provider tests for success, empty, timeout, failure, and mixed
     source outcomes.
4. `cityselect-taro-adapter`
   - Add Chinese-first and English-compatible adapter APIs for city, region, and
     destination flows.
   - Validation: adapter tests prove prop normalization, state snapshots, and
     typed selection events share one behavior path.
5. `cityselect-demo-docs`
   - Add a runnable deterministic demo surface and Chinese docs for quick start,
     API, providers, data, validation, and MVP limitations.
   - Validation: demo tests or build command, docs links, and root quality gates.
6. `cityselect-mvp-integration`
   - Run the full completion audit, update Trellis specs with durable findings,
     archive child tasks, and archive this parent task.
   - Validation: lint, typecheck, format:check, test, data validation, and demo
     command all pass from a clean worktree.

## Cross-Task Constraints

- Do not add real remote API calls or secrets.
- Do not import UI packages from core, data, or providers.
- Keep domestic city selection offline by default.
- Keep Chinese API examples and docs as first-class outputs.
- Prefer deterministic fixtures and tests over network-dependent behavior.
- Use the documented pnpm fallback:
  `npm exec --yes --package pnpm@9.15.4 -- pnpm <script>`.

## First Child Start Criteria

Before starting `cityselect-core-engine`, read the backend spec index and the
shared cross-layer guide. The first child can start once this parent PRD,
design, and implementation map exist and the active task pointer is switched to
the child.

## Parent Completion Criteria

The parent can be archived only when every child is complete or intentionally
folded into another completed child, the full workspace quality gates pass, the
MVP exclusions are documented, and the final evidence directly proves each
acceptance criterion in `prd.md`.
