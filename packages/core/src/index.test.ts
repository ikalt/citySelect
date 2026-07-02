import { describe, expect, it } from "vitest"

import { citySelectCorePackage } from "./index"

describe("@ikalt/city-select-core", () => {
  it("exports its package identity", () => {
    expect(citySelectCorePackage).toBe("@ikalt/city-select-core")
  })
})
