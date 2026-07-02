import { describe, expect, it } from "vitest"

import { 创建Demo快照 } from "./index"

describe("@ikalt/city-select-demo-taro", () => {
  it("creates an end-to-end demo snapshot for city, region, destination, empty, and degraded states", async () => {
    const 快照 = await 创建Demo快照()

    expect(快照.标题).toBe("CitySelect Taro MVP Demo")
    expect(快照.城市选择).toMatchObject({
      搜索关键词: "hz",
      状态: "结果",
      首条结果: { 名称: "杭州", 编码: "330100" },
      热门城市: ["北京", "上海", "深圳", "杭州"],
    })
    expect(快照.省市区选择).toEqual({
      编码路径: ["330000", "330100", "330106"],
      名称路径: ["浙江省", "杭州市", "西湖区"],
    })
    expect(快照.目的地搜索).toMatchObject({
      搜索关键词: "机场",
      状态: "成功",
      首条结果: { 类型: "机场", 名称: "新加坡樟宜机场" },
    })
    expect(快照.空状态).toEqual({
      搜索关键词: "火星",
      状态: "空",
      结果数量: 0,
      错误提示: "没有找到相关目的地",
    })
    expect(快照.降级状态).toEqual({
      状态: "部分失败",
      结果数量: 1,
      错误提示: "部分结果暂不可用",
    })
  })
})
