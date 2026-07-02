import { describe, expect, it } from "vitest"

import { citySelectDemoTaroPackage } from "./index"

describe("@ikalt/city-select-demo-taro", () => {
  it("exports its package identity", () => {
    expect(citySelectDemoTaroPackage).toBe("@ikalt/city-select-demo-taro")
  })
})
