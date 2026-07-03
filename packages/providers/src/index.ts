import {
  创建城市搜索索引,
  搜索城市,
  type 城市,
  type Destination,
  type 目的地,
} from "@ikalt/city-select-core"
import { 内置城市列表, 热门城市编码 } from "@ikalt/city-select-data/cities"

export const citySelectProvidersPackage = "@ikalt/city-select-providers" as const

export type { Destination, 目的地 }

export type Provider状态 = "成功" | "空" | "部分失败" | "全部失败" | "超时"
export type ProviderStatus = Provider状态

export type Provider错误类型 = "失败" | "超时"
export type ProviderErrorType = Provider错误类型

export type Provider源错误 = {
  来源: string
  类型: Provider错误类型
  消息: string
}
export type ProviderSourceError = Provider源错误

export type ProviderSearchResponse = {
  状态: Provider状态
  结果: 目的地[]
  错误列表: Provider源错误[]
}

export type 目的地Provider = {
  名称: string
  搜索(关键词: string): Promise<ProviderSearchResponse>
  获取热门?(): Promise<ProviderSearchResponse>
  获取定位城市?(): Promise<城市 | null>
}
export type DestinationProvider = 目的地Provider

export type 本地城市Provider选项 = {
  城市列表?: readonly 城市[]
  名称?: string
  结果上限?: number
}
export type LocalCityProviderOptions = 本地城市Provider选项

export type 组合Provider选项 = {
  providers: readonly 目的地Provider[]
  名称?: string
  超时时间毫秒?: number
}
export type ComposedProviderOptions = 组合Provider选项

const 默认超时时间毫秒 = 3000

export function 创建本地城市Provider(选项: 本地城市Provider选项 = {}): 目的地Provider {
  const 城市列表 = 选项.城市列表 ?? 内置城市列表
  const 搜索索引 = 创建城市搜索索引(城市列表)
  const 名称 = 选项.名称 ?? "local-city"
  const 结果上限 = 选项.结果上限 ?? 20

  return {
    名称,
    async 搜索(关键词: string): Promise<ProviderSearchResponse> {
      const 结果 = 搜索城市(搜索索引, 关键词, { 结果上限 }).map((搜索结果) =>
        城市转目的地(搜索结果.城市),
      )
      return 创建成功响应(结果)
    },
    async 获取热门(): Promise<ProviderSearchResponse> {
      const 城市By编码 = new Map(城市列表.map((城市) => [城市.编码, 城市]))
      const 结果 = 热门城市编码.flatMap((编码) => {
        const 城市 = 城市By编码.get(编码)
        return 城市 ? [城市转目的地(城市)] : []
      })
      return 创建成功响应(结果)
    },
    async 获取定位城市(): Promise<城市 | null> {
      return null
    },
  }
}

export const createLocalCityProvider = 创建本地城市Provider

const 模拟目的地列表: readonly 目的地[] = [
  {
    类型: "酒店",
    编码: "mock-tokyo-hotel",
    名称: "东京酒店",
    副标题: "日本 东京",
    国家: "日本",
    城市: "东京",
  },
  {
    类型: "机场",
    编码: "mock-sin-changi",
    名称: "新加坡樟宜机场",
    副标题: "新加坡 机场",
    国家: "新加坡",
    城市: "新加坡",
  },
  {
    类型: "地标",
    编码: "mock-bangkok-center",
    名称: "曼谷市中心",
    副标题: "泰国 曼谷",
    国家: "泰国",
    城市: "曼谷",
  },
  {
    类型: "地标",
    编码: "mock-seoul-myeongdong",
    名称: "首尔明洞",
    副标题: "韩国 首尔",
    国家: "韩国",
    城市: "首尔",
  },
]

export function 创建模拟目的地Provider(
  目的地列表: readonly 目的地[] = 模拟目的地列表,
): 目的地Provider {
  return {
    名称: "mock-destination",
    async 搜索(关键词: string): Promise<ProviderSearchResponse> {
      const 规范化关键词 = 规范化文本(关键词)
      const 结果 =
        规范化关键词 === ""
          ? [...目的地列表]
          : 目的地列表.filter((目的地) => 匹配目的地(目的地, 规范化关键词))
      return 创建成功响应(结果)
    },
    async 获取热门(): Promise<ProviderSearchResponse> {
      return 创建成功响应([...目的地列表])
    },
  }
}

export const createMockDestinationProvider = 创建模拟目的地Provider

export function 创建组合Provider(选项: 组合Provider选项): 目的地Provider {
  const 名称 = 选项.名称 ?? "composed"
  const 超时时间毫秒 = 选项.超时时间毫秒 ?? 默认超时时间毫秒

  return {
    名称,
    async 搜索(关键词: string): Promise<ProviderSearchResponse> {
      const 来源响应 = await Promise.all(
        选项.providers.map((provider) => 搜索Provider(provider, 关键词, 超时时间毫秒)),
      )

      const 成功响应 = 来源响应.filter(
        (响应): 响应 is { 响应: ProviderSearchResponse } => "响应" in 响应,
      )
      const 错误列表 = 来源响应.flatMap((响应) =>
        "错误" in 响应 ? [响应.错误] : 响应.响应.错误列表,
      )
      const 结果 = 成功响应.flatMap(({ 响应 }) => 响应.结果)

      return {
        状态: 计算组合状态(结果, 成功响应.length, 错误列表, 选项.providers.length),
        结果,
        错误列表,
      }
    },
  }
}

export const createComposedProvider = 创建组合Provider

function 城市转目的地(城市: 城市): 目的地 {
  return {
    类型: "城市",
    编码: 城市.编码,
    名称: 城市.名称,
    副标题: 城市.省份名称,
    国家: 城市.国家代码,
    城市: 城市.名称,
    经度: 城市.经度,
    纬度: 城市.纬度,
  }
}

function 创建成功响应(结果: 目的地[]): ProviderSearchResponse {
  return {
    状态: 结果.length > 0 ? "成功" : "空",
    结果,
    错误列表: [],
  }
}

async function 搜索Provider(
  provider: 目的地Provider,
  关键词: string,
  超时时间毫秒: number,
): Promise<{ 响应: ProviderSearchResponse } | { 错误: Provider源错误 }> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({
        错误: {
          来源: provider.名称,
          类型: "超时",
          消息: `${provider.名称} timed out after ${超时时间毫秒}ms`,
        },
      })
    }, 超时时间毫秒)

    provider
      .搜索(关键词)
      .then((响应) => {
        clearTimeout(timeout)
        resolve({ 响应 })
      })
      .catch((error: unknown) => {
        clearTimeout(timeout)
        resolve({
          错误: {
            来源: provider.名称,
            类型: "失败",
            消息: error instanceof Error ? error.message : String(error),
          },
        })
      })
  })
}

function 计算组合状态(
  结果: readonly 目的地[],
  成功响应数: number,
  错误列表: readonly Provider源错误[],
  provider数量: number,
): Provider状态 {
  if (错误列表.length === provider数量) {
    return 错误列表.every((错误) => 错误.类型 === "超时") ? "超时" : "全部失败"
  }

  if (错误列表.length > 0 && 成功响应数 > 0) {
    return "部分失败"
  }

  return 结果.length > 0 ? "成功" : "空"
}

function 匹配目的地(目的地: 目的地, 关键词: string): boolean {
  return [目的地.类型, 目的地.名称, 目的地.副标题, 目的地.国家, 目的地.城市]
    .filter((字段): 字段 is string => typeof 字段 === "string")
    .some((字段) => 规范化文本(字段).includes(关键词))
}

function 规范化文本(值: string): string {
  return 值.trim().toLowerCase().replace(/\s+/g, "")
}
