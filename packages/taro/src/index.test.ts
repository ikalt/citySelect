import { describe, expect, it } from "vitest"

import { 创建模拟目的地Provider, 创建组合Provider } from "@ikalt/city-select-providers"

import {
  CitySelect,
  DestinationSearch,
  RegionSelect,
  创建城市选择器状态,
  创建省市区选择器状态,
  城市选择器,
  映射目的地搜索状态,
  目的地搜索,
  省市区选择器,
  触发城市选择,
  触发行政区选择,
} from "./index"

describe("@ikalt/city-select-taro", () => {
  it("normalizes Chinese and English city selector props into the same state", () => {
    const 中文状态 = 创建城市选择器状态({
      搜索关键词: "hz",
      热门城市: ["北京", "杭州"],
      最近访问上限: 3,
      启用拼音搜索: true,
      启用首字母搜索: true,
    })
    const 英文状态 = CitySelect.createState({
      keyword: "hz",
      hotCities: ["北京", "杭州"],
      recentLimit: 3,
      enablePinyinSearch: true,
      enableInitialSearch: true,
    })

    expect(英文状态).toEqual(中文状态)
    expect(中文状态.状态).toBe("结果")
    expect(中文状态.搜索结果[0]?.名称).toBe("杭州")
    expect(中文状态.热门城市.map((城市) => 城市.名称)).toEqual(["北京", "杭州"])
  })

  it("keeps Chinese component names and English aliases on one behavior path", () => {
    expect(城市选择器.createState).toBe(CitySelect.createState)
    expect(省市区选择器.createState).toBe(RegionSelect.createState)
    expect(目的地搜索.mapState).toBe(DestinationSearch.mapState)
  })

  it("emits structured city selection events", () => {
    const 选择列表: string[] = []
    const 状态 = 创建城市选择器状态({
      搜索关键词: "北京",
      on选择: (城市) => 选择列表.push(`${城市.名称}:${城市.编码}`),
    })

    触发城市选择(状态, 状态.搜索结果[0]!)

    expect(选择列表).toEqual(["北京:110000"])
  })

  it("creates province-city-district state and emits structured region paths", () => {
    const 选择列表: string[] = []
    const 状态 = 创建省市区选择器状态({
      编码路径: ["330000", "330100", "330106"],
      on选择: (结果) => 选择列表.push(结果.名称路径.join("/")),
    })

    expect(状态.选择结果?.名称路径).toEqual(["浙江省", "杭州市", "西湖区"])

    触发行政区选择(状态)

    expect(选择列表).toEqual(["浙江省/杭州市/西湖区"])
  })

  it("maps provider statuses into distinct destination search UI states", async () => {
    const 部分失败响应 = {
      状态: "部分失败" as const,
      结果: [{ 类型: "城市" as const, 编码: "110000", 名称: "北京" }],
      错误列表: [{ 来源: "remote", 类型: "失败" as const, 消息: "remote failed" }],
    }
    const 超时响应 = {
      状态: "超时" as const,
      结果: [],
      错误列表: [{ 来源: "remote", 类型: "超时" as const, 消息: "remote timed out" }],
    }

    expect(映射目的地搜索状态(部分失败响应)).toMatchObject({
      状态: "部分失败",
      目的地列表: [{ 名称: "北京" }],
      错误提示: "部分结果暂不可用",
    })
    expect(映射目的地搜索状态(超时响应)).toMatchObject({
      状态: "超时",
      目的地列表: [],
      错误提示: "搜索超时，请稍后重试",
    })

    const provider = 创建组合Provider({ providers: [创建模拟目的地Provider()] })
    const 响应 = await provider.搜索("机场")

    expect(DestinationSearch.mapState(响应).目的地列表[0]?.名称).toBe("新加坡樟宜机场")
  })
})
