# 完成 CitySelect 第一版 MVP

## Goal

Deliver the first runnable MVP of CitySelect as defined by
`docs/superpowers/specs/2026-06-24-city-select-design.md`: a Chinese-first,
cross-platform city / region selection scaffold with core search, built-in
China data, provider abstractions, a Taro-facing adapter, a runnable demo, and
Chinese documentation.

The parent task owns the source requirement set, child-task map, integration
acceptance criteria, and final review. Implementation should happen in
independently verifiable child tasks.

## Confirmed Facts

- The project has an approved design baseline in
  `docs/superpowers/specs/2026-06-24-city-select-design.md`.
- The active user goal explicitly defines completion as the first runnable MVP:
  core city / region data and search, providers, Taro adapter, demo,
  documentation, and validation flow.
- The pnpm workspace and package shells already exist on branch
  `codex/workspace-tooling`.
- Current packages are placeholders only:
  `packages/core`, `packages/data`, `packages/providers`, `packages/taro`, and
  `apps/demo-taro`.
- Workspace validation commands exist at the root: `lint`, `typecheck`,
  `format:check`, and `test`.
- The current Trellis state has no active implementation task before this MVP
  parent task.

## Scope Decision

The MVP scope is the first-version package and demo described here. Later
roadmap items remain out of scope unless a future task explicitly reopens them.

## Requirements

- R1. Core package provides framework-free TypeScript models, Chinese-first
  type names with English aliases, search ranking, A-Z grouping, recent
  selection helpers, and region selection helpers.
- R2. Data package provides built-in domestic city and province / city /
  district data sufficient for a credible demo, plus validation for uniqueness,
  hierarchy integrity, names, pinyin, initials, and hot-city references.
- R3. Providers package provides the destination provider contract, local city
  provider, mock destination provider, and composed provider with graceful
  handling for empty results, timeouts, failures, and partial failures.
- R4. Taro adapter exposes Chinese-first component / hook APIs and English
  compatibility aliases for city selection, region selection, and destination
  search without owning core ranking or provider merging rules.
- R5. Demo Taro app demonstrates the first-version flows: city selection,
  region selection, destination search, empty state, and error / degraded
  provider state.
- R6. Documentation explains project positioning, quick start, Chinese API,
  provider integration, data model, validation, and first-version limitations.
- R7. Quality gates pass for the full workspace, including lint, type-check,
  formatting check, tests, and data validation.

## Proposed Child Task Map

- Core search and selection engine.
- Built-in data and validation scripts.
- Provider contracts and local / mock / composed providers.
- Taro adapter API and state behavior.
- Demo Taro app and documentation.
- Final integration, quality pass, and Trellis finish.

## Acceptance Criteria

- [ ] The root workspace commands pass using the documented pnpm fallback:
      `npm exec --yes --package pnpm@9.15.4 -- pnpm lint`,
      `typecheck`, `format:check`, and `test`.
- [ ] A data validation command exists and passes against the bundled data.
- [ ] `packages/core` can search by Chinese name, pinyin, initials, and alias;
      produces A-Z groups; ranks exact / prefix / pinyin / initials / alias /
      hot / recent matches predictably; and remains free of UI dependencies.
- [ ] `packages/data` exports versioned city and region datasets consumable by
      core and providers.
- [ ] `packages/providers` can return local city results, mock hotel / airport /
      landmark / overseas examples, and composed results with degraded-state
      metadata.
- [ ] `packages/taro` exports Chinese-first and English-compatible APIs with one
      shared behavior path and typed selection events returning structured
      objects.
- [ ] `apps/demo-taro` is runnable or buildable enough to demonstrate the MVP
      flows locally.
- [ ] Chinese docs cover quick start, API, provider, data, and known
      first-version limitations.
- [ ] The MVP explicitly excludes real overseas / hotel API integration,
      Flutter adapter, uni-app adapter, native SDKs, and release automation.

## Out of Scope

- Real overseas city, hotel, airport, or landmark service integration.
- Flutter widget package and Flutter demo.
- uni-app, React Native, Android native, or iOS native adapters.
- npm publishing, GitHub Pages deployment, and native app release automation.

## Notes

- Parent task should not be started for broad implementation until child tasks
  are planned. Each child should pass through PRD / design / implement, then
  `task.py start`, implementation, quality check, spec update, commit, and
  archive.
