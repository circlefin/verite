import { createMocks } from "node-mocks-http"
import { createUser, temporaryAuthToken } from "lib/database"
import { findManifestById } from "lib/issuance/manifest"
import { createCredentialApplication, randomDidKey } from "lib/verity"

import handler from "pages/api/issuance/submission/[token]"

describe("POST /issuance/submission/[token]", () => {
  it("returns a KYC credential", async () => {
    const user = createUser("test@test.com")
    const token = await temporaryAuthToken(user)
    const clientDid = await randomDidKey()
    const manifest = findManifestById("KYCAMLAttestation")
    const credentialApplication = await createCredentialApplication(
      clientDid,
      manifest
    )

    const { req, res } = createMocks({
      method: "POST",
      query: { token },
      body: credentialApplication
    })

    await handler(req, res)

    expect(res.statusCode).toBe(200)

    const response = res._getJSONData()
    expect(response.credential_fulfillment.manifest_id).toEqual(
      "KYCAMLAttestation"
    )
  })

  it("returns a Credit Score credential", async () => {
    const user = createUser("test@test.com")
    const token = await temporaryAuthToken(user)
    const clientDid = await randomDidKey()
    const manifest = findManifestById("CreditScoreAttestation")
    const credentialApplication = await createCredentialApplication(
      clientDid,
      manifest
    )

    const { req, res } = createMocks({
      method: "POST",
      query: { token },
      body: credentialApplication
    })

    await handler(req, res)

    expect(res.statusCode).toBe(200)

    const response = res._getJSONData()
    expect(response.credential_fulfillment.manifest_id).toEqual(
      "CreditScoreAttestation"
    )
  })

  it("returns an error if not a POST", async () => {
    const user = createUser("test@test.com")
    const token = await temporaryAuthToken(user)
    const { req, res } = createMocks({
      method: "GET",
      query: { token },
      body: {}
    })

    await handler(req, res)

    expect(res.statusCode).toBe(405)
    expect(res._getJSONData()).toEqual({
      status: 405,
      message: "Method not allowed"
    })
  })

  it("returns an error if the auth token is invalid", async () => {
    const { req, res } = createMocks({
      method: "POST",
      query: { token: "invalid" },
      body: {}
    })

    await handler(req, res)

    expect(res.statusCode).toBe(404)
    expect(res._getJSONData()).toEqual({
      status: 404,
      message: "Not found"
    })
  })
})
