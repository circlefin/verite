import { generateKycVerificationRequest } from "@centre/verity"
import { createMocks } from "node-mocks-http"
import { saveVerificationRequest } from "../../../../../lib/database"
import handler from "../../../../../pages/api/verification/[id]/index"

describe("GET /verification/[id]", () => {
  it("returns the presentation definition", async () => {
    const verificationRequest = generateKycVerificationRequest(
      process.env.VERIFIER_DID,
      `${process.env.HOST}/api/verification/submission`,
      process.env.VERIFIER_DID,
      `${process.env.HOST}/api/verification/callback`
    )
    await saveVerificationRequest(verificationRequest)

    const { req, res } = createMocks({
      method: "GET",
      query: { id: verificationRequest.request.id }
    })

    await handler(req, res)

    const presentation = res._getJSONData()
    expect(res.statusCode).toBe(200)
    expect(presentation.request).toEqual(verificationRequest)
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
