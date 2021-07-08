import { decodeVp } from "lib/credentials"
import { randomDidKey } from "lib/didKey"
import { createFullfillment } from "lib/issuance/fulfillment"
import { findManifestById } from "lib/issuance/manifest"
import { createCredentialApplication } from "lib/issuance/submission"
import { issuer } from "lib/sign-utils"

describe("issuance", () => {
  it("just works", async () => {
    // 0. ISSUER: The issuer gets a DID
    expect(issuer.did).toEqual(
      "did:key:z6MksAvYMrsEYJxb5SqKknaAKwu3PUKQ6xziK4uEtXXfUGiQ"
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
    const decodedVP = await decodeVp(application.presentation)
    expect(decodedVP.verifiablePresentation.type).toEqual([
      "VerifiablePresentation"
    ])
    decodedVP.verifiablePresentation.verifiableCredential.map((vc) => {
      expect(vc.credentialSubject.id).toEqual(clientDidKey.controller)
      expect(vc.type).toEqual(["VerifiableCredential"])
      expect(vc.proof).toBeDefined()
    })

    // 4. ISSUER: Creating the VC
    // 5. ISSUER: Delivering the VC
    const fulfillment = await createFullfillment(issuer, application)
    expect(fulfillment.credential_fulfillment).toBeDefined()
    expect(fulfillment.credential_fulfillment.manifest_id).toEqual(
      "Circle-KYCAMLAttestation"
    )
    // TODO: How do we build an Issuer for Holder+Signer here?
    //
    // decodedVP = await decodeVp(fulfillment.presentation)
    // expect(decodedVP.verifiablePresentation.type).toEqual([
    //   "VerifiablePresentation"
    // ])
    // expect(decodedVP.verifiablePresentation).toBeDefined()
    // decodedVP.verifiablePresentation.verifiableCredential.map((vc) => {
    //   expect(vc.credentialSubject.id).toEqual(clientDidKey.controller)
    //   expect(vc.type).toEqual(["VerifiableCredential", "KYCAMLAttestation"])
    //   expect(vc.proof).toBeDefined()
    // })
  })
})
