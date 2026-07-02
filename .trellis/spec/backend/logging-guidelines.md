# Logging Guidelines

> Diagnostics for scripts, providers, and demos.

---

## Overview

There is no logging library decision yet. Keep logging minimal until packages
exist. Prefer deterministic validation output and test failures over noisy
runtime logs.

---

## Scripts

Data scripts may log:

- source file being processed,
- data version,
- record counts,
- validation failures with record code/name/path,
- generated artifact paths,
- elapsed time for long operations.

Scripts must exit non-zero on validation failure.

---

## Providers

Provider packages should not `console.log` during normal library usage. Expose
failure state to callers instead. Demo apps may decide how to present or log
that state.

If provider diagnostics become necessary, introduce a small optional diagnostic
callback or logger interface instead of hard-coded global logging.

---

## Demo Apps

Demo logging is allowed for development-only examples, but it must not be part
of acceptance criteria. The user-visible state should be rendered in the UI:
loading, empty, error, timeout, partial failure.

---

## What NOT to Log

- API keys, tokens, cookies, or vendor credentials.
- Full remote payloads from real providers.
- Large generated city/region artifacts.
- User location beyond the selected/located city object needed by the demo.

---

## Examples

Good script output:

```text
validate:data version=2026.06-cn-region cities=342 regions=3100
validate:data ok
```

Bad library behavior:

```ts
console.log("remote provider failed", rawVendorPayload)
```
