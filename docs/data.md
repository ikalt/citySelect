# 数据与校验

`packages/data` 提供 CitySelect 的全国行政区划数据、热门城市入口、查询 helper、来源元数据和校验命令。完整数据不是手写在 `src/index.ts` 中，而是由源快照和生成脚本复现。

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
- `内置城市列表` 是轻量城市搜索入口，不等同于完整行政区列表；完整层级请使用 `内置行政区列表` 或查询 helper。

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

- `packages/data/src/generated/regions.ts`

生成文件是 committed artifact，但被 ESLint 和 Prettier 忽略。修改数据范围时应修生成脚本并重新生成，不手工 patch 大型产物。

## 导出

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

## 已知限制

- 数据截止到 `2023-06-30`，后续行政区调整需要重新同步源数据并生成。
- 港澳台层级来源和命名口径与大陆四级不同，依赖 `地区口径`、`行政区类型` 和路径字段表达真实结构。
- 第五级村 / 社区 / 居委会数据不在第一版范围内；如果后续加入，需要单独评估包体积、懒加载和统计口径。
