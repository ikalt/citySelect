import js from "@eslint/js"
import tseslint from "typescript-eslint"

export default [
  {
    ignores: [
      ".agents/**",
      ".codex/**",
      ".trellis/**",
      ".turbo/**",
      "build/**",
      "dist/**",
      "node_modules/**",
      "tmp/**",
      "**/*.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
]
