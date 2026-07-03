# 官方与更近数据源研究替换

## Goal

研究并评估更近年份或官方直采源，决定是否替换当前 `china-division@2.7.0` 第三方种子；如替换，必须不降低大陆四级和港澳台可变深度覆盖。

## Parent / Dependency Context

- Parent: `07-03-data-source-bundle-release`。
- Depends on `07-04-bundle-lazy-release` for source manifest and shard contract before actual source replacement.
- This task may start read-only research earlier, but must not mutate generated data until manifest/shard contract exists or parent explicitly changes priority.

## Confirmed Facts

- 当前源 `china-division@2.7.0` 截止 `2023-06-30`，乡级完整，港澳台可用，但年份较旧。
- `cn-division@2026.0.0` 更近，但 npm metadata / prior inspection显示只覆盖省 / 市 / 区县，不满足乡镇街道四级。
- 国家统计局 2025 咨询答复显示自 2024-10 起不再公开具体统计用区划代码和城乡划分代码。
- 2025 行政区划代码管理办法指向民政部 / 国家地名信息库年度全国代码发布、省级民政部门半年乡级代码发布，但稳定机器可读入口仍需验证。

## Requirements

- R1. 官方源研究：
  - 验证国家地名信息库是否有稳定、可批量、可复现的全国代码数据入口。
  - 记录官方源覆盖层级、更新频率、获取方式、授权边界。
- R2. 省级乡级源研究：
  - 抽样至少 2-3 个省级民政部门乡级代码公开格式。
  - 判断是否能形成可维护批量采集策略。
- R3. 第三方候选源研究：
  - 对比 `china-division`、`cn-division`、`province-city-china` 等候选。
  - 记录版本、截止日期、许可证、覆盖层级、港澳台口径、数据格式。
- R4. 替换决策：
  - 若新源覆盖不完整，不得替换现有完整四级数据，只能作为上层级补充候选。
  - 若采用混合源，必须 source manifest 明确每一层级来源和 cutoff。
- R5. 验证：
  - 新源或混合源必须通过现有数据校验。
  - 必须保留重点抽样路径：浙江/杭州/西湖/北山街道，台湾/台北/大安区。

## Acceptance Criteria

- [ ] 有 source decision note，比较官方源、省级乡级源、第三方候选源。
- [ ] 明确是否替换当前源；若不替换，记录 defer 原因。
- [ ] 若替换或混合，生成数据保持大陆四级和港澳台可变深度覆盖。
- [ ] source manifest 可表达每个层级/分片的数据来源和 cutoff。
- [ ] `generate:data`、`validate:data`、测试和 demo 通过。

## Out Of Scope

- 不在缺少稳定来源时强行替换当前源。
- 不纳入第五级村 / 社区 / 居委会。
- 不绕过 source manifest 直接手工 patch 大数据文件。
