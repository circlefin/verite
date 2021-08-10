import {
  createCredentialApplication,
  decodeVerifiablePresentation,
  randomDidKey
} from "@centre/verity"
import { createMocks } from "node-mocks-http"
import { temporaryAuthToken } from "../../../../lib/database"
import { findManifestById } from "../../../../lib/manifest"
import handler from "../../../../pages/api/issuance/[token]"
import { userFactory } from "../../../factories"

const expiredPresentation =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MjYyMTU0MTEsInZwIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZVByZXNlbnRhdGlvbiJdfSwic3ViIjoiZGlkOmV0aHI6MHg0MzVkZjNlZGE1NzE1NGNmOGNmNzkyNjA3OTg4MWYyOTEyZjU0ZGI0IiwibmJmIjoxNjI2MjE1NDAxLCJpc3MiOiJkaWQ6a2V5Ono2TWtzR0toMjNtSFp6MkZwZU5ENld4SnR0ZDhUV2hrVGdhN210Yk0xeDF6TTY1bSJ9.UjdICQPEQOXk52Riq4t88Yol8T_gdmNag3G_ohzMTYDZRZNok7n-R4WynPrFyGASEMqDfi6ZGanSOlcFm2W6DQ"

describe("POST /issuance/[token]", () => {
  it("returns a KYC credential", async () => {
    const user = await userFactory()
    const token = await temporaryAuthToken(user)
    const clientDid = randomDidKey()
    const manifest = await findManifestById("KYCAMLAttestation")
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
    const user = await userFactory()
    const token = await temporaryAuthToken(user)
    const clientDid = await randomDidKey()
    const manifest = await findManifestById("CreditScoreAttestation")
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
    const user = await userFactory()
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
      errors: [
        {
          message: "Method not allowed",
          details: "Only POST requests are allowed"
        }
      ]
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
      errors: [
        {
          message: "Not found"
        }
      ]
    })
  })

  it("rejects an invalid application", async () => {
    const user = await userFactory()
    const token = await temporaryAuthToken(user)
    const clientDid = await randomDidKey()
    const kycManifest = await findManifestById("KYCAMLAttestation")
    const credentialApplication = await createCredentialApplication(
      clientDid,
      kycManifest
    )
    credentialApplication.presentation = expiredPresentation

    const { req, res } = createMocks({
      method: "POST",
      query: { token },
      body: credentialApplication
    })

    await handler(req, res)

    expect(res.statusCode).toBe(400)

    // TOOD: check response; this example should look like the following
    /*
    {
      "status": 400,
      "message": "Input wasn't a valid Verifiable Presentation",
      "errors": [
        {
          "status": 400,
          "title": "Error",
          "detail": "invalid_jwt: JWT has expired: exp: 1626215411 < now: 1626316738"
        }
      ]
    }
    */
  })

  it("returns a KYC credential with known input/output", async () => {
    const user = await userFactory({
      jumioScore: 80,
      ofacScore: 0
    })
    const token = await temporaryAuthToken(user)
    const clientDid = await randomDidKey()
    const manifest = await findManifestById("KYCAMLAttestation")
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
    const verifiablePresentation = await decodeVerifiablePresentation(
      response.presentation
    )
    const vc = verifiablePresentation.verifiableCredential[0]
    expect(vc.credentialSubject.id).toBe(clientDid.controller)
    expect(vc.credentialSubject.KYCAMLAttestation["@type"]).toBe(
      "KYCAMLAttestation"
    )
    expect(vc.credentialSubject.KYCAMLAttestation.serviceProviders).toEqual([
      {
        "@type": "KYCAMLProvider",
        name: "Jumio",
        score: 80
      },
      {
        "@type": "KYCAMLProvider",
        name: "OFAC-SDN",
        score: 0
      }
    ])
  })
})
