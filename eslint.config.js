import js from "@eslint/js"
import tseslint from "typescript-eslint"

export default [
  {
    ignores: [
      ".agents/**",
      ".codex/**",
      ".trellis/**",
      ".turbo/**",
      "**/build/**",
      "**/dist/**",
      "packages/data/source/**",
      "packages/data/src/generated/**",
      "node_modules/**",
      "tmp/**",
      "**/*.d.ts",
    ],
  },
  {
    files: ["packages/data/scripts/**/*.mjs"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
]
