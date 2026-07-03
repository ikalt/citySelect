import type { 城市 } from "@ikalt/city-select-core"

import {
  生成城市列表,
  生成数据来源,
  生成数据版本,
  生成热门城市编码,
} from "./generated/cities.js"

export type {
  DataSourceInfo,
  DataSourceType,
  RegionLevelStats,
  数据来源信息,
  数据来源类型,
  行政区层级统计,
} from "./generated/cities.js"

export type 数据版本信息 = {
  编码: string
  名称: string
}
export type DataVersion = 数据版本信息

export const 数据版本: 数据版本信息 = 生成数据版本
export const dataVersion = 数据版本

export const 数据来源 = 生成数据来源
export const dataSource = 数据来源

export const 内置城市列表: readonly 城市[] = 生成城市列表
export const builtInCities = 内置城市列表

export const 热门城市编码 = 生成热门城市编码
export const hotCityCodes = 热门城市编码
