# 数据源更新、包体积优化与发布流程

## Goal

把 CitySelect 从“全国数据已可用”推进到“可持续维护、可按需加载、可发布交付”的下一阶段：

- 数据源层面支持更近年份或官方直采源评估与接入。
- 包体积层面避免默认入口一次性加载完整 19MB 生成产物。
- 运行时层面支持行政区数据懒加载 / 分片加载。
- 工程层面补齐发布、PR、版本与验证流程。

## Background

- 当前已完成全国行政区数据任务，提交为 `4a2eff4 feat(data): add national region dataset`。
- 用户在 2026-07-04 继续推进，按推荐路线先做“包体积优化 + 懒加载 + 发布流程骨架”，再做“官方/更近源替换”。
- 当前分支 `codex/cityselect-mvp` 已推送到 `origin/codex/cityselect-mvp`。
- 当前环境没有 `gh` CLI，也没有 `GH_TOKEN` / `GITHUB_TOKEN`，无法在命令行直接创建 GitHub PR。
- 当前 `git remote show origin` 显示远端 HEAD 为 `codex/cityselect-mvp`，远端分支查询一度只返回 `refs/heads/codex/cityselect-mvp`；PR base 需要再确认远端是否存在 `main` 或其他目标分支。
- 当前数据版本是 `2026.07-cn-region-full-2023-nbs`，来源为 `china-division@2.7.0` 第三方种子，数据截止日期 `2023-06-30`。
- 当前 generated artifact：
  - `packages/data/src/generated/regions.ts` 约 `19M`。
  - `packages/data/dist/generated/regions.js` 约 `19M`。
  - source snapshot 里的 `streets.json` 约 `4.0M`。
- 当前 root scripts：
  - `generate:data`
  - `validate:data`
  - `demo:taro`
  - `lint`
  - `typecheck`
  - `test`
  - `format:check`
- 当前 `packages/data/package.json` 仍是 private package，exports 仅有 `"."` 指向 `./src/index.ts`。

## External Source Findings

- 新华社 2025-07-07 报道民政部出台《行政区划代码管理办法》，自 2025-09-01 起施行；报道说明县级及以上代码由民政部确定，乡级代码由省级民政部门确定，民政部每年在国家地名信息库发布一次全国代码信息，省级民政部门每半年发布一次本地区乡级代码信息。
  - URL: `https://www.news.cn/20250707/6f736052004d482eaf004f559fecf7df/c.html`
- 国家统计局 2025-08-25 咨询答复说明：自 2024-10 起，国家统计局继续公开统计标准方法，但不再公开具体统计用区划代码和城乡划分代码。
  - URL: `https://www.stats.gov.cn/hd/lyzx/zxgk/202509/t20250903_1960996.html`
- npm metadata 当前可见：
  - `china-division@2.7.0`，2023-09-13 修改，乡级数据完整但截止 2023-06-30。
  - `cn-division@2026.0.0`，2026-04-26 修改，更近但只覆盖到省 / 市 / 区县，不能单独满足乡镇街道四级。
  - `province-city-china@8.5.8`，2024-09-05 修改，数据口径和港澳台/乡级覆盖需要进一步验证。

## Requirements

- R1. 远端 / PR 流程：
  - 记录当前实现分支已推送。
  - 明确无法自动开 PR 时的原因和手动 compare URL。
  - 后续补齐可自动创建 PR 的工具要求，例如 `gh` CLI 或 GitHub token。
- R2. 数据源升级：
  - 在包体积 / 懒加载骨架稳定后做 source research，比较官方直采、半官方公开页面、第三方种子组合的可行性。
  - 官方直采优先，但不能把不稳定网页抓取伪装成稳定 API。
  - 若使用第三方源，必须标注版本、许可证、截止日期、获取时间和校验边界。
  - 保持大陆四级和港澳台可变深度路径要求；不能因为更近源缺乡级而降级数据范围。
- R3. 多源合成：
  - 支持“更近县级源 + 现有乡级源”的候选策略，但必须标注混合口径。
  - 支持 source manifest，能说明每一层级来自哪个源、截止日期是什么。
- R4. 包体积优化：
  - 本任务的首要实施片是降低默认入口包体积风险。
  - 默认 `@ikalt/city-select-data` 入口不得强制解析完整 19MB 行政区数据。
  - 提供轻量入口用于城市搜索 / 热门城市。
  - 提供行政区完整数据的按需入口或加载 API。
- R5. 懒加载：
  - 支持至少按省级切分大陆行政区数据。
  - 支持港澳台单独切分或独立 chunk。
  - 查询 helper 要能在同步数据和异步加载之间提供清晰边界。
- R6. 兼容性：
  - 现有 `内置城市列表`、`内置行政区列表`、`按编码查找行政区` 等 API 不能无提示破坏。
  - 如果引入异步 lazy API，命名上应明确区分同步完整数据和异步分片数据。
- R7. 发布流程：
  - 设计 package exports、build 输出、版本号、CHANGELOG 或 release notes 入口。
  - 明确 private 包转发布包需要哪些字段：`version`、`license`、`files`、`exports`、README、types。
  - 添加或规划发布前验证命令。
- R8. 文档：
  - 更新数据源、包体积、懒加载、发布流程、PR 创建方式。
  - 记录官方源不可用或不可稳定抓取时的 fallback 策略。
- R9. 质量门禁：
  - 保持 pnpm fallback。
  - 至少通过 `lint`、`typecheck`、`format:check`、`test`、`validate:data`、`demo:taro`。
  - 包体积优化应新增可重复的 size 检查或 bundle report。

## Child Task Map

- `07-04-bundle-lazy-release`：第一阶段实施任务，负责包体积基线、source manifest、分片生成、懒加载 API、发布骨架和文档/spec 更新。
- `07-04-source-refresh-research`：第二阶段研究/替换任务，负责官方与更近源研究、候选源对比、混合口径策略和必要的数据源替换。该任务依赖第一阶段产出的 source manifest 与分片结构，避免在包体积问题未解决前继续扩大默认入口。

## Acceptance Criteria

- [x] 当前分支远端状态和 PR 创建状态被记录；如果自动 PR 失败，给出明确原因和手动 URL。
- [x] 生成脚本支持 source manifest，能表达层级级别的数据来源和 cutoff。
- [x] 数据产物拆分为轻量入口和按需加载入口，默认导入不再解析完整行政区数据。
- [x] 提供至少一个按省懒加载行政区路径示例，且 Taro/demo 能展示懒加载路径。
- [x] 同步兼容 API 的保留或迁移策略写入文档，并有测试覆盖。
- [x] 发布流程文档和 package metadata 规划完成；如果本任务实施发布准备，发布前 dry-run 或等价验证通过。
- [x] 包体积检查命令或报告产物可复现。
- [x] 完成数据源研究记录，包含官方源、新近第三方源、现用源的覆盖层级、日期、授权和稳定性比较；若研究结果不足以替换当前源，则记录 defer 原因和下一步。
- [x] `lint`、`typecheck`、`format:check`、`test`、`validate:data`、`demo:taro` 通过。

## Out Of Scope

- 第一轮不直接纳入村 / 社区 / 居委会第五级，除非另开任务评估数据口径和包体积。
- 不承诺在没有稳定公开接口时完全自动化官方直采。
- 不在缺少 GitHub token / `gh` CLI 的环境中伪造 PR 已创建状态。
- 不在规划阶段直接发布 npm 包。

## Implementation Priority

- P1. 先做包体积优化、分片懒加载和发布流程骨架。
- P2. 在结构稳定后做官方 / 更近源研究与替换评估。
- 原因：当前数据已经可用，但默认入口解析约 19MB 生成产物，这是发布前更直接的风险；官方直采源仍需稳定性验证。
