import { randomBytes } from "crypto"

import { VerificationError } from "../../../lib/errors"
import {
  buildCredentialApplication,
  decodeCredentialApplication
} from "../../../lib/issuer/credential-application"
import { buildKycAmlManifest } from "../../../lib/issuer/credential-manifest"
import { buildIssuer, randomDidKey } from "../../../lib/utils/did-fns"
import { generateManifestAndIssuer } from "../../support/manifest-fns"

describe("buildCredentialApplication", () => {
  it("builds a valid credential application", async () => {
    const issuerDidKey = await randomDidKey(randomBytes)
    const issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)

    // 1. CLIENT: The client gets a DID
    const clientDidKey = await randomDidKey(randomBytes)
    const credentialIssuer = { id: issuer.did, name: "Verite" }
    const kycManifest = buildKycAmlManifest(credentialIssuer)

    const credentialApplication = await buildCredentialApplication(
      clientDidKey,
      kycManifest
    )

    const application = await decodeCredentialApplication(credentialApplication)

    expect(application.credential_application.manifest_id).toEqual(
      "KYCAMLManifest"
    )
    expect(application.presentation_submission).toBeDefined()
    expect(application.presentation_submission?.definition_id).toEqual(
      kycManifest.presentation_definition?.id
    )
  })
})

describe("decodeCredentialApplication", () => {
  it("decodes the Credential Application", async () => {
    const clientDidKey = randomDidKey(randomBytes)
    const { manifest } = await generateManifestAndIssuer()
    const application = await buildCredentialApplication(clientDidKey, manifest)

    const decoded = await decodeCredentialApplication(application)

    expect(decoded).toMatchObject({
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      credential_application: {
        // id: 'f584577a-607f-43d9-a128-39b21f126f96', client-generated unique identifier
        manifest_id: "KYCAMLManifest",
        format: { jwt_vp: { alg: ["EdDSA"] } }
      },
      presentation_submission: {
        // id: '0a97ed30-a4a9-43fb-9564-4d65db62d4bc', client-generated unique identifier
        definition_id: "ProofOfControlPresentationDefinition",
        descriptor_map: [
          {
            id: "proofOfIdentifierControlVP",
            format: "jwt_vp",
            path: "$.presentation"
          }
        ]
      },
      verifiableCredential: [],
      holder: clientDidKey.subject,
      type: ["VerifiablePresentation", "CredentialApplication"]
    })
  })

  it("rejects an expired input", async () => {
    expect.assertions(1)

    const expiredPresentation =
      "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MjYyMTU0MTEsInZwIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZVByZXNlbnRhdGlvbiJdfSwic3ViIjoiZGlkOmV0aHI6MHg0MzVkZjNlZGE1NzE1NGNmOGNmNzkyNjA3OTg4MWYyOTEyZjU0ZGI0IiwibmJmIjoxNjI2MjE1NDAxLCJpc3MiOiJkaWQ6a2V5Ono2TWtzR0toMjNtSFp6MkZwZU5ENld4SnR0ZDhUV2hrVGdhN210Yk0xeDF6TTY1bSJ9.UjdICQPEQOXk52Riq4t88Yol8T_gdmNag3G_ohzMTYDZRZNok7n-R4WynPrFyGASEMqDfi6ZGanSOlcFm2W6DQ"

    await expect(
      decodeCredentialApplication(expiredPresentation)
    ).rejects.toThrowError(VerificationError)
  })
})
