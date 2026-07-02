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

## 省市区选择

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
