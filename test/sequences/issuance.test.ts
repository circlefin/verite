import { asyncMap } from "lib/async-fns"
import { decodeVc } from "lib/credentials"
import { randomDidKey } from "lib/didKey"
import { createFullfillment } from "lib/issuance/fulfillment"
import { findManifestById } from "lib/issuance/manifest"
import { createCredentialApplication } from "lib/issuance/submission"
import { issuer } from "lib/sign-utils"

describe("issuance", () => {
  it("just works", async () => {
    // 0. ISSUER: The issuer gets a DID
    expect(issuer.did).toEqual(
      "did:key:z6Mki3hKaW5bPVjDSbhqqzrdcQpzcczC2XLPqAwkLhzziatV"
    )
    expect(issuer.alg).toEqual("EdDSA")

    // 1. CLIENT: The subject gets a DID
    const clientDidKey = await randomDidKey()
    expect(clientDidKey.publicKey).toBeDefined()
    expect(clientDidKey.privateKey).toBeDefined()
    expect(clientDidKey.controller.startsWith("did:key")).toBe(true)
    expect(clientDidKey.id.startsWith(clientDidKey.controller)).toBe(true)

    // 2. ISSUER: Discovery of available credentials
    const kycManifest = findManifestById("Circle-KYCAMLAttestation")

    // 3. CLIENT: Requesting the credential
    const application = await createCredentialApplication(
      clientDidKey,
      kycManifest
    )
    expect(application.credential_submission).toBeDefined()
    expect(application.credential_submission.manifest_id).toEqual(
      "Circle-KYCAMLAttestation"
    )
    expect(application.presentation_submission).toBeDefined()
    const verifiableCredentials: any[] = await asyncMap(
      application.verifiableCredential,
      decodeVc
    )
    verifiableCredentials.map(({ verifiableCredential }) => {
      expect(verifiableCredential.credentialSubject.id).toEqual(
        clientDidKey.controller
      )
      expect(verifiableCredential.type).toEqual(["VerifiableCredential"])
      expect(verifiableCredential.proof).toBeDefined()
    })

    // 4. ISSUER: Creating the VC
    // 5. ISSUER: Delivering the VC
    const fulfillment = await createFullfillment(issuer, application)
    expect(fulfillment.credential_fulfillment).toBeDefined()
    expect(fulfillment.credential_fulfillment.manifest_id).toEqual(
      "Circle-KYCAMLAttestation"
    )

    await asyncMap(fulfillment.verifiableCredential, async (vc) => {
      const { verifiableCredential } = await decodeVc(vc)
      expect(verifiableCredential.credentialSubject.id).toEqual(
        clientDidKey.controller
      )
      expect(verifiableCredential.type).toEqual([
        "VerifiableCredential",
        "KYCAMLAttestation"
      ])
      expect(verifiableCredential.proof).toBeDefined()
    })
  })
})
