import {
  createCredentialApplication,
  decodeCredentialApplication
} from "../../lib/credential-application"
import { VerificationError } from "../../lib/errors"
import { createKycAmlManifest } from "../../lib/issuer/manifest"
import { didKeyToIssuer, randomDidKey } from "../../lib/utils/did-fns"
import { generateManifestAndIssuer } from "../support/manifest-fns"

describe("createCredentialApplication", () => {
  it("builds a valid credential application", async () => {
    const issuerDidKey = await randomDidKey()
    const issuer = didKeyToIssuer(issuerDidKey)

    // 1. CLIENT: The client gets a DID
    const clientDidKey = await randomDidKey()
    const credentialIssuer = { id: issuer.did, name: "Verity" }
    const kycManifest = createKycAmlManifest(credentialIssuer)

    const credentialApplication = await createCredentialApplication(
      clientDidKey,
      kycManifest
    )

    expect(credentialApplication.credential_application).toBeDefined()
    expect(credentialApplication.credential_application.manifest_id).toEqual(
      "KYCAMLAttestation"
    )
    expect(credentialApplication.presentation_submission).toBeDefined()
    expect(
      credentialApplication.presentation_submission?.definition_id
    ).toEqual(kycManifest.presentation_definition?.id)
  })
})

describe("decodeCredentialApplication", () => {
  it("rejects an expired input", async () => {
    expect.assertions(1)

    const clientDidKey = await randomDidKey()
    const { manifest } = await generateManifestAndIssuer()
    const expiredPresentation =
      "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MjYyMTU0MTEsInZwIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZVByZXNlbnRhdGlvbiJdfSwic3ViIjoiZGlkOmV0aHI6MHg0MzVkZjNlZGE1NzE1NGNmOGNmNzkyNjA3OTg4MWYyOTEyZjU0ZGI0IiwibmJmIjoxNjI2MjE1NDAxLCJpc3MiOiJkaWQ6a2V5Ono2TWtzR0toMjNtSFp6MkZwZU5ENld4SnR0ZDhUV2hrVGdhN210Yk0xeDF6TTY1bSJ9.UjdICQPEQOXk52Riq4t88Yol8T_gdmNag3G_ohzMTYDZRZNok7n-R4WynPrFyGASEMqDfi6ZGanSOlcFm2W6DQ"

    const application = await createCredentialApplication(
      clientDidKey,
      manifest
    )

    // overwrite with expired VP
    application.presentation = expiredPresentation

    await expect(decodeCredentialApplication(application)).rejects.toThrowError(
      VerificationError
    )
  })
})
