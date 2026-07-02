export const citySelectCorePackage = "@ikalt/city-select-core" as const

export type 行政级别 = "省" | "市" | "区县" | "乡镇街道"
export type AdministrativeLevel = 行政级别

export type 地区口径 = "大陆行政区划" | "香港澳门特别行政区" | "台湾地区"
export type RegionScope = 地区口径

export type 城市 = {
  编码: string
  名称: string
  省份名称?: string
  父级编码?: string
  拼音?: string
  首字母?: string
  别名?: readonly string[]
  级别: 行政级别
  行政区类型?: string
  地区口径?: 地区口径
  路径编码?: readonly string[]
  路径名称?: readonly string[]
  国家代码?: "CN" | string
  热门?: boolean
  经度?: number
  纬度?: number
}
export type City = 城市

export type 目的地类型 = "城市" | "行政区" | "酒店" | "机场" | "地标"
export type DestinationType = 目的地类型

export type 目的地 = {
  类型: 目的地类型
  编码: string
  名称: string
  副标题?: string
  国家?: string
  城市?: string
  经度?: number
  纬度?: number
}
export type Destination = 目的地

export type 行政区选择结果 = {
  编码路径: string[]
  名称路径: string[]
  完整路径: 城市[]
  省?: 城市
  市?: 城市
  区县?: 城市
  乡镇街道?: 城市
}
export type RegionSelectionResult = 行政区选择结果

export type 城市匹配方式 =
  "默认" | "名称精确" | "名称前缀" | "名称包含" | "拼音" | "首字母" | "别名"
export type CityMatchKind = 城市匹配方式

export type 城市搜索结果 = {
  城市: 城市
  得分: number
  匹配方式: 城市匹配方式
}
export type CitySearchResult = 城市搜索结果

export type 搜索城市选项 = {
  结果上限?: number
  最近访问编码?: readonly string[]
}
export type SearchCitiesOptions = 搜索城市选项

type 城市搜索条目 = {
  城市: 城市
  名称: string
  拼音: string
  首字母: string
  推导首字母: string
  别名: readonly string[]
}

export type 城市搜索索引 = {
  城市列表: readonly 城市[]
  条目列表: readonly 城市搜索条目[]
}
export type CitySearchIndex = 城市搜索索引

export type 城市首字母分组 = {
  首字母: string
  城市列表: 城市[]
}
export type CityInitialGroup = 城市首字母分组

export function 创建城市搜索索引(城市列表: readonly 城市[]): 城市搜索索引 {
  return {
    城市列表: [...城市列表],
    条目列表: 城市列表.map((城市) => ({
      城市,
      名称: 规范化文本(城市.名称),
      拼音: 规范化文本(城市.拼音 ?? ""),
      首字母: 规范化首字母(城市.首字母 ?? ""),
      推导首字母: 推导拼音首字母(城市.拼音 ?? ""),
      别名: (城市.别名 ?? []).map((别名) => 规范化文本(别名)),
    })),
  }
}

export const createCitySearchIndex = 创建城市搜索索引

export function 搜索城市(
  搜索索引或城市列表: 城市搜索索引 | readonly 城市[],
  关键词: string,
  选项: 搜索城市选项 = {},
): 城市搜索结果[] {
  const 搜索索引 = 是城市搜索索引(搜索索引或城市列表)
    ? 搜索索引或城市列表
    : 创建城市搜索索引(搜索索引或城市列表)
  const 规范化关键词 = 规范化文本(关键词)
  const 规范化首字母关键词 = 规范化首字母(关键词)
  const 最近访问排序 = new Map(
    (选项.最近访问编码 ?? []).map((编码, 排序) => [编码, 排序]),
  )

  const 结果 = 搜索索引.条目列表
    .map((条目) =>
      计算城市搜索结果(条目, 规范化关键词, 规范化首字母关键词, 最近访问排序),
    )
    .filter((结果) => 结果 !== null)
    .sort(排序城市搜索结果)

  return typeof 选项.结果上限 === "number" ? 结果.slice(0, 选项.结果上限) : 结果
}

export const searchCities = 搜索城市

export function 按首字母分组城市(城市列表: readonly 城市[]): 城市首字母分组[] {
  const 分组表 = new Map<string, 城市[]>()

  for (const 城市 of 城市列表) {
    const 分组首字母 = 获取分组首字母(城市)
    const 分组城市列表 = 分组表.get(分组首字母) ?? []
    分组城市列表.push(城市)
    分组表.set(分组首字母, 分组城市列表)
  }

  return [...分组表.entries()]
    .sort(([左首字母], [右首字母]) => 左首字母.localeCompare(右首字母, "en"))
    .map(([首字母, 分组城市列表]) => ({
      首字母,
      城市列表: [...分组城市列表].sort(排序城市),
    }))
}

export const groupCitiesByInitial = 按首字母分组城市

export function 更新最近访问城市(
  当前最近访问: readonly 城市[],
  新选择城市: 城市,
  上限 = 6,
): 城市[] {
  if (上限 <= 0) {
    return []
  }

  const 去重列表 = 当前最近访问.filter((城市) => 城市.编码 !== 新选择城市.编码)
  return [新选择城市, ...去重列表].slice(0, 上限)
}

export const updateRecentCities = 更新最近访问城市

export function 创建行政区选择结果(路径: readonly 城市[]): 行政区选择结果 {
  if (路径.length === 0 || 路径.length > 4) {
    throw new RangeError("行政区选择路径必须包含 1 到 4 个层级")
  }

  return {
    编码路径: 路径.map((城市) => 城市.编码),
    名称路径: 路径.map((城市) => 城市.名称),
    完整路径: [...路径],
    省: 查找层级(路径, "省"),
    市: 查找层级(路径, "市"),
    区县: 查找层级(路径, "区县"),
    乡镇街道: 查找层级(路径, "乡镇街道"),
  }
}

export const createRegionSelectionResult = 创建行政区选择结果

function 是城市搜索索引(值: 城市搜索索引 | readonly 城市[]): 值 is 城市搜索索引 {
  return "条目列表" in 值
}

function 查找层级(路径: readonly 城市[], 级别: 行政级别): 城市 | undefined {
  return 路径.find((城市) => 城市.级别 === 级别)
}

function 计算城市搜索结果(
  条目: 城市搜索条目,
  关键词: string,
  首字母关键词: string,
  最近访问排序: ReadonlyMap<string, number>,
): 城市搜索结果 | null {
  const 基础匹配 =
    关键词 === ""
      ? { 得分: 1, 匹配方式: "默认" as const }
      : 匹配条目(条目, 关键词, 首字母关键词)

  if (基础匹配 === null) {
    return null
  }

  const 最近访问序号 = 最近访问排序.get(条目.城市.编码)
  const 最近访问加权 = 最近访问序号 === undefined ? 0 : 200 - 最近访问序号
  const 热门加权 = 条目.城市.热门 ? 100 : 0

  return {
    城市: 条目.城市,
    匹配方式: 基础匹配.匹配方式,
    得分: 基础匹配.得分 + 热门加权 + 最近访问加权,
  }
}

function 匹配条目(
  条目: 城市搜索条目,
  关键词: string,
  首字母关键词: string,
): Pick<城市搜索结果, "得分" | "匹配方式"> | null {
  if (条目.名称 === 关键词) {
    return { 得分: 1000, 匹配方式: "名称精确" }
  }

  if (条目.名称.startsWith(关键词)) {
    return { 得分: 900, 匹配方式: "名称前缀" }
  }

  if (条目.名称.includes(关键词)) {
    return { 得分: 850, 匹配方式: "名称包含" }
  }

  if (匹配拼音(条目.拼音, 关键词)) {
    return { 得分: 800, 匹配方式: "拼音" }
  }

  if (
    首字母关键词 !== "" &&
    (条目.首字母.startsWith(首字母关键词) || 条目.推导首字母.startsWith(首字母关键词))
  ) {
    return { 得分: 760, 匹配方式: "首字母" }
  }

  if (条目.别名.some((别名) => 匹配别名(别名, 关键词))) {
    return { 得分: 720, 匹配方式: "别名" }
  }

  return null
}

function 排序城市搜索结果(左: 城市搜索结果, 右: 城市搜索结果): number {
  return 右.得分 - 左.得分 || 排序城市(左.城市, 右.城市)
}

function 排序城市(左: 城市, 右: 城市): number {
  const 左首字母 = 获取分组首字母(左)
  const 右首字母 = 获取分组首字母(右)

  return (
    左首字母.localeCompare(右首字母, "en") ||
    左.编码.localeCompare(右.编码, "en") ||
    左.名称.localeCompare(右.名称, "zh-CN")
  )
}

function 匹配拼音(拼音: string, 关键词: string): boolean {
  return 拼音 === 关键词 || 拼音.startsWith(关键词) || 拼音.includes(关键词)
}

function 匹配别名(别名: string, 关键词: string): boolean {
  return 别名 === 关键词 || 别名.startsWith(关键词) || 别名.includes(关键词)
}

function 获取分组首字母(城市: 城市): string {
  const 首字母 = 规范化首字母(城市.首字母 ?? 城市.拼音?.slice(0, 1) ?? "#")
  const 第一个字符 = 首字母.charAt(0)
  return /^[A-Z]$/.test(第一个字符) ? 第一个字符 : "#"
}

function 规范化文本(值: string): string {
  return 值.trim().toLowerCase().replace(/\s+/g, "")
}

function 规范化首字母(值: string): string {
  return 值.trim().toUpperCase().replace(/\s+/g, "")
}

function 推导拼音首字母(拼音: string): string {
  const 规范化拼音 = 规范化文本(拼音)
  if (规范化拼音 === "") {
    return ""
  }

  const 常见双音节城市: Record<string, string> = {
    beijing: "BJ",
    changsha: "CS",
    chengdu: "CD",
    chongqing: "CQ",
    guangzhou: "GZ",
    hangzhou: "HZ",
    nanjing: "NJ",
    shanghai: "SH",
    shenzhen: "SZ",
    suzhou: "SZ",
    tianjin: "TJ",
    wuhan: "WH",
    xiamen: "XM",
  }

  return 常见双音节城市[规范化拼音] ?? 规范化拼音.charAt(0).toUpperCase()
}
