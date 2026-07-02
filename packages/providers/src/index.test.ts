import { describe, expect, it } from "vitest"

import { citySelectProvidersPackage } from "./index"

describe("@ikalt/city-select-providers", () => {
  it("exports its package identity", () => {
    expect(citySelectProvidersPackage).toBe("@ikalt/city-select-providers")
  })
})
