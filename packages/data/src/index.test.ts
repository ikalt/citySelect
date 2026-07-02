import { describe, expect, it } from "vitest"

import { citySelectDataPackage } from "./index"

describe("@ikalt/city-select-data", () => {
  it("exports its package identity", () => {
    expect(citySelectDataPackage).toBe("@ikalt/city-select-data")
  })
})
