# Error Handling

> How errors are represented, propagated, and degraded.

---

## Overview

Core logic should be predictable and mostly synchronous. Providers and scripts
own most failure cases: timeouts, remote failures, malformed data, validation
errors, and partial provider results.

The product requirement is graceful degradation: local city search must remain
usable even when remote destination providers fail.

---

## Core Errors

- Pure search and grouping functions should return empty results for empty or
  unmatched input instead of throwing.
- Throw only for programmer errors or invalid data invariants that indicate a
  broken build artifact.
- Keep error messages actionable and include the failing code/path/version when
  validating generated data.

---

## Provider Errors

Provider implementations must handle:

- timeout,
- empty result,
- partial failure,
- complete failure,
- malformed remote payload.

The composed provider should rank local strong matches ahead of remote results
and preserve usable local results when remote providers fail.

Use explicit result states at the provider/UI boundary:

- success,
- partial failure,
- all failed,
- timeout,
- empty.

---

## Script Errors

Data scripts should fail fast with non-zero exit codes when validation fails.
They should print enough context to identify the bad record without dumping
large generated artifacts.

---

## Examples

Provider contract from the design baseline:

```ts
type 目的地Provider = {
  搜索(关键词: string): Promise<目的地[]>
  获取热门?(): Promise<目的地[]>
  获取定位城市?(): Promise<城市 | null>
}
```

A composed provider should treat remote failure as degraded search, not as a
reason to discard local city matches.

---

## Forbidden Patterns

- Do not make base tests depend on real remote services.
- Do not swallow validation errors in data generation scripts.
- Do not expose raw vendor errors directly through public UI APIs.
- Do not make `core` import provider-specific error classes.
