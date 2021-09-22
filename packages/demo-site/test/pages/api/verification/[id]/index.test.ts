import { kycVerificationRequest } from "@centre/verity"
import { createMocks } from "node-mocks-http"
import { v4 as uuidv4 } from "uuid"
import { saveVerificationRequest } from "../../../../../lib/database"
import { fullURL } from "../../../../../lib/utils"
import handler from "../../../../../pages/api/verification/[id]/index"

describe("GET /verification/[id]", () => {
  it("returns the presentation definition", async () => {
    const verificationRequest = kycVerificationRequest(
      uuidv4(),
      process.env.VERIFIER_DID,
      fullURL("/api/verification/submission"),
      fullURL("/api/verification/callback")
    )
    await saveVerificationRequest(verificationRequest)

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
