import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..")
const packageRoot = path.join(repoRoot, "packages/data")
const distDir = path.join(packageRoot, "dist")

async function main() {
  const stagingDir = await mkdtemp(path.join(os.tmpdir(), "city-select-data-pack-"))

  try {
    await cp(distDir, stagingDir, {
      recursive: true,
      filter: (source) =>
        !source.endsWith(".map") && !source.includes(`${path.sep}index.test.`),
    })
    await writeFile(
      path.join(stagingDir, "package.json"),
      JSON.stringify(await createPackageManifest(), null, 2),
    )

    const result = spawnSync("npm", ["pack", "--dry-run", stagingDir], {
      cwd: repoRoot,
      stdio: "inherit",
    })
    process.exitCode = result.status ?? 1
  } finally {
    await rm(stagingDir, { force: true, recursive: true })
  }
}

async function createPackageManifest() {
  const packageJson = JSON.parse(
    await readFile(path.join(packageRoot, "package.json"), "utf8"),
  )
  const manifest = {
    ...packageJson,
    main: "./index.js",
    types: "./index.d.ts",
    exports: {
      ".": {
        types: "./index.d.ts",
        import: "./index.js",
      },
      "./cities": {
        types: "./cities.d.ts",
        import: "./cities.js",
      },
      "./regions": {
        types: "./regions.d.ts",
        import: "./regions.js",
      },
    },
  }

  delete manifest.files
  return manifest
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
