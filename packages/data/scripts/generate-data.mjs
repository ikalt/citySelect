import { createHash } from "node:crypto"
import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { pinyin } from "pinyin-pro"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packageRoot = path.resolve(__dirname, "..")
const sourceRoot = path.join(packageRoot, "source/china-division-2.7.0")
const sourceDist = path.join(sourceRoot, "dist")
const outputDir = path.join(packageRoot, "src/generated")
const outputRegionsDir = path.join(outputDir, "regions")

const dataVersion = {
  编码: "2026.07-cn-region-full-2023-nbs",
  名称: "CitySelect 全国四级行政区划数据（含港澳台）",
}

const sourceInfo = {
  来源名称: "china-division",
  来源URL: "https://github.com/modood/Administrative-divisions-of-China",
  来源类型: "第三方种子",
  许可证: "package.json: MIT; included LICENSE: WTFPL-2.0",
  版本或Commit: "npm:china-division@2.7.0",
  数据截止日期: "2023-06-30",
  抓取时间: "2026-07-03",
  生成脚本版本: "cityselect-generate-data-v1",
  校验依据: [
    "National Bureau of Statistics 2023 statistical zoning source as documented by china-division",
    "Mainland province/city/county six-digit and township/street nine-digit code shape",
    "CitySelect validation for unique code, parent chain, pinyin, initials, and hot city references",
    "Hong Kong / Macau / Taiwan variable-depth paths use deterministic CitySelect-prefixed child codes",
  ],
}

const municipalities = new Set(["11", "12", "31", "50"])
const hotCityCodes = ["110000", "310000", "440300", "330100"]

const manualAliases = new Map([
  ["110000", ["首都", "帝都", "北京市"]],
  ["310000", ["魔都", "上海市"]],
  ["440300", ["鹏城", "深圳市"]],
  ["330100", ["临安", "杭州市"]],
  ["440100", ["羊城", "花城", "广州市"]],
  ["510100", ["蓉城", "锦城", "成都市"]],
  ["320100", ["金陵", "南京市"]],
  ["320500", ["姑苏", "苏州市"]],
  ["420100", ["江城", "武汉市"]],
  ["610100", ["长安", "西安市"]],
  ["500000", ["山城", "重庆市"]],
  ["350200", ["鹭岛", "厦门市"]],
])

async function main() {
  const provinces = await readJson("provinces.json")
  const cities = await readJson("cities.json")
  const areas = await readJson("areas.json")
  const streets = await readJson("streets.json")
  const hmt = await readJson("HK-MO-TW.json")

  const regionRecords = []
  const cityRecords = []
  const byCode = new Map()

  for (const province of provinces) {
    const record = createRecord({
      code: provinceCode(province.code),
      name: province.name,
      level: "省",
      adminType: inferMainlandAdminType(province.name, "省"),
      provinceName: stripProvinceName(province.name),
      scope: "大陆行政区划",
      path: [],
    })
    addRegion(record, regionRecords, byCode)

    if (municipalities.has(province.code)) {
      cityRecords.push(
        createRecord({
          code: provinceCode(province.code),
          name: stripCityName(province.name),
          level: "市",
          adminType: "直辖市",
          provinceName: stripProvinceName(province.name),
          scope: "大陆行政区划",
          aliases: unique([
            province.name,
            ...(manualAliases.get(provinceCode(province.code)) ?? []),
          ]),
          hot: hotCityCodes.includes(provinceCode(province.code)),
          path: [],
        }),
      )
    }
  }

  for (const city of cities) {
    const province = byCode.get(provinceCode(city.provinceCode))
    const displayName = city.name === "市辖区" && province ? province.名称 : city.name
    const record = createRecord({
      code: cityCode(city.code),
      name: displayName,
      level: "市",
      parentCode: provinceCode(city.provinceCode),
      adminType: inferMainlandAdminType(displayName, "市"),
      provinceName: province?.名称,
      scope: "大陆行政区划",
      path: province ? [province] : [],
    })
    addRegion(record, regionRecords, byCode)

    if (isCitySelectable(record, city.name)) {
      const cityName = stripCityName(record.名称)
      cityRecords.push(
        createRecord({
          code: record.编码,
          name: cityName,
          level: "市",
          adminType: record.行政区类型,
          provinceName: stripProvinceName(province?.名称 ?? record.省份名称 ?? ""),
          scope: "大陆行政区划",
          aliases: unique([record.名称, ...(manualAliases.get(record.编码) ?? [])]),
          hot: hotCityCodes.includes(record.编码),
          path: [],
        }),
      )
    }
  }

  for (const area of areas) {
    if (area.code === cityCode(area.cityCode)) {
      continue
    }

    const parent = byCode.get(cityCode(area.cityCode))
    const record = createRecord({
      code: area.code,
      name: area.name,
      level: "区县",
      parentCode: cityCode(area.cityCode),
      adminType: inferMainlandAdminType(area.name, "区县"),
      provinceName: byCode.get(provinceCode(area.provinceCode))?.名称,
      scope: "大陆行政区划",
      path: parent ? [...parent.完整路径] : [],
    })
    addRegion(record, regionRecords, byCode)
  }

  for (const street of streets) {
    const parent = byCode.get(street.areaCode)
    const record = createRecord({
      code: street.code,
      name: street.name,
      level: "乡镇街道",
      parentCode: street.areaCode,
      adminType: inferMainlandAdminType(street.name, "乡镇街道"),
      provinceName: byCode.get(provinceCode(street.provinceCode))?.名称,
      scope: "大陆行政区划",
      path: parent ? [...parent.完整路径] : [],
    })
    addRegion(record, regionRecords, byCode)
  }

  addHmtRegions(hmt, regionRecords, byCode)
  cityRecords.sort(compareRecord)
  regionRecords.sort(compareRecord)

  const stats = countStats(regionRecords)
  const source = {
    ...sourceInfo,
    记录数量: stats,
  }
  const publicCityRecords = cityRecords.map(stripInternalPath)
  const publicRegionRecords = regionRecords.map(stripInternalPath)
  const shards = createRegionShards(publicRegionRecords)
  const manifest = createRegionManifest(publicRegionRecords, shards, source)

  await mkdir(outputDir, { recursive: true })
  await rm(outputRegionsDir, { force: true, recursive: true })
  await mkdir(outputRegionsDir, { recursive: true })

  await Promise.all([
    writeFile(
      path.join(outputDir, "cities.ts"),
      renderCitiesFile(publicCityRecords, source),
    ),
    writeFile(
      path.join(outputDir, "regions-full.ts"),
      renderFullRegionsFile(publicRegionRecords),
    ),
    writeFile(path.join(outputDir, "regions.ts"), renderLegacyRegionsFile()),
    writeFile(path.join(outputDir, "region-manifest.ts"), renderManifestFile(manifest)),
    writeFile(path.join(outputDir, "region-shards.ts"), renderShardLoaderFile(shards)),
    ...[...shards.entries()].map(([shardKey, records]) =>
      writeFile(
        path.join(outputRegionsDir, `${shardKey}.ts`),
        renderRegionShardFile(shardKey, records),
      ),
    ),
  ])

  console.log(
    `generate:data version=${dataVersion.编码} cities=${cityRecords.length} regions=${regionRecords.length}`,
  )
  console.log(
    `generate:data province=${stats.省级} city=${stats.地级} county=${stats.县级} township=${stats.乡级} hmt=${stats.港澳台}`,
  )
}

async function readJson(file) {
  return JSON.parse(await readFile(path.join(sourceDist, file), "utf8"))
}

function addRegion(record, regionRecords, byCode) {
  regionRecords.push(record)
  byCode.set(record.编码, record)
}

function createRecord({
  code,
  name,
  level,
  parentCode,
  adminType,
  provinceName,
  scope,
  aliases = [],
  hot = false,
  path,
}) {
  const pathRecords = [...path]
  const pathCodes = [...pathRecords.map((record) => record.编码), code]
  const pathNames = [...pathRecords.map((record) => record.名称), name]
  const record = {
    编码: code,
    名称: name,
    拼音: toPinyin(name),
    首字母: toInitials(name),
    级别: level,
    行政区类型: adminType,
    地区口径: scope,
    路径编码: pathCodes,
    路径名称: pathNames,
    国家代码: "CN",
  }

  if (parentCode) {
    record.父级编码 = parentCode
  }
  if (provinceName) {
    record.省份名称 = provinceName
  }
  if (aliases.length > 0) {
    record.别名 = unique(aliases.filter((alias) => alias && alias !== name))
  }
  if (hot) {
    record.热门 = true
  }

  record.完整路径 = [...pathRecords, record]
  return record
}

function addHmtRegions(hmt, regionRecords, byCode) {
  const scopeByRoot = new Map([
    ["香港特别行政区", "香港澳门特别行政区"],
    ["澳门特别行政区", "香港澳门特别行政区"],
    ["台湾省", "台湾地区"],
  ])
  const rootCodeByName = new Map([
    ["香港特别行政区", "810000"],
    ["澳门特别行政区", "820000"],
    ["台湾省", "710000"],
  ])

  for (const [rootName, children] of Object.entries(hmt)) {
    const rootCode = rootCodeByName.get(rootName)
    const scope = scopeByRoot.get(rootName)
    if (!rootCode || !scope) {
      continue
    }

    const root = createRecord({
      code: rootCode,
      name: rootName,
      level: "省",
      adminType: rootName.endsWith("特别行政区") ? "特别行政区" : "地区",
      provinceName: stripProvinceName(rootName),
      scope,
      aliases: [stripProvinceName(rootName)],
      path: [],
    })
    addRegion(root, regionRecords, byCode)

    for (const [childName, leaves] of Object.entries(children)) {
      const child = createRecord({
        code: hmtCode(rootCode, [rootName, childName]),
        name: childName,
        level: "市",
        parentCode: rootCode,
        adminType: inferHmtAdminType(childName),
        provinceName: root.名称,
        scope,
        path: [root],
      })
      addRegion(child, regionRecords, byCode)

      for (const leafName of leaves) {
        const leaf = createRecord({
          code: hmtCode(rootCode, [rootName, childName, leafName]),
          name: leafName,
          level: "区县",
          parentCode: child.编码,
          adminType: inferHmtAdminType(leafName),
          provinceName: root.名称,
          scope,
          path: [root, child],
        })
        addRegion(leaf, regionRecords, byCode)
      }
    }
  }
}

function provinceCode(code) {
  return code.length === 2 ? `${code}0000` : code
}

function cityCode(code) {
  return code.length === 4 ? `${code}00` : code
}

function hmtCode(rootCode, pathParts) {
  return `${rootCode.slice(0, 2)}-${hashPath(pathParts)}`
}

function hashPath(pathParts) {
  let hash = 2166136261
  for (const char of pathParts.join("/")) {
    hash ^= char.codePointAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36).toUpperCase().padStart(7, "0")
}

function toPinyin(name) {
  return (
    pinyin(name, { toneType: "none", type: "array", nonZh: "removed" })
      .join("")
      .toLowerCase() || "unknown"
  )
}

function toInitials(name) {
  return (
    pinyin(name, {
      pattern: "first",
      toneType: "none",
      type: "array",
      nonZh: "removed",
    })
      .join("")
      .toUpperCase() || "#"
  )
}

function stripCityName(name) {
  return name.endsWith("市") ? name.slice(0, -1) : name
}

function stripProvinceName(name) {
  return name
    .replace(/特别行政区$/, "")
    .replace(/维吾尔自治区$/, "")
    .replace(/壮族自治区$/, "")
    .replace(/回族自治区$/, "")
    .replace(/自治区$/, "")
    .replace(/[省市]$/, "")
}

function inferMainlandAdminType(name, level) {
  const suffixes = [
    "自治州",
    "特别行政区",
    "自治区",
    "自治县",
    "自治旗",
    "街道办事处",
    "街道",
    "民族乡",
    "民族苏木",
    "苏木",
    "地区",
    "林区",
    "特区",
    "新区",
    "开发区",
    "管理区",
    "矿区",
    "市",
    "盟",
    "旗",
    "区",
    "县",
    "镇",
    "乡",
    "团",
  ]
  return suffixes.find((suffix) => name.endsWith(suffix)) ?? level
}

function inferHmtAdminType(name) {
  if (name.endsWith("特别行政区")) return "特别行政区"
  if (name.endsWith("岛")) return "分区"
  if (name.endsWith("半岛") || name.endsWith("外岛")) return "分区"
  if (name.endsWith("堂区")) return "堂区"
  if (name.endsWith("市")) return "市"
  if (name.endsWith("县")) return "县"
  if (name.endsWith("镇")) return "镇"
  if (name.endsWith("乡")) return "乡"
  if (name.endsWith("区")) return "区"
  return "地区"
}

function isCitySelectable(record, sourceName) {
  if (municipalities.has(record.编码.slice(0, 2))) {
    return false
  }
  if (sourceName === "市辖区") {
    return false
  }
  if (sourceName.includes("直辖县级")) {
    return false
  }
  return record.级别 === "市"
}

function countStats(records) {
  return {
    省级: records.filter(
      (record) => record.级别 === "省" && record.地区口径 === "大陆行政区划",
    ).length,
    地级: records.filter(
      (record) => record.级别 === "市" && record.地区口径 === "大陆行政区划",
    ).length,
    县级: records.filter(
      (record) => record.级别 === "区县" && record.地区口径 === "大陆行政区划",
    ).length,
    乡级: records.filter(
      (record) => record.级别 === "乡镇街道" && record.地区口径 === "大陆行政区划",
    ).length,
    港澳台: records.filter((record) => record.地区口径 !== "大陆行政区划").length,
  }
}

function compareRecord(left, right) {
  return left.编码.localeCompare(right.编码, "en")
}

function unique(values) {
  return [...new Set(values)]
}

function createRegionShards(regionRecords) {
  const shards = new Map()
  for (const record of regionRecords) {
    const shardKey = getShardKey(record)
    const shardRecords = shards.get(shardKey) ?? []
    shardRecords.push(record)
    shards.set(shardKey, shardRecords)
  }

  return new Map(
    [...shards.entries()].map(([shardKey, records]) => [
      shardKey,
      [...records].sort(compareRecord),
    ]),
  )
}

function getShardKey(record) {
  if (record.地区口径 && record.地区口径 !== "大陆行政区划") {
    return "hmt"
  }
  return record.路径编码?.[0] ?? record.编码
}

function createRegionManifest(regionRecords, shards, source) {
  const codeToShard = Object.fromEntries(
    regionRecords.map((record) => [record.编码, getShardKey(record)]),
  )
  const rootRecords = regionRecords
    .filter((record) => !record.父级编码)
    .sort(compareRecord)
  const shardInfos = [...shards.entries()].map(([shardKey, records]) =>
    createShardInfo(shardKey, records),
  )

  return {
    source,
    shardInfos,
    codeToShard,
    rootRecords,
  }
}

function createShardInfo(shardKey, records) {
  const rootRecords = records.filter((record) => !record.父级编码)
  return {
    分片键: shardKey,
    名称: shardKey === "hmt" ? "港澳台" : (rootRecords[0]?.名称 ?? shardKey),
    根编码列表: rootRecords.map((record) => record.编码),
    记录数: records.length,
    层级统计: countStats(records),
    地区口径: shardKey === "hmt" ? undefined : rootRecords[0]?.地区口径,
    checksum: checksumRecords(records),
  }
}

function checksumRecords(records) {
  return createHash("sha256")
    .update(JSON.stringify(records.map((record) => record.编码)))
    .digest("hex")
    .slice(0, 16)
}

function generatedHeader() {
  return `/* eslint-disable */\n// This file is generated by packages/data/scripts/generate-data.mjs.\n// Do not edit manually.\n\n`
}

function renderSharedTypes() {
  return `export type 数据来源类型 = "官方源" | "第三方种子"\nexport type DataSourceType = 数据来源类型\n\nexport type 行政区层级统计 = {\n  省级: number\n  地级: number\n  县级: number\n  乡级: number\n  港澳台: number\n}\nexport type RegionLevelStats = 行政区层级统计\n\nexport type 数据来源信息 = {\n  来源名称: string\n  来源URL: string\n  来源类型: 数据来源类型\n  许可证?: string\n  版本或Commit?: string\n  数据截止日期: string\n  抓取时间: string\n  生成脚本版本: string\n  校验依据: readonly string[]\n  记录数量: 行政区层级统计\n}\nexport type DataSourceInfo = 数据来源信息\n`
}

function renderCitiesFile(cityRecords, source) {
  const generated = {
    dataVersion,
    source,
    hotCityCodes,
    cityRecords,
  }
  return `${generatedHeader()}import type { 城市 } from "@ikalt/city-select-core"\n\n${renderSharedTypes()}\n\nexport const 生成数据版本 = ${JSON.stringify(generated.dataVersion, null, 2)} as const\nexport const generatedDataVersion = 生成数据版本\n\nexport const 生成数据来源: 数据来源信息 = ${JSON.stringify(generated.source, null, 2)}\nexport const generatedDataSource = 生成数据来源\n\nexport const 生成热门城市编码 = ${JSON.stringify(generated.hotCityCodes, null, 2)} as const\nexport const generatedHotCityCodes = 生成热门城市编码\n\nconst generatedCitiesJson = ${JSON.stringify(JSON.stringify(generated.cityRecords))}\nexport const 生成城市列表 = JSON.parse(generatedCitiesJson) as readonly 城市[]\nexport const generatedCities = 生成城市列表\n`
}

function renderFullRegionsFile(regionRecords) {
  return `${generatedHeader()}import type { 城市 } from "@ikalt/city-select-core"\n\nconst generatedRegionsJson = ${JSON.stringify(JSON.stringify(regionRecords))}\nexport const 生成行政区列表 = JSON.parse(generatedRegionsJson) as readonly 城市[]\nexport const generatedRegions = 生成行政区列表\n`
}

function renderLegacyRegionsFile() {
  return `${generatedHeader()}export * from "./cities.js"\nexport * from "./regions-full.js"\n`
}

function renderManifestFile(manifest) {
  return `${generatedHeader()}import type { 城市, 地区口径 } from "@ikalt/city-select-core"\nimport type { 数据来源信息, 行政区层级统计 } from "./cities.js"\n\nexport type 行政区分片信息 = {\n  分片键: string\n  名称: string\n  根编码列表: readonly string[]\n  记录数: number\n  层级统计: 行政区层级统计\n  地区口径?: 地区口径\n  checksum: string\n}\nexport type RegionShardInfo = 行政区分片信息\n\nexport const 生成行政区来源: 数据来源信息 = ${JSON.stringify(manifest.source, null, 2)}\nexport const generatedRegionSource = 生成行政区来源\n\nexport const 生成行政区分片列表: readonly 行政区分片信息[] = ${JSON.stringify(manifest.shardInfos, null, 2)}\nexport const generatedRegionShardInfos: readonly 行政区分片信息[] = 生成行政区分片列表\n\nexport const 生成行政区编码分片表: Readonly<Record<string, string>> = ${JSON.stringify(manifest.codeToShard, null, 2)}\nexport const generatedRegionCodeShardMap: Readonly<Record<string, string>> = 生成行政区编码分片表\n\nconst generatedRootRegionsJson = ${JSON.stringify(JSON.stringify(manifest.rootRecords))}\nexport const 生成行政区根列表 = JSON.parse(generatedRootRegionsJson) as readonly 城市[]\nexport const generatedRootRegions = 生成行政区根列表\n`
}

function renderShardLoaderFile(shards) {
  const shardKeys = [...shards.keys()].sort((left, right) =>
    left.localeCompare(right, "en"),
  )
  const union = shardKeys.map((shardKey) => JSON.stringify(shardKey)).join(" | ")
  const loaders = shardKeys
    .map(
      (shardKey) =>
        `  ${JSON.stringify(shardKey)}: () => import("./regions/${shardKey}.js").then((module) => module.生成行政区分片),`,
    )
    .join("\n")
  return `${generatedHeader()}import type { 城市 } from "@ikalt/city-select-core"\n\nexport type 行政区分片键 = ${union}\nexport type RegionShardKey = 行政区分片键\n\nconst loaders = {\n${loaders}\n} satisfies Record<行政区分片键, () => Promise<readonly 城市[]>>\n\nexport function 生成行政区分片键列表(): readonly 行政区分片键[] {\n  return Object.keys(loaders) as 行政区分片键[]\n}\nexport const generatedRegionShardKeys = 生成行政区分片键列表\n\nexport async function 加载生成行政区分片(分片键: string): Promise<readonly 城市[] | undefined> {\n  const loader = loaders[分片键 as 行政区分片键]\n  return loader ? loader() : undefined\n}\nexport const loadGeneratedRegionShard = 加载生成行政区分片\n`
}

function renderRegionShardFile(shardKey, records) {
  return `${generatedHeader()}import type { 城市 } from "@ikalt/city-select-core"\n\nexport const 行政区分片键 = ${JSON.stringify(shardKey)} as const\nexport const regionShardKey = 行政区分片键\n\nconst generatedRegionShardJson = ${JSON.stringify(JSON.stringify(records))}\nexport const 生成行政区分片 = JSON.parse(generatedRegionShardJson) as readonly 城市[]\nexport const generatedRegionShard = 生成行政区分片\n`
}

function stripInternalPath(record) {
  const publicRecord = { ...record }
  delete publicRecord.完整路径
  return publicRecord
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
