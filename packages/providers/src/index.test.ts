import { describe, expect, it } from "vitest"

import {
  创建本地城市Provider,
  创建模拟目的地Provider,
  创建组合Provider,
  type ProviderSearchResponse,
  type 目的地,
  type 目的地Provider,
} from "./index"

describe("@ikalt/city-select-providers", () => {
  it("searches bundled domestic cities through the local provider", async () => {
    const provider = 创建本地城市Provider()

    const 响应 = await provider.搜索("杭州")

    expect(响应.状态).toBe("成功")
    expect(响应.结果[0]).toMatchObject({
      类型: "城市",
      编码: "330100",
      名称: "杭州",
      副标题: "浙江",
    })
    expect(响应.错误列表).toEqual([])
  })

  it("returns deterministic mock overseas hotel, airport, and landmark results", async () => {
    const provider = 创建模拟目的地Provider()

    const 酒店响应 = await provider.搜索("东京")
    const 机场响应 = await provider.搜索("机场")
    const 地标响应 = await provider.搜索("明洞")

    expect(酒店响应.结果[0]).toMatchObject({ 类型: "酒店", 名称: "东京酒店" })
    expect(机场响应.结果[0]).toMatchObject({ 类型: "机场", 名称: "新加坡樟宜机场" })
    expect(地标响应.结果[0]).toMatchObject({ 类型: "地标", 名称: "首尔明洞" })
  })

  it("returns empty status for successful providers with no matches", async () => {
    const provider = 创建本地城市Provider()

    await expect(provider.搜索("火星")).resolves.toEqual({
      状态: "空",
      结果: [],
      错误列表: [],
    })
  })

  it("keeps local city matches before remote-like provider results", async () => {
    const local = 创建本地城市Provider()
    const remote = 创建静态Provider("remote", [
      { 类型: "酒店", 编码: "remote-hz-hotel", 名称: "杭州西湖酒店", 城市: "杭州" },
    ])
    const composed = 创建组合Provider({ providers: [local, remote] })

    const 响应 = await composed.搜索("杭州")

    expect(响应.状态).toBe("成功")
    expect(响应.结果.map((结果) => 结果.类型)).toEqual(["城市", "酒店"])
  })

  it("returns partial failure when at least one provider succeeds and another fails", async () => {
    const composed = 创建组合Provider({
      providers: [创建本地城市Provider(), 创建失败Provider("remote-error")],
    })

    const 响应 = await composed.搜索("深圳")

    expect(响应.状态).toBe("部分失败")
    expect(响应.结果[0]?.名称).toBe("深圳")
    expect(响应.错误列表).toEqual([
      {
        来源: "remote-error",
        类型: "失败",
        消息: "remote-error failed",
      },
    ])
  })

  it("returns all-failed status when every provider fails", async () => {
    const composed = 创建组合Provider({
      providers: [创建失败Provider("a"), 创建失败Provider("b")],
    })

    const 响应 = await composed.搜索("北京")

    expect(响应).toEqual({
      状态: "全部失败",
      结果: [],
      错误列表: [
        { 来源: "a", 类型: "失败", 消息: "a failed" },
        { 来源: "b", 类型: "失败", 消息: "b failed" },
      ],
    })
  })

  it("returns timeout status when every provider times out", async () => {
    const composed = 创建组合Provider({
      providers: [创建挂起Provider("slow")],
      超时时间毫秒: 1,
    })

    const 响应 = await composed.搜索("北京")

    expect(响应).toEqual({
      状态: "超时",
      结果: [],
      错误列表: [{ 来源: "slow", 类型: "超时", 消息: "slow timed out after 1ms" }],
    })
  })
})

function 创建静态Provider(名称: string, 结果: 目的地[]): 目的地Provider {
  return {
    名称,
    async 搜索(): Promise<ProviderSearchResponse> {
      return {
        状态: 结果.length > 0 ? "成功" : "空",
        结果,
        错误列表: [],
      }
    },
  }
}

function 创建失败Provider(名称: string): 目的地Provider {
  return {
    名称,
    async 搜索(): Promise<ProviderSearchResponse> {
      throw new Error(`${名称} failed`)
    },
  }
}

function 创建挂起Provider(名称: string): 目的地Provider {
  return {
    名称,
    async 搜索(): Promise<ProviderSearchResponse> {
      return new Promise(() => undefined)
    },
  }
}
