import { createMocks } from "node-mocks-http"
import { v4 as uuidv4 } from "uuid"
import { buildKycVerificationOffer } from "verite"
import { saveVerificationOffer } from "../../../../../lib/database"
import { fullURL } from "../../../../../lib/utils"
import handler from "../../../../../pages/api/demos/verifier/[id]/index"

describe("GET /verification/[id]", () => {
  it("returns the presentation definition", async () => {
    const verificationRequest = buildKycVerificationOffer(
      uuidv4(),
      process.env.VERIFIER_DID,
      fullURL("/api/demos/verifier/submission"),
      fullURL("/api/demos/verifier/callback")
    )
    await saveVerificationOffer(verificationRequest)

    const { req, res } = createMocks({
      method: "GET",
      query: { id: verificationRequest.id }
    })

    await handler(req, res)

    const presentation = res._getJSONData()
    expect(res.statusCode).toBe(200)
    expect(presentation).toEqual(verificationRequest)
  })

  it("returns a 404 if given an invalid id", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { id: "invalid" }
    })

    await handler(req, res)

    expect(res.statusCode).toBe(404)
  })
})
