import type { 城市, 地区口径, 行政级别 } from "@ikalt/city-select-core"

import {
  生成城市列表,
  生成数据来源,
  生成数据版本,
  生成热门城市编码,
  生成行政区列表,
} from "./generated/regions.js"

export type {
  DataSourceInfo,
  DataSourceType,
  RegionLevelStats,
  数据来源信息,
  数据来源类型,
  行政区层级统计,
} from "./generated/regions.js"

export const citySelectDataPackage = "@ikalt/city-select-data" as const

export type 数据版本信息 = {
  编码: string
  名称: string
}
export type DataVersion = 数据版本信息

export type 数据校验问题代码 =
  | "重复编码"
  | "名称为空"
  | "级别非法"
  | "缺少拼音"
  | "缺少首字母"
  | "父级缺失"
  | "层级关系非法"
  | "路径缺失"
  | "路径不一致"
  | "大陆编码非法"
  | "乡级编码非法"
  | "热门城市缺失"
export type DataValidationIssueCode = 数据校验问题代码

export type 数据校验问题 = {
  代码: 数据校验问题代码
  编码?: string
  消息: string
}
export type DataValidationIssue = 数据校验问题

export type 城市数据校验输入 = {
  城市列表: readonly 城市[]
  行政区列表: readonly 城市[]
  热门城市编码: readonly string[]
}
export type CityDataValidationInput = 城市数据校验输入

export const 数据版本: 数据版本信息 = 生成数据版本
export const dataVersion = 数据版本

export const 数据来源 = 生成数据来源
export const dataSource = 数据来源

export const 内置城市列表: readonly 城市[] = 生成城市列表
export const builtInCities = 内置城市列表

export const 热门城市编码 = 生成热门城市编码
export const hotCityCodes = 热门城市编码

export const 内置行政区列表: readonly 城市[] = 生成行政区列表
export const builtInRegions = 内置行政区列表

const 行政区By编码 = new Map(内置行政区列表.map((记录) => [记录.编码, 记录]))
const 行政区By父级编码 = 创建父级索引(内置行政区列表)
const 行政区By级别 = 创建级别索引(内置行政区列表)

export function 按编码查找行政区(编码: string): 城市 | undefined {
  return 行政区By编码.get(编码)
}
export const findRegionByCode = 按编码查找行政区

export function 按父级编码查找行政区(父级编码?: string): 城市[] {
  return [...(行政区By父级编码.get(父级编码 ?? "") ?? [])]
}
export const findRegionsByParentCode = 按父级编码查找行政区

export function 按级别查找行政区(级别: 行政级别): 城市[] {
  return [...(行政区By级别.get(级别) ?? [])]
}
export const findRegionsByLevel = 按级别查找行政区

export function 获取行政区路径(编码: string): 城市[] {
  const 记录 = 行政区By编码.get(编码)
  if (!记录) {
    return []
  }

  return (记录.路径编码 ?? [编码]).flatMap((路径编码) => {
    const 路径记录 = 行政区By编码.get(路径编码)
    return 路径记录 ? [路径记录] : []
  })
}
export const getRegionPath = 获取行政区路径

export function 校验内置数据(): 数据校验问题[] {
  return 校验城市数据({
    城市列表: 内置城市列表,
    行政区列表: 内置行政区列表,
    热门城市编码,
  })
}
export const validateBuiltInData = 校验内置数据

export function 校验城市数据(输入: 城市数据校验输入): 数据校验问题[] {
  const 问题列表: 数据校验问题[] = []

  校验记录列表(输入.城市列表, "城市列表", 问题列表)
  校验记录列表(输入.行政区列表, "行政区列表", 问题列表)
  校验行政区父级和路径(输入.行政区列表, 问题列表)
  校验行政区编码(输入.行政区列表, 问题列表)
  校验热门城市(输入.城市列表, 输入.热门城市编码, 问题列表)

  return 问题列表
}
export const validateCityData = 校验城市数据

function 创建父级索引(行政区列表: readonly 城市[]): Map<string, 城市[]> {
  const 索引 = new Map<string, 城市[]>()
  for (const 记录 of 行政区列表) {
    const 父级编码 = 记录.父级编码 ?? ""
    const 同级列表 = 索引.get(父级编码) ?? []
    同级列表.push(记录)
    索引.set(父级编码, 同级列表)
  }
  return 索引
}

function 创建级别索引(行政区列表: readonly 城市[]): Map<行政级别, 城市[]> {
  const 索引 = new Map<行政级别, 城市[]>()
  for (const 记录 of 行政区列表) {
    const 同级列表 = 索引.get(记录.级别) ?? []
    同级列表.push(记录)
    索引.set(记录.级别, 同级列表)
  }
  return 索引
}

function 校验记录列表(
  记录列表: readonly 城市[],
  来源: string,
  问题列表: 数据校验问题[],
): void {
  const 已见编码 = new Set<string>()

  for (const 记录 of 记录列表) {
    if (已见编码.has(记录.编码)) {
      问题列表.push({
        代码: "重复编码",
        编码: 记录.编码,
        消息: `编码 ${记录.编码} 重复`,
      })
    }
    已见编码.add(记录.编码)

    if (记录.名称.trim() === "") {
      问题列表.push({
        代码: "名称为空",
        编码: 记录.编码,
        消息: `${来源} 记录 ${记录.编码} 名称为空`,
      })
    }

    if (!["省", "市", "区县", "乡镇街道"].includes(记录.级别)) {
      问题列表.push({
        代码: "级别非法",
        编码: 记录.编码,
        消息: `${记录.名称} 的级别 ${记录.级别} 非法`,
      })
    }

    if ((记录.拼音 ?? "").trim() === "") {
      问题列表.push({
        代码: "缺少拼音",
        编码: 记录.编码,
        消息: `${记录.名称} 缺少拼音`,
      })
    }

    if ((记录.首字母 ?? "").trim() === "") {
      问题列表.push({
        代码: "缺少首字母",
        编码: 记录.编码,
        消息: `${记录.名称} 缺少首字母`,
      })
    }
  }
}

function 校验行政区父级和路径(
  行政区列表: readonly 城市[],
  问题列表: 数据校验问题[],
): void {
  const 行政区编码 = new Set(行政区列表.map((记录) => 记录.编码))
  const 行政区By编码 = new Map(行政区列表.map((记录) => [记录.编码, 记录]))

  for (const 记录 of 行政区列表) {
    if (记录.级别 !== "省" && (!记录.父级编码 || !行政区编码.has(记录.父级编码))) {
      问题列表.push({
        代码: "父级缺失",
        编码: 记录.编码,
        消息: `${记录.名称} 的父级编码 ${记录.父级编码 ?? "(空)"} 不存在`,
      })
      continue
    }

    校验层级关系(记录, 行政区By编码, 问题列表)
    校验路径(记录, 行政区By编码, 问题列表)
  }
}

function 校验层级关系(
  记录: 城市,
  行政区By编码: ReadonlyMap<string, 城市>,
  问题列表: 数据校验问题[],
): void {
  if (记录.级别 === "省" || !记录.父级编码) {
    return
  }

  const 父级 = 行政区By编码.get(记录.父级编码)
  if (!父级) {
    return
  }

  const 允许父级列表: Record<Exclude<行政级别, "省">, readonly 行政级别[]> = {
    市: ["省"],
    区县: ["市"],
    乡镇街道: ["区县", "市"],
  }

  if (!允许父级列表[记录.级别].includes(父级.级别)) {
    问题列表.push({
      代码: "层级关系非法",
      编码: 记录.编码,
      消息: `${记录.名称} 的父级 ${父级.名称} 级别应为 ${允许父级列表[记录.级别].join(" 或 ")}，实际为 ${父级.级别}`,
    })
  }
}

function 校验路径(
  记录: 城市,
  行政区By编码: ReadonlyMap<string, 城市>,
  问题列表: 数据校验问题[],
): void {
  if (!记录.路径编码 || !记录.路径名称) {
    问题列表.push({
      代码: "路径缺失",
      编码: 记录.编码,
      消息: `${记录.名称} 缺少路径编码或路径名称`,
    })
    return
  }

  if (
    记录.路径编码.length !== 记录.路径名称.length ||
    记录.路径编码.at(-1) !== 记录.编码 ||
    记录.路径名称.at(-1) !== 记录.名称
  ) {
    问题列表.push({
      代码: "路径不一致",
      编码: 记录.编码,
      消息: `${记录.名称} 的路径末级与记录本身不一致`,
    })
    return
  }

  for (const 路径编码 of 记录.路径编码) {
    if (!行政区By编码.has(路径编码)) {
      问题列表.push({
        代码: "路径不一致",
        编码: 记录.编码,
        消息: `${记录.名称} 的路径编码 ${路径编码} 不存在`,
      })
    }
  }
}

function 校验行政区编码(行政区列表: readonly 城市[], 问题列表: 数据校验问题[]): void {
  for (const 记录 of 行政区列表) {
    if ((记录.地区口径 ?? "大陆行政区划") !== "大陆行政区划") {
      continue
    }

    if (记录.级别 === "省" && !/^\d{2}0000$/.test(记录.编码)) {
      问题列表.push({
        代码: "大陆编码非法",
        编码: 记录.编码,
        消息: `${记录.名称} 的省级编码 ${记录.编码} 非法`,
      })
    }

    if (记录.级别 === "市" && !/^\d{4}00$/.test(记录.编码)) {
      问题列表.push({
        代码: "大陆编码非法",
        编码: 记录.编码,
        消息: `${记录.名称} 的地级编码 ${记录.编码} 非法`,
      })
    }

    if (记录.级别 === "区县" && !/^\d{6}$/.test(记录.编码)) {
      问题列表.push({
        代码: "大陆编码非法",
        编码: 记录.编码,
        消息: `${记录.名称} 的县级编码 ${记录.编码} 非法`,
      })
    }

    if (记录.级别 === "乡镇街道") {
      if (!/^\d{9}$/.test(记录.编码)) {
        问题列表.push({
          代码: "乡级编码非法",
          编码: 记录.编码,
          消息: `${记录.名称} 的乡级编码 ${记录.编码} 非法`,
        })
      }

      if (记录.父级编码 && !记录.编码.startsWith(记录.父级编码)) {
        问题列表.push({
          代码: "乡级编码非法",
          编码: 记录.编码,
          消息: `${记录.名称} 的乡级编码 ${记录.编码} 不以前置县级编码 ${记录.父级编码} 开头`,
        })
      }
    }
  }
}

function 校验热门城市(
  城市列表: readonly 城市[],
  热门编码列表: readonly string[],
  问题列表: 数据校验问题[],
): void {
  const 城市编码 = new Set(城市列表.map((记录) => 记录.编码))

  for (const 热门编码 of 热门编码列表) {
    if (!城市编码.has(热门编码)) {
      问题列表.push({
        代码: "热门城市缺失",
        编码: 热门编码,
        消息: `热门城市编码 ${热门编码} 不存在于城市列表`,
      })
    }
  }
}

export function 是港澳台口径(地区口径?: 地区口径): boolean {
  return 地区口径 === "香港澳门特别行政区" || 地区口径 === "台湾地区"
}
export const isHongKongMacauTaiwanScope = 是港澳台口径
