import { temporaryAuthToken } from "../../../../../lib/database"
import handler from "../../../../../pages/api/demos/issuer/manifests/[type]/[token]"
import { userFactory } from "../../../../factories"
import { createMocks } from "../../../../support/mocks"

describe("GET /api/demos/issuer/manifests/[type]/[token]", () => {
  it("returns the KYC/AML manifest", async () => {
    expect.assertions(4)

    const user = await userFactory()
    const token = await temporaryAuthToken(user)

    const { req, res } = createMocks({
      method: "GET",
      query: { type: "kyc", token }
    })

    await handler(req, res)

    const json = res._getJSONData()
    const manifest = json.body.manifest
    expect(res.statusCode).toBe(200)
    expect(json.reply_url).toBeDefined()
    expect(manifest.id).toEqual("KYCAMLManifest")
    expect(manifest).toMatchSnapshot()
  })

  it("returns the CreditScore manifest", async () => {
    expect.assertions(4)

    const user = await userFactory()
    const token = await temporaryAuthToken(user)
    const { req, res } = createMocks({
      method: "GET",
      query: { type: "credit-score", token }
    })

    await handler(req, res)

    const json = res._getJSONData()
    const manifest = json.body.manifest
    expect(res.statusCode).toBe(200)
    expect(json.reply_url).toBeDefined()
    expect(manifest.id).toEqual("CreditScoreManifest")
    expect(manifest).toMatchSnapshot()
  })

  it("returns 404 if no manifest is found", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { type: "invalid", token: "something-invalid" }
    })

    await handler(req, res)

    expect(res.statusCode).toBe(404)
  })
})
