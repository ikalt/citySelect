import type { 城市 } from "@ikalt/city-select-core"

import {
  生成行政区分片列表,
  生成行政区根列表,
  生成行政区编码分片表,
} from "./generated/region-manifest.js"
import {
  生成行政区分片键列表,
  加载生成行政区分片,
  type 行政区分片键,
} from "./generated/region-shards.js"

export type { 行政区分片信息, RegionShardInfo } from "./generated/region-manifest.js"
export type { 行政区分片键, RegionShardKey } from "./generated/region-shards.js"

export function 获取行政区分片列表() {
  return 生成行政区分片列表
}
export const listRegionShards = 获取行政区分片列表

export function 获取行政区分片键列表(): readonly 行政区分片键[] {
  return 生成行政区分片键列表()
}
export const listRegionShardKeys = 获取行政区分片键列表

export async function 加载行政区分片(分片键: string): Promise<readonly 城市[]> {
  return (await 加载生成行政区分片(分片键)) ?? []
}
export const loadRegionShard = 加载行政区分片

export async function 预加载行政区分片(分片键: string): Promise<void> {
  await 加载行政区分片(分片键)
}
export const prefetchRegionShard = 预加载行政区分片

export async function 按编码加载行政区(编码: string): Promise<城市 | undefined> {
  const 分片 = await 加载编码所在分片(编码)
  return 分片.find((记录) => 记录.编码 === 编码)
}
export const loadRegionByCode = 按编码加载行政区

export async function 按编码加载行政区路径(编码: string): Promise<readonly 城市[]> {
  const 分片 = await 加载编码所在分片(编码)
  const 行政区By编码 = new Map(分片.map((记录) => [记录.编码, 记录]))
  const 记录 = 行政区By编码.get(编码)

  if (!记录) {
    return []
  }

  return (记录.路径编码 ?? [编码]).flatMap((路径编码) => {
    const 路径记录 = 行政区By编码.get(路径编码)
    return 路径记录 ? [路径记录] : []
  })
}
export const loadRegionPathByCode = 按编码加载行政区路径

export async function 按父级编码加载行政区子级(
  父级编码?: string,
): Promise<readonly 城市[]> {
  if (!父级编码) {
    return 生成行政区根列表
  }

  const 分片 = await 加载编码所在分片(父级编码)
  return 分片.filter((记录) => 记录.父级编码 === 父级编码)
}
export const loadRegionsByParentCode = 按父级编码加载行政区子级

function 获取编码分片键(编码: string): string | undefined {
  return 生成行政区编码分片表[编码 as keyof typeof 生成行政区编码分片表]
}

async function 加载编码所在分片(编码: string): Promise<readonly 城市[]> {
  const 分片键 = 获取编码分片键(编码)
  return 分片键 ? 加载行政区分片(分片键) : []
}
