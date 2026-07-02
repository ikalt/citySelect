import {
  创建本地城市Provider,
  创建模拟目的地Provider,
  创建组合Provider,
} from "@ikalt/city-select-providers"
import { 按编码查找行政区, 按父级编码查找行政区 } from "@ikalt/city-select-data"
import {
  创建城市选择器状态,
  创建省市区选择器状态,
  映射目的地搜索状态,
} from "@ikalt/city-select-taro"

export const citySelectDemoTaroPackage = "@ikalt/city-select-demo-taro" as const

export type Demo快照 = {
  标题: string
  城市选择: {
    搜索关键词: string
    状态: string
    首条结果?: { 名称: string; 编码: string }
    热门城市: string[]
  }
  省市区选择: {
    编码路径: string[]
    名称路径: string[]
  }
  四级选择: {
    编码路径: string[]
    名称路径: string[]
  }
  港澳台选择: {
    编码路径: string[]
    名称路径: string[]
  }
  目的地搜索: {
    搜索关键词: string
    状态: string
    首条结果?: { 类型: string; 名称: string }
  }
  空状态: {
    搜索关键词: string
    状态: string
    结果数量: number
    错误提示?: string
  }
  降级状态: {
    状态: string
    结果数量: number
    错误提示?: string
  }
}
export type DemoSnapshot = Demo快照

export async function 创建Demo快照(): Promise<Demo快照> {
  const 城市状态 = 创建城市选择器状态({ 搜索关键词: "hz" })
  const 省市区状态 = 创建省市区选择器状态({
    编码路径: ["330000", "330100", "330106"],
  })
  const 四级状态 = 创建省市区选择器状态({
    编码路径: ["330000", "330100", "330106", "330106002"],
  })
  const 台湾 = 按编码查找行政区("710000")
  const 台北 = 台湾
    ? 按父级编码查找行政区(台湾.编码).find((记录) => 记录.名称 === "台北市")
    : undefined
  const 大安 = 台北
    ? 按父级编码查找行政区(台北.编码).find((记录) => 记录.名称 === "大安区")
    : undefined
  const 港澳台状态 = 创建省市区选择器状态({
    编码路径: [台湾?.编码, 台北?.编码, 大安?.编码].filter(
      (编码): 编码 is string => typeof 编码 === "string",
    ),
  })
  const provider = 创建组合Provider({
    providers: [创建本地城市Provider(), 创建模拟目的地Provider()],
  })
  const 目的地响应 = await provider.搜索("机场")
  const 目的地状态 = 映射目的地搜索状态(目的地响应)
  const 空响应 = await 创建本地城市Provider().搜索("火星")
  const 空状态 = 映射目的地搜索状态(空响应)
  const 降级状态 = 映射目的地搜索状态({
    状态: "部分失败",
    结果: [{ 类型: "城市", 编码: "110000", 名称: "北京" }],
    错误列表: [{ 来源: "mock-remote", 类型: "失败", 消息: "mock remote failed" }],
  })

  return {
    标题: "CitySelect Taro MVP Demo",
    城市选择: {
      搜索关键词: 城市状态.搜索关键词,
      状态: 城市状态.状态,
      首条结果: 城市状态.搜索结果[0]
        ? {
            名称: 城市状态.搜索结果[0].名称,
            编码: 城市状态.搜索结果[0].编码,
          }
        : undefined,
      热门城市: 城市状态.热门城市.map((城市) => 城市.名称),
    },
    省市区选择: {
      编码路径: 省市区状态.选择结果?.编码路径 ?? [],
      名称路径: 省市区状态.选择结果?.名称路径 ?? [],
    },
    四级选择: {
      编码路径: 四级状态.选择结果?.编码路径 ?? [],
      名称路径: 四级状态.选择结果?.名称路径 ?? [],
    },
    港澳台选择: {
      编码路径: 港澳台状态.选择结果?.编码路径 ?? [],
      名称路径: 港澳台状态.选择结果?.名称路径 ?? [],
    },
    目的地搜索: {
      搜索关键词: "机场",
      状态: 目的地状态.状态,
      首条结果: 目的地状态.目的地列表[0]
        ? {
            类型: 目的地状态.目的地列表[0].类型,
            名称: 目的地状态.目的地列表[0].名称,
          }
        : undefined,
    },
    空状态: {
      搜索关键词: "火星",
      状态: 空状态.状态,
      结果数量: 空状态.目的地列表.length,
      错误提示: 空状态.错误提示,
    },
    降级状态: {
      状态: 降级状态.状态,
      结果数量: 降级状态.目的地列表.length,
      错误提示: 降级状态.错误提示,
    },
  }
}
export const createDemoSnapshot = 创建Demo快照
