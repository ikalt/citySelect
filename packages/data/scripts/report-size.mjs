import { readdir, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..")
const sourceGeneratedDir = path.join(repoRoot, "packages/data/src/generated")
const distGeneratedDir = path.join(repoRoot, "packages/data/dist/generated")

async function main() {
  const sourceReport = await createGeneratedReport(sourceGeneratedDir)
  printReport("source", sourceReport)

  const distReport = await createGeneratedReport(distGeneratedDir)
  if (distReport.exists) {
    printReport("dist", distReport)
  } else {
    console.log("size:data dist generated=unavailable run typecheck/build first")
  }
}

async function createGeneratedReport(generatedDir) {
  const cities = await optionalFileSize(path.join(generatedDir, "cities.js"))
  const sourceCities = await optionalFileSize(path.join(generatedDir, "cities.ts"))
  const manifest =
    (await optionalFileSize(path.join(generatedDir, "region-manifest.js"))) ??
    (await optionalFileSize(path.join(generatedDir, "region-manifest.ts")))
  const full =
    (await optionalFileSize(path.join(generatedDir, "regions-full.js"))) ??
    (await optionalFileSize(path.join(generatedDir, "regions-full.ts")))
  const legacy =
    (await optionalFileSize(path.join(generatedDir, "regions.js"))) ??
    (await optionalFileSize(path.join(generatedDir, "regions.ts")))
  const shardDir = path.join(generatedDir, "regions")
  const shards = await listFileSizes(
    shardDir,
    generatedDir.includes(`${path.sep}dist${path.sep}`) ? ".js" : ".ts",
  )
  const largestShard = shards.reduce(
    (largest, entry) => (entry.size > largest.size ? entry : largest),
    {
      file: "none",
      size: 0,
    },
  )
  const shardTotal = shards.reduce((total, entry) => total + entry.size, 0)

  return {
    exists: cities !== undefined || sourceCities !== undefined || full !== undefined,
    cities: cities ?? sourceCities ?? 0,
    full: full ?? 0,
    legacy: legacy ?? 0,
    manifest: manifest ?? 0,
    shardCount: shards.length,
    shardTotal,
    largestShard,
  }
}

function printReport(label, report) {
  console.log(
    [
      `size:data ${label}`,
      `cities=${formatBytes(report.cities)}`,
      `manifest=${formatBytes(report.manifest)}`,
      `fullCompatibility=${formatBytes(report.full)}`,
      `legacy=${formatBytes(report.legacy)}`,
      `shards=${report.shardCount}`,
      `shardsTotal=${formatBytes(report.shardTotal)}`,
      `largestShard=${report.largestShard.file}:${formatBytes(report.largestShard.size)}`,
    ].join(" "),
  )
}

async function optionalFileSize(filePath) {
  try {
    return (await stat(filePath)).size
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return undefined
    }
    throw error
  }
}

async function listFileSizes(dirPath, extension) {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true })
    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
        .map(async (entry) => ({
          file: entry.name,
          size: await optionalFileSize(path.join(dirPath, entry.name)),
        })),
    )
    return files
      .map((entry) => ({ file: entry.file, size: entry.size ?? 0 }))
      .sort((left, right) => left.file.localeCompare(right.file, "en"))
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return []
    }
    throw error
  }
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(2)}MB`
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)}KB`
  }
  return `${bytes}B`
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
