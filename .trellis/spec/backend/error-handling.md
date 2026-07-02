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

## Scenario: Provider Search Response Contract

### 1. Scope / Trigger

- Trigger: `packages/providers` exposes local, mock, and composed destination
  providers that must degrade gracefully without leaking raw exceptions to UI
  adapters.
- Applies when changing provider status values, composed-provider error
  handling, source timeouts, or provider result shape.

### 2. Signatures

```ts
type Provider状态 = "成功" | "空" | "部分失败" | "全部失败" | "超时"

type Provider源错误 = {
  来源: string
  类型: "失败" | "超时"
  消息: string
}

type ProviderSearchResponse = {
  状态: Provider状态
  结果: 目的地[]
  错误列表: Provider源错误[]
}

type 目的地Provider = {
  名称: string
  搜索(关键词: string): Promise<ProviderSearchResponse>
  获取热门?(): Promise<ProviderSearchResponse>
  获取定位城市?(): Promise<城市 | null>
}

function 创建本地城市Provider(选项?: 本地城市Provider选项): 目的地Provider
function 创建模拟目的地Provider(目的地列表?: readonly 目的地[]): 目的地Provider
function 创建组合Provider(选项: {
  providers: readonly 目的地Provider[]
  名称?: string
  超时时间毫秒?: number
}): 目的地Provider
```

English aliases mirror the Chinese helper names:

```ts
const createLocalCityProvider: typeof 创建本地城市Provider
const createMockDestinationProvider: typeof 创建模拟目的地Provider
const createComposedProvider: typeof 创建组合Provider
```

### 3. Contracts

- Providers return structured responses, not bare destination arrays.
- Local city provider uses `packages/core` search over `packages/data` records.
- Mock destination provider is deterministic and never calls real remote
  services.
- Composed provider catches source throws and timeouts, preserves successful
  source results, and reports source errors in `错误列表`.
- Local strong matches stay before mock / remote-like provider results.

### 4. Validation & Error Matrix

- Successful provider with results -> `状态: "成功"`.
- Successful provider with no results -> `状态: "空"`.
- At least one provider succeeds and at least one fails / times out ->
  `状态: "部分失败"`.
- Every provider throws -> `状态: "全部失败"`.
- Every provider times out -> `状态: "超时"`.
- Timeout error message must include provider name and timeout milliseconds.

### 5. Good/Base/Bad Cases

- Good: composed search returns local city results even when a remote-like
  provider fails.
- Base: single local provider returns `空` for unmatched domestic city keywords.
- Bad: composed search throws because one optional provider failed.

### 6. Tests Required

- Local provider searches bundled domestic city data.
- Mock provider returns hotel / airport / landmark examples.
- Empty searches produce `空`.
- Composed provider keeps local city matches before remote-like results.
- Partial failure preserves successful results and records source failure.
- All-failed and all-timeout cases return distinct statuses.

### 7. Wrong vs Correct

#### Wrong

```ts
const remoteResults = await remoteProvider.搜索(关键词)
return localResults.concat(remoteResults)
```

This throws away local usability when the remote provider fails.

#### Correct

```ts
const 响应 = await 组合Provider.搜索(关键词)
if (响应.状态 === "部分失败") {
  renderResultsWithDegradedNotice(响应.结果)
}
```

The provider boundary communicates degradation explicitly while preserving
usable results.

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
