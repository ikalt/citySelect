# Type Safety

> TypeScript and public API type-safety guidelines.

---

## Overview

TypeScript strict mode is required by the design baseline. Public API types
must support Chinese-first documentation and runtime objects while offering
English aliases for ecosystem compatibility.

---

## Type Organization

- Shared domain types belong in `packages/core`.
- Data artifact types belong in `packages/data` unless shared by core.
- Provider contracts belong in `packages/providers`.
- Component prop/event types belong in `packages/taro`, but should reuse core
  and provider types.

---

## Chinese API and English Aliases

Chinese types are first-class where tooling supports them:

```ts
type 城市 = {
  编码: string
  名称: string
  省份名称?: string
  拼音?: string
  首字母?: string
  级别: "省" | "市" | "区县"
  国家代码?: "CN"
}

type City = 城市
```

For English compatibility, use aliases or mappers instead of duplicating
business models.

---

## Runtime Validation

Validate external or generated data at boundaries:

- generated city/region artifacts,
- provider payloads,
- remote provider adapters,
- Flutter/Dart generated outputs.

Do not rely on TypeScript types alone for generated JSON correctness.

---

## Props and Events

- Selection callbacks return structured typed objects.
- English props should map to the same internal type path as Chinese props.
- Prefer discriminated unions for state such as provider status and location
  status.

---

## Forbidden Patterns

- Do not use `any` for public props, provider results, or data records.
- Do not represent city, region, or destination results as bare strings.
- Do not maintain separate Chinese and English model implementations.
- Do not cast raw provider payloads directly in UI components.
