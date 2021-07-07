import { createMocks } from "node-mocks-http"
import { createUser } from "lib/database"
import { inssuanceManifestToken } from "lib/issuance/manifest"
import handler from "pages/api/issuance/manifest/[token]"

describe("GET /issuance/manifest/[token]", () => {
  it("returns a customized manifest", async () => {
    const user = createUser("test@test.com", "testing")
    const token = await inssuanceManifestToken(user)

    const { req, res } = createMocks({ method: "GET", query: { token } })

    await handler(req, res)

    expect(res.statusCode).toBe(200)

    const manifest = res._getJSONData()
    expect(manifest.id).toEqual("Circle-KYCAMLAttestation")
  })

  it("returns an error if given an invalid token", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { token: "abc123" }
    })

    await handler(req, res)

    expect(res.statusCode).toBe(404)
    expect(res._getJSONData()).toEqual({ status: 404, message: "Not found" })
  })
})
