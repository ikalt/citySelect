import { describe, expect, it } from "vitest"

import {
  创建城市搜索索引,
  创建行政区选择结果,
  按首字母分组城市,
  搜索城市,
  更新最近访问城市,
  type 城市,
} from "./index"

describe("@ikalt/city-select-core", () => {
  const 城市列表: 城市[] = [
    {
      编码: "110000",
      名称: "北京",
      省份名称: "北京",
      拼音: "beijing",
      首字母: "B",
      别名: ["首都", "帝都"],
      级别: "市",
      国家代码: "CN",
      热门: true,
    },
    {
      编码: "310000",
      名称: "上海",
      省份名称: "上海",
      拼音: "shanghai",
      首字母: "S",
      别名: ["魔都"],
      级别: "市",
      国家代码: "CN",
      热门: true,
    },
    {
      编码: "440300",
      名称: "深圳",
      省份名称: "广东",
      拼音: "shenzhen",
      首字母: "S",
      别名: ["鹏城"],
      级别: "市",
      国家代码: "CN",
      热门: true,
    },
    {
      编码: "330100",
      名称: "杭州",
      省份名称: "浙江",
      拼音: "hangzhou",
      首字母: "H",
      别名: ["临安"],
      级别: "市",
      国家代码: "CN",
      热门: true,
    },
    {
      编码: "320100",
      名称: "南京",
      省份名称: "江苏",
      拼音: "nanjing",
      首字母: "N",
      别名: ["金陵"],
      级别: "市",
      国家代码: "CN",
    },
    {
      编码: "320500",
      名称: "苏州",
      省份名称: "江苏",
      拼音: "suzhou",
      首字母: "S",
      别名: ["姑苏"],
      级别: "市",
      国家代码: "CN",
    },
    {
      编码: "510100",
      名称: "成都",
      省份名称: "四川",
      拼音: "chengdu",
      首字母: "C",
      别名: ["蓉城"],
      级别: "市",
      国家代码: "CN",
    },
  ]

  const 搜索索引 = 创建城市搜索索引(城市列表)

  it("searches cities by Chinese name, pinyin, initials, and alias", () => {
    expect(搜索城市(搜索索引, "北京")[0]?.城市.编码).toBe("110000")
    expect(搜索城市(搜索索引, "上")[0]?.城市.编码).toBe("310000")
    expect(搜索城市(搜索索引, "shen")[0]?.城市.编码).toBe("440300")
    expect(搜索城市(搜索索引, "hz")[0]?.城市.编码).toBe("330100")
    expect(搜索城市(搜索索引, "金陵")[0]?.城市.编码).toBe("320100")
  })

  it("uses hot and recent weighting for default city results", () => {
    const 默认结果 = 搜索城市(搜索索引, "", { 结果上限: 4 })

    expect(默认结果.map((结果) => 结果.城市.名称)).toEqual([
      "北京",
      "杭州",
      "上海",
      "深圳",
    ])

    const 最近访问结果 = 搜索城市(搜索索引, "", {
      最近访问编码: ["510100"],
      结果上限: 3,
    })

    expect(最近访问结果.map((结果) => 结果.城市.名称)).toEqual(["成都", "北京", "杭州"])
  })

  it("returns an empty list for unknown keywords", () => {
    expect(搜索城市(搜索索引, "不存在的城市")).toEqual([])
  })

  it("groups cities by A-Z initials without locale-dependent sorting", () => {
    const 分组 = 按首字母分组城市(城市列表)

    expect(分组.map((组) => 组.首字母)).toEqual(["B", "C", "H", "N", "S"])
    expect(
      分组.find((组) => 组.首字母 === "S")?.城市列表.map((城市) => 城市.名称),
    ).toEqual(["上海", "苏州", "深圳"])
  })

  it("deduplicates recent cities and keeps newest selections first", () => {
    const [北京, 上海, 成都] = [城市列表[0], 城市列表[1], 城市列表[6]]

    const 第一次 = 更新最近访问城市([], 成都, 2)
    const 第二次 = 更新最近访问城市(第一次, 北京, 2)
    const 第三次 = 更新最近访问城市(第二次, 成都, 2)
    const 第四次 = 更新最近访问城市(第三次, 上海, 2)

    expect(第一次.map((城市) => 城市.名称)).toEqual(["成都"])
    expect(第二次.map((城市) => 城市.名称)).toEqual(["北京", "成都"])
    expect(第三次.map((城市) => 城市.名称)).toEqual(["成都", "北京"])
    expect(第四次.map((城市) => 城市.名称)).toEqual(["上海", "成都"])
  })

  it("creates structured province-city-district selection results", () => {
    const 浙江: 城市 = {
      编码: "330000",
      名称: "浙江省",
      拼音: "zhejiang",
      首字母: "Z",
      级别: "省",
      国家代码: "CN",
    }
    const 杭州: 城市 = {
      编码: "330100",
      名称: "杭州市",
      父级编码: "330000",
      拼音: "hangzhou",
      首字母: "H",
      级别: "市",
      国家代码: "CN",
    }
    const 西湖: 城市 = {
      编码: "330106",
      名称: "西湖区",
      父级编码: "330100",
      拼音: "xihu",
      首字母: "X",
      级别: "区县",
      国家代码: "CN",
    }

    const 结果 = 创建行政区选择结果([浙江, 杭州, 西湖])

    expect(结果.编码路径).toEqual(["330000", "330100", "330106"])
    expect(结果.名称路径).toEqual(["浙江省", "杭州市", "西湖区"])
    expect(结果.省?.名称).toBe("浙江省")
    expect(结果.市?.名称).toBe("杭州市")
    expect(结果.区县?.名称).toBe("西湖区")
  })

  it("rejects empty or too-long region paths", () => {
    expect(() => 创建行政区选择结果([])).toThrow(RangeError)
    expect(() =>
      创建行政区选择结果([城市列表[0], 城市列表[1], 城市列表[2], 城市列表[3]]),
    ).toThrow(RangeError)
  })
})
