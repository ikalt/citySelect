# 包体积优化、懒加载与发布骨架

## Goal

把当前 19MB 级别的同步全国行政区生成产物拆成可按需加载的数据结构，并补齐发布前需要的体积检查、release 骨架和文档。

本子任务不更换当前数据源，继续基于 `china-division@2.7.0` snapshot 生成数据。官方 / 更近源替换由 sibling task `07-04-source-refresh-research` 处理。

## Parent / Dependency Context

- Parent: `07-03-data-source-bundle-release`。
- This child must finish before source replacement is attempted, unless source work is read-only research.
- This child produces the source manifest and shard contract that the source-refresh child must consume.

## Confirmed Facts

- 当前 `packages/data/src/generated/regions.ts` 约 `19M`。
- 当前 `packages/data/dist/generated/regions.js` 约 `19M`。
- 当前 `packages/data/src/index.ts` 导入 `./generated/regions.js`，默认 data 入口会解析完整 generated payload。
- 当前 `packages/data/package.json` 仍是 private package，exports 只有 `"."`。
- 用户已同意保留同步 heavy compatibility API，同时新增推荐的 lazy API。

## Requirements

- R1. 保留兼容：
  - 保留 `内置城市列表`、`内置行政区列表`、`按编码查找行政区`、`按父级编码查找行政区`、`按级别查找行政区`、`获取行政区路径` 等同步 API。
  - 文档明确 `内置行政区列表` 和同步 region helper 属于 heavy compatibility API。
- R2. 新增轻量入口：
  - 默认城市搜索/热门城市路径可以不解析完整行政区数据。
  - 提供轻量城市数据和元数据出口。
- R3. 新增分片生成：
  - 大陆行政区至少按省级编码切分。
  - 港澳台单独切分。
  - 生成 manifest，包含 shard key、记录数、层级统计、source cutoff、checksum 或等价完整性信息。
- R4. 新增 lazy API：
  - 能列出分片。
  - 能加载指定分片。
  - 能按编码加载完整路径。
  - 能按父级编码加载子级。
  - API 名称明确异步语义，不与同步 helper 混淆。
- R5. Taro/demo：
  - demo 增加至少一个懒加载四级路径 snapshot。
  - UI adapter 不复制分片索引/层级规则。
- R6. 发布骨架：
  - 添加或规划 package exports、files、types、license、release check。
  - 添加可重复 `size:data` 或等价体积报告命令。
  - 添加 `pack:dry-run` 或等价发布前检查。
- R7. 文档/spec：
  - README、`docs/data.md`、`docs/api.zh-CN.md`、`docs/design.md` 更新 lazy/heavy compatibility/发布流程。
  - `.trellis/spec/backend/database-guidelines.md` 更新 source manifest、lazy contract、size check 合同。
- R8. 验证：
  - 保持 `lint`、`typecheck`、`format:check`、`test`、`validate:data`、`demo:taro` 全部通过。
  - 新增体积/发布检查命令通过。

## Acceptance Criteria

- [ ] 默认轻量数据入口不解析完整 19MB region payload。
- [ ] 同步 heavy compatibility API 仍可用，并被文档明确标注。
- [ ] generated artifacts 拆分为城市轻量数据、region manifest、按省 region shards、HMT shard。
- [ ] lazy API 能加载浙江西湖区北山街道四级路径。
- [ ] lazy API 能加载台湾省 / 台北市 / 大安区路径。
- [ ] Taro/demo 有懒加载路径示例。
- [ ] `size:data` 或等价命令输出当前数据产物体积和 baseline。
- [ ] `pack:dry-run` / `release:check` 或等价命令可运行。
- [ ] 文档和 backend spec 记录 heavy compatibility、lazy API、source manifest 和发布检查。
- [ ] `lint`、`typecheck`、`format:check`、`test`、`validate:data`、`demo:taro` 通过。

## Out Of Scope

- 不更换当前数据源。
- 不删除同步 heavy compatibility API。
- 不发布 npm 包。
- 不纳入村 / 社区 / 居委会第五级。
