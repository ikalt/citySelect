import { describe, expect, it } from "vitest"

import { citySelectTaroPackage } from "./index"

describe("@ikalt/city-select-taro", () => {
  it("exports its package identity", () => {
    expect(citySelectTaroPackage).toBe("@ikalt/city-select-taro")
  })
})
