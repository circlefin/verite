import { asyncMap } from "lib/async-fns"
import { createFullfillmentFromVp } from "lib/issuance/fulfillment"
import { findManifestById } from "lib/issuance/manifest"
import {
  createCredentialApplication,
  decodeVc,
  issuer,
  randomDidKey
} from "lib/verity"

describe("issuance", () => {
  it("just works", async () => {
    // 0. ISSUER: The issuer gets a DID
    expect(issuer.did).toEqual(
      "did:key:z6MksGKh23mHZz2FpeND6WxJttd8TWhkTga7mtbM1x1zM65m"
    )
    expect(issuer.alg).toEqual("EdDSA")

    // 1. CLIENT: The subject gets a DID
    const clientDidKey = await randomDidKey()
    expect(clientDidKey.publicKey).toBeDefined()
    expect(clientDidKey.privateKey).toBeDefined()
    expect(clientDidKey.controller.startsWith("did:key")).toBe(true)
    expect(clientDidKey.id.startsWith(clientDidKey.controller)).toBe(true)

    // 2. ISSUER: Discovery of available credentials
    const kycManifest = findManifestById("KYCAMLAttestation")

    // 3. CLIENT: Requesting the credential
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

    /*
    verifiableCredentials.map(({ verifiableCredential }) => {
      expect(verifiableCredential.credentialSubject.id).toEqual(
        clientDidKey.controller
      )
      expect(verifiableCredential.type).toEqual(["VerifiableCredential"])
      expect(verifiableCredential.proof).toBeDefined()
    })*/

    // 4. ISSUER: Creating the VC
    // 5. ISSUER: Delivering the VC
    const fulfillment = await createFullfillmentFromVp(issuer, application)
    expect(fulfillment.credential_fulfillment).toBeDefined()
    expect(fulfillment.credential_fulfillment.manifest_id).toEqual(
      "KYCAMLAttestation"
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
