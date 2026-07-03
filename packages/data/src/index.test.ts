import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

import type { 城市 } from "@ikalt/city-select-core"

import {
  内置城市列表 as 轻量内置城市列表,
  数据来源 as 轻量数据来源,
  热门城市编码 as 轻量热门城市编码,
} from "./cities"
import {
  内置城市列表,
  内置行政区列表,
  按父级编码查找行政区,
  按编码查找行政区,
  按级别查找行政区,
  数据来源,
  数据版本,
  校验内置数据,
  校验城市数据,
  热门城市编码,
  获取行政区路径,
} from "./index"
import {
  按父级编码加载行政区子级,
  按编码加载行政区,
  按编码加载行政区路径,
  加载行政区分片,
  获取行政区分片列表,
  获取行政区分片键列表,
  预加载行政区分片,
} from "./regions"

describe("@ikalt/city-select-data", () => {
  it("exports versioned national city and region records compatible with core", () => {
    const 城市列表: readonly 城市[] = 内置城市列表
    const 行政区列表: readonly 城市[] = 内置行政区列表

    expect(数据版本).toEqual({
      编码: "2026.07-cn-region-full-2023-nbs",
      名称: "CitySelect 全国四级行政区划数据（含港澳台）",
    })
    expect(数据来源).toMatchObject({
      来源名称: "china-division",
      来源类型: "第三方种子",
      数据截止日期: "2023-06-30",
      记录数量: {
        省级: 31,
        地级: 342,
        县级: 2975,
        乡级: 41352,
        港澳台: 411,
      },
    })
    expect(数据来源.层级来源.乡级).toMatchObject({
      层级: "乡级",
      来源名称: "china-division",
      数据截止日期: "2023-06-30",
      记录数量: 41352,
    })
    expect(数据来源.层级来源.港澳台).toMatchObject({
      层级: "港澳台",
      来源名称: "china-division",
      记录数量: 411,
    })
    expect(城市列表.length).toBeGreaterThan(300)
    expect(行政区列表.length).toBeGreaterThan(45_000)
    expect(热门城市编码).toEqual(["110000", "310000", "440300", "330100"])
  })

  it("provides mainland four-level paths and query helpers", () => {
    const 西湖区 = 按编码查找行政区("330106")
    const 北山街道 = 按编码查找行政区("330106002")
    const 西湖子级 = 按父级编码查找行政区("330106")
    const 乡级列表 = 按级别查找行政区("乡镇街道")
    const 北山路径 = 获取行政区路径("330106002")

    expect(西湖区).toMatchObject({ 名称: "西湖区", 级别: "区县", 父级编码: "330100" })
    expect(北山街道).toMatchObject({
      名称: "北山街道",
      级别: "乡镇街道",
      父级编码: "330106",
      路径名称: ["浙江省", "杭州市", "西湖区", "北山街道"],
    })
    expect(西湖子级.some((记录) => 记录.名称 === "北山街道")).toBe(true)
    expect(乡级列表.length).toBeGreaterThan(41_000)
    expect(北山路径.map((记录) => 记录.名称)).toEqual([
      "浙江省",
      "杭州市",
      "西湖区",
      "北山街道",
    ])
  })

  it("keeps the city entry lightweight and independent from full region data", () => {
    const citiesSource = readFileSync(new URL("./cities.ts", import.meta.url), "utf8")
    const providersSource = readFileSync(
      new URL("../../providers/src/index.ts", import.meta.url),
      "utf8",
    )

    expect(轻量内置城市列表).toBe(内置城市列表)
    expect(轻量数据来源.记录数量.乡级).toBeGreaterThan(41_000)
    expect(轻量热门城市编码).toEqual(热门城市编码)
    expect(citiesSource).not.toContain("regions-full")
    expect(citiesSource).not.toContain("生成行政区列表")
    expect(providersSource).toContain("@ikalt/city-select-data/cities")
  })

  it("exposes deterministic region shard manifest and lazy loaders", async () => {
    const 分片列表 = 获取行政区分片列表()
    const 浙江分片信息 = 分片列表.find((分片) => 分片.分片键 === "330000")
    const 港澳台分片信息 = 分片列表.find((分片) => 分片.分片键 === "hmt")
    const 分片键列表 = 获取行政区分片键列表()
    const 浙江分片 = await 加载行政区分片("330000")
    const 缺失分片 = await 加载行政区分片("missing")
    await 预加载行政区分片("330000")

    expect(分片列表).toHaveLength(32)
    expect(分片键列表).toContain("330000")
    expect(分片键列表).toContain("hmt")
    expect(浙江分片信息).toMatchObject({
      分片键: "330000",
      名称: "浙江省",
      根编码列表: ["330000"],
      地区口径: "大陆行政区划",
    })
    expect(浙江分片信息?.层级来源.乡级).toMatchObject({
      来源名称: "china-division",
      数据截止日期: "2023-06-30",
    })
    expect(浙江分片信息?.记录数).toBeGreaterThan(1_000)
    expect(浙江分片信息?.checksum).toMatch(/^[0-9a-f]{16}$/)
    expect(港澳台分片信息).toMatchObject({
      分片键: "hmt",
      名称: "港澳台",
      根编码列表: ["710000", "810000", "820000"],
    })
    expect(港澳台分片信息?.层级来源).not.toHaveProperty("乡级")
    expect(港澳台分片信息?.层级来源.港澳台).toMatchObject({
      来源名称: "china-division",
      数据截止日期: "2023-06-30",
      记录数量: 411,
    })
    expect(浙江分片.some((记录) => 记录.编码 === "330106002")).toBe(true)
    expect(缺失分片).toEqual([])
  })

  it("loads mainland region paths and children lazily", async () => {
    const 北山街道 = await 按编码加载行政区("330106002")
    const 西湖子级 = await 按父级编码加载行政区子级("330106")
    const 根列表 = await 按父级编码加载行政区子级()
    const 北山路径 = await 按编码加载行政区路径("330106002")

    expect(北山街道).toMatchObject({ 名称: "北山街道", 父级编码: "330106" })
    expect(西湖子级.some((记录) => 记录.名称 === "北山街道")).toBe(true)
    expect(根列表.map((记录) => 记录.编码)).toEqual(
      expect.arrayContaining(["330000", "710000", "810000", "820000"]),
    )
    expect(北山路径.map((记录) => 记录.名称)).toEqual([
      "浙江省",
      "杭州市",
      "西湖区",
      "北山街道",
    ])
    expect(北山路径).toEqual(获取行政区路径("330106002"))
  })

  it("includes Hong Kong, Macau, and Taiwan with variable-depth paths", () => {
    const 台湾 = 按编码查找行政区("710000")
    const 台北 = 按父级编码查找行政区("710000").find((记录) => 记录.名称 === "台北市")
    const 大安 = 台北
      ? 按父级编码查找行政区(台北.编码).find((记录) => 记录.名称 === "大安区")
      : undefined
    const 香港 = 按编码查找行政区("810000")
    const 香港路径子级 = 按父级编码查找行政区("810000")

    expect(台湾).toMatchObject({ 名称: "台湾省", 地区口径: "台湾地区" })
    expect(台北).toMatchObject({ 级别: "市", 行政区类型: "市", 地区口径: "台湾地区" })
    expect(大安).toMatchObject({
      级别: "区县",
      行政区类型: "区",
      地区口径: "台湾地区",
    })
    expect(获取行政区路径(大安!.编码).map((记录) => 记录.名称)).toEqual([
      "台湾省",
      "台北市",
      "大安区",
    ])
    expect(香港).toMatchObject({
      名称: "香港特别行政区",
      地区口径: "香港澳门特别行政区",
    })
    expect(香港路径子级.map((记录) => 记录.名称).sort()).toEqual(
      ["九龙", "新界", "香港岛"].sort(),
    )
  })

  it("loads Hong Kong, Macau, and Taiwan variable-depth paths lazily", async () => {
    const 台湾子级 = await 按父级编码加载行政区子级("710000")
    const 台北 = 台湾子级.find((记录) => 记录.名称 === "台北市")
    const 台北子级 = 台北 ? await 按父级编码加载行政区子级(台北.编码) : []
    const 大安 = 台北子级.find((记录) => 记录.名称 === "大安区")
    const 大安路径 = 大安 ? await 按编码加载行政区路径(大安.编码) : []
    const 未知路径 = await 按编码加载行政区路径("unknown")
    const 未知子级 = await 按父级编码加载行政区子级("unknown")

    expect(台北).toMatchObject({ 级别: "市", 地区口径: "台湾地区" })
    expect(大安).toMatchObject({ 级别: "区县", 地区口径: "台湾地区" })
    expect(大安路径.map((记录) => 记录.名称)).toEqual(["台湾省", "台北市", "大安区"])
    expect(未知路径).toEqual([])
    expect(未知子级).toEqual([])
  })

  it("passes validation for the bundled national dataset", () => {
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
          路径编码: ["999900", "999901"],
          路径名称: ["测试市", "测试区"],
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

  it("reports invalid mainland township code shape", () => {
    const 问题列表 = 校验城市数据({
      城市列表: [],
      行政区列表: [
        {
          编码: "330000",
          名称: "浙江省",
          拼音: "zhejiangsheng",
          首字母: "ZJS",
          级别: "省",
          地区口径: "大陆行政区划",
          路径编码: ["330000"],
          路径名称: ["浙江省"],
          国家代码: "CN",
        },
        {
          编码: "330100",
          名称: "杭州市",
          父级编码: "330000",
          拼音: "hangzhoushi",
          首字母: "HZS",
          级别: "市",
          地区口径: "大陆行政区划",
          路径编码: ["330000", "330100"],
          路径名称: ["浙江省", "杭州市"],
          国家代码: "CN",
        },
        {
          编码: "330106",
          名称: "西湖区",
          父级编码: "330100",
          拼音: "xihuqu",
          首字母: "XHQ",
          级别: "区县",
          地区口径: "大陆行政区划",
          路径编码: ["330000", "330100", "330106"],
          路径名称: ["浙江省", "杭州市", "西湖区"],
          国家代码: "CN",
        },
        {
          编码: "330199001",
          名称: "测试街道",
          父级编码: "330106",
          拼音: "ceshijiedao",
          首字母: "CSJD",
          级别: "乡镇街道",
          地区口径: "大陆行政区划",
          路径编码: ["330000", "330100", "330106", "330199001"],
          路径名称: ["浙江省", "杭州市", "西湖区", "测试街道"],
          国家代码: "CN",
        },
      ],
      热门城市编码: [],
    })

    expect(问题列表).toContainEqual({
      代码: "乡级编码非法",
      编码: "330199001",
      消息: "测试街道 的乡级编码 330199001 不以前置县级编码 330106 开头",
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
