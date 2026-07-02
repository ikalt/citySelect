# 全国完整行政区划数据实施计划

## Preconditions

- 用户已确认第一版不纳入村 / 社区 / 居委会第五级。
- 用户已确认数据来源策略：官方公开源优先，第三方整理库可作为备选种子。
- 用户已确认全国范围包含港澳台。
- 用户已确认港澳台允许采用可变深度路径和地区专属层级名称。
- Phase 2 开始前读取 `trellis-before-dev`，并按 backend / frontend spec 做实现前检查。

## Steps

1. Source research and fixture capture
   - 确认可用数据源、数据截止日期、下载 / 抓取方式和授权风险。
   - 优先尝试官方公开源；若官方源无法稳定批量获取，选择第三方整理库作为备选种子。
   - 第三方种子必须记录库名、URL、版本 / commit、许可证和获取时间。
   - 为港澳台记录单独确认来源、编码稳定性和层级口径。
   - 保存小型源 fixture，用于生成脚本测试。
   - 记录源 URL、抓取时间和数据摘要。

2. Core type and path compatibility
   - 扩展行政区级别到 `"乡镇街道"`。
   - 更新 `创建行政区选择结果` 支持大陆四级路径和港澳台可变深度路径。
   - 增加大陆四级路径、港澳台路径测试，并确认现有三层测试继续通过。

3. Data generation pipeline
   - 新增源数据目录、生成脚本和生成产物。
   - 从源数据生成大陆四级记录、港澳台记录、索引和来源元数据。
   - 避免在 `packages/data/src/index.ts` 手写完整大数组。

4. Data validation
   - 扩展 `校验城市数据` / `校验内置数据`。
   - 输出各层级数量和数据版本。
   - 校验港澳台编码不与大陆编码冲突，路径深度和父级链合法。
   - 添加特殊行政结构和错误 fixture 测试。

5. Public data API
   - 保留 `内置城市列表`、`内置行政区列表`、`热门城市编码` 兼容导出。
   - 新增按编码、父级、层级、路径查询 helper。
   - 确保 providers 和 demo 通过 public API 消费数据。

6. Taro adapter and demo
   - 更新四级选择状态、港澳台可变路径状态和 selection result。
   - 增加省 / 市 / 区县 / 乡镇街道 demo snapshot，以及一个港澳台路径 snapshot。
   - 保留原三层示例。

7. Documentation and specs
   - 更新 README、`docs/data.md`、`docs/api.zh-CN.md`、`docs/design.md`。
   - 如形成新的数据生成 / validation 合同，更新 `.trellis/spec/backend/database-guidelines.md`。

8. Full verification
   - `npm exec --yes --package pnpm@9.15.4 -- pnpm lint`
   - `npm exec --yes --package pnpm@9.15.4 -- pnpm typecheck`
   - `npm exec --yes --package pnpm@9.15.4 -- pnpm format:check`
   - `npm exec --yes --package pnpm@9.15.4 -- pnpm test`
   - `npm exec --yes --package pnpm@9.15.4 -- pnpm validate:data`
   - `npm exec --yes --package pnpm@9.15.4 -- pnpm demo:taro`

## Risky Files

- `packages/core/src/index.ts`
- `packages/data/src/index.ts`
- `packages/data/src/validate-data.ts`
- generated data artifacts under `packages/data`
- `packages/taro/src/index.ts`
- `apps/demo-taro/src/index.ts`
- docs and backend spec files

## Rollback Points

- Commit source/generation plumbing before replacing committed data.
- Commit core compatibility changes with tests before data volume changes.
- If validation fails on generated national data, do not hand-edit output; fix source normalization or validation rules and regenerate.

## Start Gate

Before `task.py start`, user must review and approve:

- PRD scope: four levels only, no village/community level.
- Source strategy: official first, third-party fallback with attribution and validation.
- Hong Kong / Macau / Taiwan scope and variable-depth compatibility.
- Generated data shape and validation plan.
