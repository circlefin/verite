import { parseClaimFormat } from "../../../lib/utils"

describe("claim-format", () => {
  it("works", async () => {
    const result = parseClaimFormat({
      jwt_vp: {
        alg: ["EdDSA"]
      }
    })
    expect(result).toEqual("jwt_vp")
  })
})
