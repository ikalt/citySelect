# Provider 接入

`packages/providers` 提供三个内置入口：

- `创建本地城市Provider()`：使用内置国内城市数据和 core 搜索。
- `创建模拟目的地Provider()`：返回东京酒店、新加坡樟宜机场、曼谷市中心、首尔明洞等 mock 结果。
- `创建组合Provider()`：合并多个 provider，保留局部成功结果并返回降级状态。

## 响应结构

```ts
type ProviderSearchResponse = {
  状态: "成功" | "空" | "部分失败" | "全部失败" | "超时"
  结果: 目的地[]
  错误列表: Provider源错误[]
}
```

组合 provider 不会因为一个远程源失败就丢弃本地城市结果：

```ts
const provider = 创建组合Provider({
  providers: [创建本地城市Provider(), 创建模拟目的地Provider()],
  超时时间毫秒: 3000,
})

const 响应 = await provider.搜索("杭州")
```

首版不接入真实海外、酒店、地图或机场 API，也不保存任何服务商密钥。
