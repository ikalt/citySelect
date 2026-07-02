import { describe, expect, it } from "vitest"

import type { 城市 } from "@ikalt/city-select-core"

import {
  内置城市列表,
  内置行政区列表,
  数据版本,
  校验内置数据,
  校验城市数据,
  热门城市编码,
} from "./index"

describe("@ikalt/city-select-data", () => {
  it("exports versioned city and region records compatible with core", () => {
    const 城市列表: readonly 城市[] = 内置城市列表
    const 行政区列表: readonly 城市[] = 内置行政区列表

    expect(数据版本).toEqual({
      编码: "2026.07-cn-region-mvp",
      名称: "CitySelect MVP 中国城市行政区数据",
    })
    expect(城市列表.length).toBeGreaterThanOrEqual(10)
    expect(
      行政区列表.some((记录) => 记录.名称 === "西湖区" && 记录.父级编码 === "330100"),
    ).toBe(true)
    expect(热门城市编码).toEqual(["110000", "310000", "440300", "330100"])
  })

  it("passes validation for the bundled MVP dataset", () => {
    expect(校验内置数据()).toEqual([])
  })

  it("reports duplicate codes with record context", () => {
    const [北京] = 内置城市列表
    const 问题列表 = 校验城市数据({
      城市列表: [北京, { ...北京, 名称: "重复北京" }],
      行政区列表: [],
      热门城市编码: [],
    })

    expect(问题列表).toContainEqual({
      代码: "重复编码",
      编码: 北京.编码,
      消息: `编码 ${北京.编码} 重复`,
    })
  })

  it("reports missing parent links for region records", () => {
    const 问题列表 = 校验城市数据({
      城市列表: [],
      行政区列表: [
        {
          编码: "999901",
          名称: "测试区",
          父级编码: "999900",
          拼音: "ceshi",
          首字母: "C",
          级别: "区县",
          国家代码: "CN",
        },
      ],
      热门城市编码: [],
    })

    expect(问题列表).toContainEqual({
      代码: "父级缺失",
      编码: "999901",
      消息: "测试区 的父级编码 999900 不存在",
    })
  })

  it("reports hot city codes that do not resolve to city records", () => {
    const 问题列表 = 校验城市数据({
      城市列表: 内置城市列表,
      行政区列表: [],
      热门城市编码: ["999999"],
    })

    expect(问题列表).toContainEqual({
      代码: "热门城市缺失",
      编码: "999999",
      消息: "热门城市编码 999999 不存在于城市列表",
    })
  })
})
