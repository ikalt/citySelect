# 数据源更新、包体积优化与发布流程技术设计

## Architecture

下一阶段把 `packages/data` 拆成三个明确边界：

1. Source acquisition
   - 负责下载、记录、归档、校验源数据。
   - 输出 source snapshot 和 source manifest。
2. Data generation
   - 负责从一个或多个 source snapshot 生成 normalized records。
   - 输出轻量城市入口、分片行政区数据、元数据和索引。
3. Runtime loading
   - 负责同步兼容入口和异步懒加载入口。
   - UI / provider 不直接解析源数据或生成产物结构。

## Proposed Data Outputs

保留兼容输出：

- `packages/data/src/index.ts`
  - 继续导出当前同步 API。
  - 可在迁移阶段仍提供 `内置行政区列表`，但文档标记为 heavy import。

新增轻量输出：

- `packages/data/src/cities.ts`
  - 城市搜索、热门城市和数据版本元信息。
- `packages/data/src/regions/index.ts`
  - 仅导出 region loader、manifest 和类型。
- `packages/data/src/generated/region-manifest.ts`
  - 分片列表、层级数量、source 信息、checksum。
- `packages/data/src/generated/regions/<province-code>.json` 或 `.ts`
  - 按省分片大陆行政区。
- `packages/data/src/generated/regions/hmt.json` 或 `.ts`
  - 港澳台分片。

## Runtime API Shape

同步兼容 API：

```ts
const 内置城市列表: readonly 城市[]
const 内置行政区列表: readonly 城市[] // heavy compatibility export
function 按编码查找行政区(编码: string): 城市 | undefined
```

异步懒加载 API：

```ts
type 行政区分片键 = string

type 行政区数据加载器 = {
  获取分片列表(): readonly 行政区分片信息[]
  加载分片(分片键: 行政区分片键): Promise<readonly 城市[]>
  按编码加载路径(编码: string): Promise<readonly 城市[]>
  按父级编码加载子级(父级编码?: string): Promise<readonly 城市[]>
}
```

English aliases mirror Chinese exports.

## Source Strategy

Recommended sequence:

1. Build the source manifest and loader architecture around current data first.
2. Split artifacts and lazy loaders so the package can ship without forcing the full region dataset into default imports.
3. Add research adapters for:
   - 民政部 / 国家地名信息库公开页面或可下载资源。
   - 省级民政部门乡级代码公开页面。
   - `cn-division@2026.0.0` as newer county-level candidate.
   - current `china-division@2.7.0` as township-level fallback.
4. Only replace source after validation proves coverage does not regress.

## Initial Implementation Slice

The first implementation slice should not change the source data. It should
generate split artifacts from the current `china-division@2.7.0` snapshot,
add source manifest metadata, expose lazy loaders, add a repeatable size check,
and document the release / PR flow. Source replacement becomes a follow-up
slice after the package structure is stable.

## Parent / Child Boundaries

- Parent `07-03-data-source-bundle-release` owns the overall roadmap and final integration criteria.
- Child `07-04-bundle-lazy-release` owns the first shippable architecture change: split generated artifacts, lazy runtime APIs, size check, and release skeleton.
- Child `07-04-source-refresh-research` owns source discovery and source replacement decisions. It must not start source replacement until the manifest/shard contract from `07-04-bundle-lazy-release` exists or is explicitly rejected.

## Compatibility

- Existing Taro/demo code can continue using sync helpers until lazy APIs exist.
- New lazy APIs should be additive first.
- If `内置行政区列表` remains exported, docs must label it as heavy and recommend loader APIs for production.
- If a future major version removes heavy sync export, that must be a separate breaking-change task.

## Package / Release Design

Package metadata to prepare:

- `license`
- `description`
- `keywords`
- `files`
- explicit `exports`
- `types`
- release notes or `CHANGELOG.md`

Candidate scripts:

- `build`
- `size:data`
- `release:check`
- `pack:dry-run`

Release check should run existing quality gates plus data validation and size report.

## Risks

- Official public source may not expose a stable machine-readable full dataset.
- Mixing newer county-level data with older township-level data can create parent/child drift.
- Moving to lazy loading can create async API complexity in Taro and providers.
- Splitting generated data into many files can improve runtime loading but complicate package exports and build output.
- `内置行政区列表` compatibility export keeps bundle pressure until consumers migrate.

## Rollback

- Keep the current generated full artifact as a compatibility baseline until lazy API tests pass.
- Generate split artifacts from the same source first before changing source versions.
- If source replacement fails validation, keep current source and land loader/package improvements independently.
