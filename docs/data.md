# 数据与校验

`packages/data` 提供 CitySelect 的全国行政区划数据、热门城市入口、查询 helper、来源元数据、懒加载分片和校验命令。完整数据不是手写在 `src/index.ts` 中，而是由源快照和生成脚本复现。

## 数据版本

```ts
{
  编码: "2026.07-cn-region-full-2023-nbs",
  名称: "CitySelect 全国四级行政区划数据（含港澳台）"
}
```

当前生成摘要：

| 类别       |  数量 |
| ---------- | ----: |
| 城市入口   |   337 |
| 行政区总数 | 45111 |
| 省级       |    31 |
| 地级       |   342 |
| 县级       |  2975 |
| 乡镇街道   | 41352 |
| 港澳台     |   411 |

## 数据范围

- 中国大陆覆盖省 / 自治区 / 直辖市、地级市 / 州 / 盟、区 / 县 / 县级市、乡镇 / 街道四级。
- 第一版不包含村 / 社区 / 居委会第五级。
- 港澳台包含在全国库中，使用 `地区口径` 标注为 `香港澳门特别行政区` 或 `台湾地区`。
- 港澳台不强行补齐大陆四级，消费者应优先使用 `路径编码` / `路径名称` 展示完整路径。
- `内置城市列表` 是轻量城市搜索入口，不等同于完整行政区列表；完整层级优先使用 lazy API。
- `内置行政区列表` 和同步 region helper 保留为兼容入口，会解析完整全国行政区数据，属于 heavy compatibility。

## 数据来源

当前采用第三方整理库作为可复现种子：

- npm package: `china-division@2.7.0`
- repository: `https://github.com/modood/Administrative-divisions-of-China`
- source snapshot: `packages/data/source/china-division-2.7.0/`
- package metadata license: `MIT`
- included `LICENSE`: `WTFPL-2.0`
- 数据截止日期：`2023-06-30`
- 生成脚本版本：`cityselect-generate-data-v1`

CitySelect 将该库标注为 `第三方种子`，不是官方原始数据。生成数据会通过本项目校验规则、编码形态校验、父级链校验和抽样测试兜底。

来源元数据包含全局来源和层级来源：

- `数据来源.层级来源.省级` / `地级` / `县级` / `乡级` / `港澳台`：记录每个层级的来源名称、来源类型、版本、cutoff 和记录数量。
- `获取行政区分片列表()` 返回的每个 `行政区分片信息` 也包含 `层级来源`，用于未来表达“某个分片的县级来自新源、乡级来自回退源”的混合口径。

当前所有层级仍指向 `china-division@2.7.0`。后续只有在官方或更新第三方源不降低大陆四级和港澳台覆盖时，才会替换或混合。

## 生成命令

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm generate:data
```

生成脚本读取：

- `packages/data/source/china-division-2.7.0/dist/provinces.json`
- `packages/data/source/china-division-2.7.0/dist/cities.json`
- `packages/data/source/china-division-2.7.0/dist/areas.json`
- `packages/data/source/china-division-2.7.0/dist/streets.json`
- `packages/data/source/china-division-2.7.0/dist/HK-MO-TW.json`

输出：

- `packages/data/src/generated/cities.ts`：轻量城市、热门城市、数据版本和来源元数据。
- `packages/data/src/generated/regions-full.ts`：完整行政区兼容产物。
- `packages/data/src/generated/regions.ts`：旧生成入口兼容转发。
- `packages/data/src/generated/region-manifest.ts`：分片 manifest、编码到分片索引、根节点列表。
- `packages/data/src/generated/region-shards.ts`：动态 import 分片 loader。
- `packages/data/src/generated/regions/*.ts`：大陆按省级编码切分，港澳台合并到 `hmt.ts`。

生成文件是 committed artifact，但被 ESLint 和 Prettier 忽略。修改数据范围时应修生成脚本并重新生成，不手工 patch 大型产物。

## 导出

轻量城市入口：

```ts
import { 内置城市列表, 热门城市编码, 数据来源 } from "@ikalt/city-select-data/cities"
```

Lazy 行政区入口：

```ts
import {
  获取行政区分片列表,
  加载行政区分片,
  预加载行政区分片,
  按编码加载行政区路径,
  按父级编码加载行政区子级,
} from "@ikalt/city-select-data/regions"
```

参考项目里“提前加载本地城市数据，避免首次弹出卡顿”的经验在这里落实为分片预取：进入行政区选择页前可调用 `预加载行政区分片("330000")`，实际查询仍复用同一个分片 loader。

兼容同步入口：

- `数据版本` / `dataVersion`
- `数据来源` / `dataSource`
- `内置城市列表` / `builtInCities`
- `内置行政区列表` / `builtInRegions`
- `热门城市编码` / `hotCityCodes`
- `按编码查找行政区` / `findRegionByCode`
- `按父级编码查找行政区` / `findRegionsByParentCode`
- `按级别查找行政区` / `findRegionsByLevel`
- `获取行政区路径` / `getRegionPath`
- `是港澳台口径` / `isHongKongMacauTaiwanScope`
- `校验城市数据` / `validateCityData`
- `校验内置数据` / `validateBuiltInData`

`@ikalt/city-select-data` 根入口为了兼容旧调用仍导出同步完整数据，但生产端城市搜索、热门城市、本地 provider 应优先使用 `/cities`，行政区选择应优先使用 `/regions`。

## 校验命令

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm validate:data
```

成功输出包含版本、总量、层级数量、来源名称、来源类型和数据截止日期。

校验覆盖：

- 编码唯一。
- 名称非空。
- 行政级别合法：`省`、`市`、`区县`、`乡镇街道`。
- 非省级记录父级存在。
- 父子层级关系合法。
- `路径编码` / `路径名称` 完整且末级匹配记录本身。
- 大陆省 / 市 / 区县六位码形态合法。
- 大陆乡级九位码形态合法，并以前置父级编码开头。
- 拼音和首字母存在。
- 热门城市编码能匹配正式城市记录。
- 港澳台跳过大陆数字编码形态校验，但仍要求父级链和路径完整。

## 体积与发布检查

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm size:data
npm exec --yes --package pnpm@9.15.4 -- pnpm pack:dry-run
npm exec --yes --package pnpm@9.15.4 -- pnpm release:check
```

`size:data` 输出源产物和已构建 dist 产物的城市文件、manifest、完整兼容文件、分片数量、分片总量和最大分片。`pack:dry-run` 会从 `packages/data/dist` 生成临时 dist-only 包目录并检查包内容，不发布 npm。`release:check` 串行执行 lint、typecheck、format check、test、data validation、demo snapshot、size report 和 pack dry-run。

## 已知限制

- 数据截止到 `2023-06-30`，后续行政区调整需要重新同步源数据并生成。
- 已完成官方 / 更近第三方源研究，但暂不替换现有源：国家地名信息库的稳定批量入口尚未验证，省级乡级源格式分散，`cn-division@2026.0.0` 缺全国乡级和港澳台，`province-city-china@8.5.8` 口径较旧且港澳台深度不足。决策记录见 `.trellis/tasks/07-04-source-refresh-research/source-decision.md`。
- 港澳台层级来源和命名口径与大陆四级不同，依赖 `地区口径`、`行政区类型` 和路径字段表达真实结构。
- 第五级村 / 社区 / 居委会数据不在第一版范围内；如果后续加入，需要单独评估包体积、懒加载和统计口径。
