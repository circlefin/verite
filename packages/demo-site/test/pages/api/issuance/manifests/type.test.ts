import { createMocks } from "node-mocks-http"
import handler from "pages/api/issuance/manifests/[type]"

describe("GET /issuance/manifests/[type]", () => {
  it("returns the KYC/AML manifest", async () => {
    expect.assertions(3)
    const { req, res } = createMocks({ method: "GET", query: { type: "kyc" } })

    await handler(req, res)

    const manifest = res._getJSONData()
    expect(res.statusCode).toBe(200)
    expect(manifest.id).toEqual("KYCAMLAttestation")
    expect(manifest).toMatchSnapshot()
  })

  it("returns the CreditScore manifest", async () => {
    expect.assertions(3)
    const { req, res } = createMocks({
      method: "GET",
      query: { type: "credit-score" }
    })

    await handler(req, res)

    const manifest = res._getJSONData()
    expect(res.statusCode).toBe(200)
    expect(manifest.id).toEqual("CreditScoreAttestation")
    expect(manifest).toMatchSnapshot()
  })

  it("returns 404 if no manifest is found", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { type: "invalid" }
    })

    await handler(req, res)

    expect(res.statusCode).toBe(404)
  })
})
