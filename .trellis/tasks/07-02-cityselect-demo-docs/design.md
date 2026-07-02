# Demo And Docs Design

## Scope

`apps/demo-taro` proves the MVP package graph works end to end without real
remote services. The demo is a deterministic TypeScript snapshot and CLI runner
that a future Taro UI can render. Documentation is Chinese-first and covers
quick start, API, provider, data, validation, and first-version limitations.

## Demo Surface

The demo snapshot covers five states:

- city selection search for `hz`,
- province / city / district path for Zhejiang / Hangzhou / Xihu,
- destination search for airport mock results,
- empty local city search,
- degraded provider state.

Root `demo:taro` compiles the workspace and runs the emitted demo CLI. It prints
compact JSON so local users and CI can inspect the end-to-end state.

## Documentation

Docs are committed as Markdown:

- `README.md`: Chinese quick start and MVP scope.
- `docs/api.zh-CN.md`: Chinese-first API examples.
- `docs/provider.md`: provider contract and degraded states.
- `docs/data.md`: data model and validation flow.
- `docs/design.md`: architecture summary and first-version boundaries.

## Test Strategy

Tests call `创建Demo快照` and assert the five demo states directly. The final
quality pass runs `demo:taro` to verify the real command.
