# 包体积优化、懒加载与发布骨架技术设计

## Architecture

在 `packages/data` 内建立两个消费层：

1. Light layer
   - 城市搜索、热门城市、数据版本、source summary。
   - 默认 package 入口优先服务轻量城市选择。
2. Region lazy layer
   - region manifest。
   - per-shard generated records。
   - async loader helper。

同步 full-region API 作为 compatibility layer 保留，但文档标记 heavy。

## Generated Outputs

候选输出结构：

```text
packages/data/src/generated/
  cities.ts
  region-manifest.ts
  regions-full.ts              # heavy compatibility
  regions/
    110000.ts
    120000.ts
    ...
    820000.ts
    hmt.ts
```

`regions-full.ts` 可以在初始迁移阶段继续存在，保证兼容；后续主入口不应为了城市数据导入它。

## Manifest Contract

```ts
type 行政区分片信息 = {
  分片键: string
  名称: string
  根编码列表: readonly string[]
  记录数: number
  层级统计: 行政区层级统计
  地区口径?: 地区口径
  checksum: string
}
```

Manifest must also expose source summary and total counts.

## Lazy API Contract

```ts
function 获取行政区分片列表(): readonly 行政区分片信息[]
async function 加载行政区分片(分片键: string): Promise<readonly 城市[]>
async function 按编码加载行政区路径(编码: string): Promise<readonly 城市[]>
async function 按父级编码加载行政区子级(父级编码?: string): Promise<readonly 城市[]>
```

English aliases mirror Chinese exports.

## Shard Selection

- Mainland province root code is the shard key, for example `330000`.
- Hong Kong / Macau / Taiwan can be combined as `hmt` initially, or use root-code shards if simpler for implementation.
- A small code-to-shard map can live in manifest so path/child lookup can find the right shard without scanning all data.

## Compatibility

- Existing imports from `@ikalt/city-select-data` keep compiling.
- New exports may be added to the same package and documented as preferred for production.
- Tests must ensure old sync path and new lazy path produce the same sample paths.

## Release Skeleton

Add commands and metadata without publishing:

- `size:data`: prints generated source/dist sizes and shard summary.
- `pack:dry-run`: runs `npm pack --dry-run` or a pnpm-compatible equivalent when package metadata is ready.
- `release:check`: runs quality gates, data validation, demo, and size report.

## Risks

- Dynamic imports of generated TypeScript modules must work in Node ESM and workspace TypeScript.
- Many generated modules can slow typecheck if emitted as large TS literals; JSON-string parsing may still be needed.
- Keeping full compatibility export means the heavy file remains in the package, but it should not be parsed by light imports.
