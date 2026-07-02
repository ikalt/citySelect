# Providers Design

## Scope

`packages/providers` owns asynchronous destination lookup contracts and built-in
provider implementations. It wraps local city search from core/data, exposes
mock destination results for MVP demos, and composes multiple provider sources
with explicit status metadata.

## Public API

- Types: `目的地`, `Destination`, `目的地Provider`, `DestinationProvider`,
  `ProviderSearchResponse`, and provider status types.
- Local provider: `创建本地城市Provider` / `createLocalCityProvider`.
- Mock provider: `创建模拟目的地Provider` / `createMockDestinationProvider`.
- Composed provider: `创建组合Provider` / `createComposedProvider`.

## Response Shape

`搜索` returns a structured response:

```ts
type ProviderSearchResponse = {
  状态: "成功" | "空" | "部分失败" | "全部失败" | "超时"
  结果: 目的地[]
  错误列表: ProviderSourceError[]
}
```

This lets Taro and demos distinguish empty results from degraded provider
failure without catching raw errors.

## Ranking

Local city results come from `搜索城市` and are emitted as `类型: "城市"`.
Composed search keeps local strong matches before mock / remote-like results.
Within each provider result set, provider order is stable.

## Error Handling

The composed provider wraps every source with timeout handling. Source failures
become structured errors. If at least one source succeeds with results and
another fails, status is `部分失败`. If all sources fail, status is `全部失败`,
or `超时` when timeout is the only failure class. Empty successful sources return
`空`.

## Test Strategy

Tests use deterministic local data and mock providers. They must cover local
search, mock destination examples, empty results, timeout, source failure,
partial success, and local-before-remote ordering.
