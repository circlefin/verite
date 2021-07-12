import { createMocks } from "node-mocks-http"
import handler from "pages/api/issuance/manifest"

describe("GET /issuance/manifest/[token]", () => {
  it("returns a customized manifest", async () => {
    const { req, res } = createMocks({ method: "GET" })

    await handler(req, res)

    const manifest = res._getJSONData()
    expect(res.statusCode).toBe(200)
    expect(manifest.id).toEqual("KYCAMLAttestation")
  })
})
