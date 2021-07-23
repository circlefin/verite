import {
  asyncMap,
  createCredentialApplication,
  decodeVerifiablePresentation,
  randomDidKey,
  VerificationError
} from "@centre/verity"
import { createUser } from "lib/database"
import { createKycAmlFulfillment } from "lib/issuance/fulfillment"
import { findManifestById } from "lib/issuance/manifest"
import { validateCredentialSubmission } from "lib/issuance/submission"
import { credentialSigner } from "lib/signer"
import { ValidationError } from "types"

// tslint:disable-next-line: max-line-length
const expiredPresentation =
  "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MjYyMTU0MTEsInZwIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZVByZXNlbnRhdGlvbiJdfSwic3ViIjoiZGlkOmV0aHI6MHg0MzVkZjNlZGE1NzE1NGNmOGNmNzkyNjA3OTg4MWYyOTEyZjU0ZGI0IiwibmJmIjoxNjI2MjE1NDAxLCJpc3MiOiJkaWQ6a2V5Ono2TWtzR0toMjNtSFp6MkZwZU5ENld4SnR0ZDhUV2hrVGdhN210Yk0xeDF6TTY1bSJ9.UjdICQPEQOXk52Riq4t88Yol8T_gdmNag3G_ohzMTYDZRZNok7n-R4WynPrFyGASEMqDfi6ZGanSOlcFm2W6DQ"

describe("issuance", () => {
  it("just works", async () => {
    // 0. ISSUER: The issuer gets a DID
    expect(credentialSigner.did).toEqual(
      "did:key:z6MksGKh23mHZz2FpeND6WxJttd8TWhkTga7mtbM1x1zM65m"
    )
    expect(credentialSigner.signingConfig.alg).toEqual("EdDSA")

    // 1. CLIENT: The subject gets a DID
    const clientDidKey = await randomDidKey()
    expect(clientDidKey.publicKey).toBeDefined()
    expect(clientDidKey.privateKey).toBeDefined()
    expect(clientDidKey.controller.startsWith("did:key")).toBe(true)
    expect(clientDidKey.id.startsWith(clientDidKey.controller)).toBe(true)

    // 2. ISSUER: Discovery of available credentials
    const kycManifest = findManifestById("KYCAMLAttestation")

    // 3. CLIENT: Requesting the credential
    const user = await createUser("test@test.com", {
      jumioScore: 55,
      ofacScore: 2
    })
    const application = await createCredentialApplication(
      clientDidKey,
      kycManifest
    )
    expect(application.credential_application).toBeDefined()
    expect(application.credential_application.manifest_id).toEqual(
      "KYCAMLAttestation"
    )
    expect(application.presentation_submission).toBeDefined()
    expect(application.presentation_submission.definition_id).toEqual(
      kycManifest.presentation_definition.id
    )
    const acceptedApplication = await validateCredentialSubmission(application)

    // 4. ISSUER: Creating the VC
    // 5. ISSUER: Delivering the VC
    const fulfillment = await createKycAmlFulfillment(
      user,
      credentialSigner,
      acceptedApplication
    )
    expect(fulfillment.credential_fulfillment).toBeDefined()
    expect(fulfillment.credential_fulfillment.manifest_id).toEqual(
      "KYCAMLAttestation"
    )

    const { verifiablePresentation } = await decodeVerifiablePresentation(
      fulfillment.presentation
    )

    await asyncMap(
      verifiablePresentation.verifiableCredential,
      async (verifiableCredential) => {
        expect(verifiableCredential.type).toEqual([
          "VerifiableCredential",
          "KYCAMLAttestation"
        ])
        expect(verifiableCredential.proof).toBeDefined()

        const credentialSubject = verifiableCredential.credentialSubject
        expect(credentialSubject.id).toEqual(clientDidKey.controller)
        expect(credentialSubject.KYCAMLAttestation.serviceProviders).toEqual([
          {
            "@type": "KYCAMLProvider",
            name: "Jumio",
            score: user.jumioScore
          },
          {
            "@type": "KYCAMLProvider",
            name: "OFAC-SDN",
            score: user.ofacScore
          }
        ])
      }
    )
  })

  it("rejects an expired input", async () => {
    expect.assertions(1)

    const clientDidKey = await randomDidKey()
    const kycManifest = findManifestById("KYCAMLAttestation")
    const application = await createCredentialApplication(
      clientDidKey,
      kycManifest
    )

    // overwrite with expired VP
    application.presentation = expiredPresentation

    await expect(
      validateCredentialSubmission(application)
    ).rejects.toThrowError(VerificationError)
  })
})
