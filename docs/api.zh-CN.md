# CitySelect 中文 API

## 城市选择

```ts
import { 创建城市选择器状态, 触发城市选择 } from "@ikalt/city-select-taro"

const 状态 = 创建城市选择器状态({
  搜索关键词: "hz",
  热门城市: ["北京", "上海", "深圳", "杭州"],
  最近访问上限: 6,
  启用拼音搜索: true,
  启用首字母搜索: true,
  on选择: (城市) => {
    console.log(城市.名称, 城市.编码)
  },
})

触发城市选择(状态, 状态.搜索结果[0]!)
```

英文兼容别名走同一条行为路径：

```ts
import { CitySelect } from "@ikalt/city-select-taro"

const state = CitySelect.createState({
  keyword: "hz",
  hotCities: ["北京", "上海", "深圳", "杭州"],
  recentLimit: 6,
  enablePinyinSearch: true,
  enableInitialSearch: true,
})
```

## 行政区选择

```ts
import { 创建省市区选择器状态, 触发行政区选择 } from "@ikalt/city-select-taro"

const 状态 = 创建省市区选择器状态({
  编码路径: ["330000", "330100", "330106"],
  on选择: (结果) => {
    console.log(结果.名称路径.join("/"))
  },
})

触发行政区选择(状态)
```

四级路径同一 API 兼容：

```ts
const 四级状态 = 创建省市区选择器状态({
  编码路径: ["330000", "330100", "330106", "330106002"],
  on选择: (结果) => {
    console.log(结果.名称路径.join("/")) // 浙江省/杭州市/西湖区/北山街道
    console.log(结果.乡镇街道?.名称)
  },
})
```

港澳台路径允许可变深度，展示时优先使用 `名称路径`：

```ts
import { 按编码查找行政区, 按父级编码查找行政区 } from "@ikalt/city-select-data"

const 台湾 = 按编码查找行政区("710000")
const 台北 = 台湾
  ? 按父级编码查找行政区(台湾.编码).find((记录) => 记录.名称 === "台北市")
  : undefined
const 大安 = 台北
  ? 按父级编码查找行政区(台北.编码).find((记录) => 记录.名称 === "大安区")
  : undefined

const 台湾状态 = 创建省市区选择器状态({
  编码路径: [台湾?.编码, 台北?.编码, 大安?.编码].filter(
    (编码): 编码 is string => typeof 编码 === "string",
  ),
  on选择: (结果) => {
    console.log(结果.名称路径.join("/"))
  },
})
```

港澳台子级编码由生成脚本稳定生成。业务代码应通过 `packages/data` 查询 helper 查找，不要硬编码派生编码。

## 行政区数据查询

```ts
import {
  按编码查找行政区,
  按父级编码查找行政区,
  获取行政区路径,
} from "@ikalt/city-select-data"

const 西湖区 = 按编码查找行政区("330106")
const 西湖子级 = 按父级编码查找行政区("330106")
const 北山路径 = 获取行政区路径("330106002")

console.log(西湖区?.名称)
console.log(西湖子级.map((记录) => 记录.名称))
console.log(北山路径.map((记录) => 记录.名称).join("/"))
```

## 目的地搜索状态

```ts
import { 映射目的地搜索状态 } from "@ikalt/city-select-taro"
import {
  创建组合Provider,
  创建本地城市Provider,
  创建模拟目的地Provider,
} from "@ikalt/city-select-providers"

const provider = 创建组合Provider({
  providers: [创建本地城市Provider(), 创建模拟目的地Provider()],
})

const 响应 = await provider.搜索("机场")
const 状态 = 映射目的地搜索状态(响应)
```
