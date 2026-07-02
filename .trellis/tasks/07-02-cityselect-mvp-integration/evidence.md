# CitySelect MVP Integration Evidence

## Scope

This evidence file closes the final integration child for parent task
`07-02-cityselect-mvp`. It audits every parent acceptance criterion against the
implemented workspace and the final full-scope commands.

## Final Quality Gate

All commands were run from `/home/lumi/project/citySelect` on branch
`codex/cityselect-mvp` using the documented pnpm fallback.

| Check | Command | Result |
| --- | --- | --- |
| Lint | `npm exec --yes --package pnpm@9.15.4 -- pnpm lint` | exit 0 |
| TypeScript | `npm exec --yes --package pnpm@9.15.4 -- pnpm typecheck` | exit 0 |
| Format | `npm exec --yes --package pnpm@9.15.4 -- pnpm format:check` | exit 0, `All matched files use Prettier code style!` |
| Tests | `npm exec --yes --package pnpm@9.15.4 -- pnpm test` | exit 0, `Test Files 5 passed (5)`, `Tests 25 passed (25)` |
| Data validation | `npm exec --yes --package pnpm@9.15.4 -- pnpm validate:data` | exit 0, `version=2026.07-cn-region-mvp cities=12 regions=26`, `ok` |
| Demo | `npm exec --yes --package pnpm@9.15.4 -- pnpm demo:taro` | exit 0, deterministic JSON snapshot printed |

## Demo Evidence

`demo:taro` prints a deterministic MVP snapshot covering:

- City selection: keyword `hz` returns `杭州` / `330100`.
- Region selection: `330000 / 330100 / 330106` resolves to
  `浙江省 / 杭州市 / 西湖区`.
- Destination search: keyword `机场` returns `新加坡樟宜机场`.
- Empty state: keyword `火星` returns `状态: 空`, `结果数量: 0`, and
  `没有找到相关目的地`.
- Degraded provider state: `状态: 部分失败`, `结果数量: 1`, and
  `部分结果暂不可用`.

## Parent Acceptance Criteria Mapping

| Parent AC | Evidence | Status |
| --- | --- | --- |
| Root workspace commands pass with pnpm fallback | Final quality gate above: lint, typecheck, format:check, and test all exited 0. | Satisfied |
| Data validation command exists and passes | Root `package.json` has `validate:data`; command exited 0 against 12 cities and 26 regions. | Satisfied |
| `packages/core` supports Chinese name, pinyin, initials, alias, A-Z groups, exact/prefix/pinyin/initials/alias/hot/recent ranking, and has no UI dependency | `packages/core/src/index.ts` exports `创建城市搜索索引`, `搜索城市`, `按首字母分组城市`, `更新最近访问城市`, and `创建行政区选择结果`; `packages/core/src/index.test.ts` covers Chinese, prefix, pinyin, initials, alias, default hot/recent order, grouping, recent dedupe, and invalid region path errors. | Satisfied |
| `packages/data` exports versioned city and region datasets consumable by core/providers | `packages/data/src/index.ts` exports `数据版本`, `内置城市列表`, `内置行政区列表`, `热门城市编码`, `校验内置数据`, and English aliases; tests compile records against core types and validation passes. | Satisfied |
| `packages/providers` returns local city results, mock hotel/airport/landmark/overseas examples, and composed degraded-state metadata | `packages/providers/src/index.ts` exports local, mock, and composed providers plus statuses `成功`, `空`, `部分失败`, `全部失败`, `超时`; tests cover local search, mock `东京酒店` / `新加坡樟宜机场` / `首尔明洞`, local-before-remote ordering, partial failure, total failure, and timeout. | Satisfied |
| `packages/taro` exposes Chinese-first and English-compatible APIs with one shared behavior path and typed structured events | `packages/taro/src/index.ts` exports `城市选择器` / `CitySelect`, `省市区选择器` / `RegionSelect`, `目的地搜索` / `DestinationSearch`; tests assert alias function identity, Chinese/English props parity, and structured city/region callbacks. | Satisfied |
| `apps/demo-taro` is runnable/buildable enough to demonstrate MVP flows locally | Root `demo:taro` runs `tsc -b` and `TMPDIR=/tmp tsx apps/demo-taro/src/run-demo.ts`; command exited 0 with the five-flow snapshot listed above. | Satisfied |
| Chinese docs cover quick start, API, provider, data, and first-version limitations | `README.md`, `docs/api.zh-CN.md`, `docs/provider.md`, `docs/data.md`, and `docs/design.md` cover those topics. | Satisfied |
| MVP exclusions are explicit | Parent PRD and docs keep real overseas/hotel APIs, Flutter adapter, uni-app adapter, native SDKs, npm publishing, GitHub Pages, and release automation out of scope. | Satisfied |

## Spec Update Judgment

No new durable code contract was discovered during this integration-only child.
Prior child tasks already captured the durable findings in:

- `.trellis/spec/backend/quality-guidelines.md`
- `.trellis/spec/backend/database-guidelines.md`
- `.trellis/spec/backend/error-handling.md`
- `.trellis/spec/frontend/component-guidelines.md`
- `.trellis/spec/frontend/quality-guidelines.md`

## Repository Hygiene

- `git ls-files tmp | wc -l` returned `0`.
- Integration task dirty paths before this evidence commit were limited to
  `.trellis/tasks/07-02-cityselect-mvp-integration/task.json` and this
  evidence file.
- All earlier MVP child implementation tasks have been archived.
