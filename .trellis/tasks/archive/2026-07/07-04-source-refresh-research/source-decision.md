# 数据源更新决策记录

Date: 2026-07-04

## Decision

暂不替换当前 `china-division@2.7.0` 源快照。

原因：目前能确认有更新、更官方的数据入口，但尚未找到同时满足“稳定机器可读、可批量复现、大陆四级完整、港澳台可变深度完整”的替代源。第一版继续使用现有完整源作为第三方种子，同时把 source manifest 扩展到可表达每个层级和每个分片的来源、cutoff，为后续混合源接入做准备。

## 官方源评估

| Source | Coverage | Machine readability | Finding |
| --- | --- | --- | --- |
| 民政部行政区划代码栏目 | 历年县级以上代码 | HTML 页面 | 官方栏目提示自 2026 年起不再公布，需转到国家地名信息库查询。 |
| 国家地名信息库 | 政策上应发布年度全国代码 | 未验证到稳定公开批量接口 | 页面入口是官方方向，但本次没有验证到可在 CI / release 中复现的批量下载或稳定 API。 |
| 国家统计局统计用区划代码 | 曾覆盖统计用县以下区划 | 2024-10 后不再公开具体代码 | 可作为历史来源背景，不适合未来更新源。 |

本地探测记录：

```text
GET https://dmfw.mca.gov.cn/9095/xzqh/getList?code=&maxLevel=1
node fetch: TypeError fetch failed
curl: connection timed out after 15002 ms
```

该接口形态可作为后续研究线索，但当前不能作为已验证的官方直采源写入生成流程。

## 省级乡级源抽样

| Source | Cutoff / publish date | Format | Finding |
| --- | --- | --- | --- |
| 北京市民政局：2024 年北京市行政区划名称和行政区划代码 | published 2025-01-06 | HTML 表格 | 含街道、镇、乡九位代码，可解析，但页面结构是网页表格。 |
| 福建省民政厅：福建省行政区划名录及代码 | cutoff 2025-06-30, published 2025-07-18 | HTML 长页面 | 含省、市、县、乡级代码，层级靠缩进和文本结构表达。 |
| 重庆市民政局：2024 年重庆市行政区划及行政区划代码 | published 2025-03-21 | HTML 长页面 | 含乡级九位代码，结构与北京/福建不一致。 |

结论：省级民政部门确实开始或已经公开乡级代码，但格式分散、栏目路径和页面结构不统一。要形成可维护批量采集，需要单独做“省级采集适配器矩阵”：每省 URL 发现、HTML / 附件解析、发布节奏、差异校验、失败回退。当前不适合直接替换全国库。

## 第三方候选源对比

| Package | Version / modified | License | Observed files / counts | HMT | Township | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| `china-division` | `2.7.0`, modified 2023-09-13 | package metadata MIT; included LICENSE WTFPL-2.0 | provinces 31, cities 342, areas 2978, streets 41352, `HK-MO-TW.json` | Yes | Yes | Keep as current complete source. |
| `cn-division` | `2026.0.0`, modified 2026-04-26 | MIT | provinces 31, cities 342, counties 2933, no township file | No | No nationwide township/street file | Not a full replacement; possible future county-level overlay only. |
| `province-city-china` | `8.5.8`, modified 2024-09-05 | MIT | province 34, city 337, area 3285, town 41278, not-found-town 299 | HK/MO present; Taiwan not enough for Taipei/Daan path | Partial / older and different code shape | Not a full replacement; useful as cross-check source. |

Important sample checks:

- `china-division` contains `330106002` 北山街道 and current generated data preserves 浙江 / 杭州 / 西湖 / 北山街道.
- `province-city-china` contains 北山街道 but stores township as county code plus `town` segment; it has fewer township records than current source and does not provide the required 台湾 / 台北 / 大安区 path.
- `cn-division` is fresher and based on 民政部地名服务, but its package artifact does not include nationwide fourth-level township/street data or HMT data.

## Manifest Change

This task adds source attribution fields without changing generated records:

- `数据来源.层级来源`: global per-level source details for 省级 / 地级 / 县级 / 乡级 / 港澳台.
- `行政区分片信息.层级来源`: per-shard per-level source details, so a future shard can say “县级 from official 2026 source, 乡级 from fallback 2023 source”.

Current values all point to `china-division@2.7.0`; the schema is ready for mixed-source replacement later.

## Future Replacement Path

1. Keep current source as fallback until a candidate passes full validation.
2. Add an official-source acquisition spike for 国家地名信息库, but only after a documented bulk endpoint or reproducible scrape contract is verified.
3. Prototype a mixed-source adapter:
   - newer county-level source from `cn-division` or official national code,
   - township fallback from current source or province-level official pages,
   - source manifest records per-level and per-shard source/cutoff.
4. Run drift checks before accepting a mixed source:
   - parent-child prefix compatibility,
   - renamed / removed counties,
   - township parent existence,
   - Zhejiang / Hangzhou / Xihu / Beishan sample,
   - Taiwan / Taipei / Daan sample.

## References

- 民政部行政区划代码栏目: https://www.mca.gov.cn/n156/n186/index.html
- 新华社《行政区划代码管理办法》报道: https://www.news.cn/20250707/6f736052004d482eaf004f559fecf7df/c.html
- 国家统计局咨询答复: https://www.stats.gov.cn/hd/lyzx/zxgk/202509/t20250903_1960996.html
- 北京市民政局 2024 行政区划代码: https://mzj.beijing.gov.cn/art/2025/1/6/art_9984_684678.html
- 福建省民政厅行政区划名录及代码: https://mzt.fujian.gov.cn/gk/zcfg/gfxwj/202507/t20250718_6968735.htm
- 重庆市民政局 2024 行政区划代码: https://mzj.cq.gov.cn/zwgk_218/zfxxgkml/tzgg/202503/t20250321_14429852.html
- `china-division`: https://github.com/modood/Administrative-divisions-of-China
- `cn-division`: https://github.com/kk-418/cn-division
- `province-city-china`: https://github.com/uiwjs/province-city-china
