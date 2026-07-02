# 数据与校验

`packages/data` 提供首版 MVP 所需的内置国内城市和行政区数据。

## 导出

- `数据版本` / `dataVersion`
- `内置城市列表` / `builtInCities`
- `内置行政区列表` / `builtInRegions`
- `热门城市编码` / `hotCityCodes`
- `校验城市数据` / `validateCityData`
- `校验内置数据` / `validateBuiltInData`

当前数据版本：

```ts
{
  编码: "2026.07-cn-region-mvp",
  名称: "CitySelect MVP 中国城市行政区数据"
}
```

## 校验命令

```bash
npm exec --yes --package pnpm@9.15.4 -- pnpm validate:data
```

校验覆盖：

- 编码唯一。
- 名称非空。
- 行政级别合法。
- 省 / 市 / 区县父子关系完整。
- 拼音和首字母存在。
- 热门城市编码能匹配正式城市记录。

首版数据集刻意保持小而可审查，后续可接入更新脚本和更完整的行政区数据源。
