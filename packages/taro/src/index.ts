import {
  创建城市搜索索引,
  创建行政区选择结果,
  搜索城市,
  type 城市,
  type 行政区选择结果,
  type 目的地,
} from "@ikalt/city-select-core"
import { 内置城市列表, 热门城市编码 } from "@ikalt/city-select-data/cities"
import { 内置行政区列表 } from "@ikalt/city-select-data"
import type { ProviderSearchResponse, Provider状态 } from "@ikalt/city-select-providers"

export const citySelectTaroPackage = "@ikalt/city-select-taro" as const

export type 城市选择器Props = {
  搜索关键词?: string
  热门城市?: readonly string[]
  最近访问上限?: number
  启用拼音搜索?: boolean
  启用首字母搜索?: boolean
  on选择?: (城市: 城市) => void
  keyword?: string
  hotCities?: readonly string[]
  recentLimit?: number
  enablePinyinSearch?: boolean
  enableInitialSearch?: boolean
  onSelect?: (city: 城市) => void
}
export type CitySelectProps = 城市选择器Props

export type 城市选择器状态 = {
  状态: "默认" | "结果" | "空"
  搜索关键词: string
  搜索结果: 城市[]
  热门城市: 城市[]
  最近访问上限: number
  启用拼音搜索: boolean
  启用首字母搜索: boolean
  on选择?: (城市: 城市) => void
}
export type CitySelectState = 城市选择器状态

export type 省市区选择器Props = {
  编码路径?: readonly string[]
  on选择?: (结果: 行政区选择结果) => void
  codePath?: readonly string[]
  onSelect?: (result: 行政区选择结果) => void
}
export type RegionSelectProps = 省市区选择器Props

export type 省市区选择器状态 = {
  编码路径: string[]
  选择路径: 城市[]
  选择结果?: 行政区选择结果
  on选择?: (结果: 行政区选择结果) => void
}
export type RegionSelectState = 省市区选择器状态

export type 目的地搜索状态 = {
  状态: Provider状态 | "加载中"
  目的地列表: 目的地[]
  错误列表: ProviderSearchResponse["错误列表"]
  错误提示?: string
}
export type DestinationSearchState = 目的地搜索状态

const 城市搜索索引 = 创建城市搜索索引(内置城市列表)

export function 创建城市选择器状态(props: 城市选择器Props = {}): 城市选择器状态 {
  const normalized = 规范化城市选择器Props(props)
  const 搜索结果 = normalized.搜索关键词
    ? 搜索城市(城市搜索索引, normalized.搜索关键词).map((结果) => 结果.城市)
    : []

  return {
    状态: normalized.搜索关键词 === "" ? "默认" : 搜索结果.length > 0 ? "结果" : "空",
    搜索关键词: normalized.搜索关键词,
    搜索结果,
    热门城市: 查找热门城市(normalized.热门城市),
    最近访问上限: normalized.最近访问上限,
    启用拼音搜索: normalized.启用拼音搜索,
    启用首字母搜索: normalized.启用首字母搜索,
    on选择: normalized.on选择,
  }
}
export const createCitySelectState = 创建城市选择器状态

export function 触发城市选择(状态: 城市选择器状态, 城市: 城市): void {
  状态.on选择?.(城市)
}
export const triggerCitySelect = 触发城市选择

export function 创建省市区选择器状态(props: 省市区选择器Props = {}): 省市区选择器状态 {
  const 编码路径 = [...(props.编码路径 ?? props.codePath ?? [])]
  const 行政区By编码 = new Map(内置行政区列表.map((记录) => [记录.编码, 记录]))
  const 选择路径 = 编码路径.flatMap((编码) => {
    const 记录 = 行政区By编码.get(编码)
    return 记录 ? [记录] : []
  })
  const on选择 = props.on选择 ?? props.onSelect

  return {
    编码路径,
    选择路径,
    选择结果:
      选择路径.length > 0 && 选择路径.length === 编码路径.length
        ? 创建行政区选择结果(选择路径)
        : undefined,
    on选择,
  }
}
export const createRegionSelectState = 创建省市区选择器状态

export function 触发行政区选择(状态: 省市区选择器状态): void {
  if (状态.选择结果) {
    状态.on选择?.(状态.选择结果)
  }
}
export const triggerRegionSelect = 触发行政区选择

export function 映射目的地搜索状态(response: ProviderSearchResponse): 目的地搜索状态 {
  return {
    状态: response.状态,
    目的地列表: response.结果,
    错误列表: response.错误列表,
    错误提示: 获取目的地错误提示(response.状态),
  }
}
export const mapDestinationSearchState = 映射目的地搜索状态

export const 城市选择器 = {
  createState: 创建城市选择器状态,
  triggerSelect: 触发城市选择,
}
export const CitySelect = 城市选择器

export const 省市区选择器 = {
  createState: 创建省市区选择器状态,
  triggerSelect: 触发行政区选择,
}
export const RegionSelect = 省市区选择器

export const 目的地搜索 = {
  mapState: 映射目的地搜索状态,
}
export const DestinationSearch = 目的地搜索

function 规范化城市选择器Props(
  props: 城市选择器Props,
): Required<
  Pick<
    城市选择器Props,
    "搜索关键词" | "热门城市" | "最近访问上限" | "启用拼音搜索" | "启用首字母搜索"
  >
> &
  Pick<城市选择器Props, "on选择"> {
  return {
    搜索关键词: props.搜索关键词 ?? props.keyword ?? "",
    热门城市: props.热门城市 ?? props.hotCities ?? 默认热门城市名称(),
    最近访问上限: props.最近访问上限 ?? props.recentLimit ?? 6,
    启用拼音搜索: props.启用拼音搜索 ?? props.enablePinyinSearch ?? true,
    启用首字母搜索: props.启用首字母搜索 ?? props.enableInitialSearch ?? true,
    on选择: props.on选择 ?? props.onSelect,
  }
}

function 查找热门城市(城市名称列表: readonly string[]): 城市[] {
  const 城市By名称 = new Map(内置城市列表.map((城市) => [城市.名称, 城市]))
  return 城市名称列表.flatMap((名称) => {
    const 城市 = 城市By名称.get(名称)
    return 城市 ? [城市] : []
  })
}

function 默认热门城市名称(): string[] {
  const 城市By编码 = new Map(内置城市列表.map((城市) => [城市.编码, 城市]))
  return 热门城市编码.flatMap((编码) => {
    const 城市 = 城市By编码.get(编码)
    return 城市 ? [城市.名称] : []
  })
}

function 获取目的地错误提示(状态: Provider状态): string | undefined {
  switch (状态) {
    case "成功":
      return undefined
    case "空":
      return "没有找到相关目的地"
    case "部分失败":
      return "部分结果暂不可用"
    case "全部失败":
      return "搜索暂不可用，请稍后重试"
    case "超时":
      return "搜索超时，请稍后重试"
  }
}
