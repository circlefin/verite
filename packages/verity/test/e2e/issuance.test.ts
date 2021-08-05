import {
  createCredentialApplication,
  decodeVerifiablePresentation,
  validateCredentialApplication,
  didKeyToIssuer,
  createKycAmlManifest,
  buildAndSignKycAmlFulfillment,
  randomDidKey
} from "../../lib"
import type { RevocableCredential, RevocablePresentation } from "../../types"
import { kycAmlAttestationFixture } from "../fixtures/attestations"
import { revocationListFixture } from "../fixtures/revocation-list"

describe("issuance", () => {
  it("issues verified credentails", async () => {
    // 0. ISSUER: The issuer gets a DID
    const issuerDidKey = await randomDidKey()
    const issuer = didKeyToIssuer(issuerDidKey)

    // 1. CLIENT: The client gets a DID
    const clientDidKey = await randomDidKey()

    // 2. ISSUER: Generates a QR code for the client
    const credentialIssuer = { id: issuer.did, name: "Verity" }
    const manifest = createKycAmlManifest(credentialIssuer)

    // 3. CLIENT: Client generates a credential application
    const credentialApplication = await createCredentialApplication(
      clientDidKey,
      manifest
    )

    const acceptedApplication = await validateCredentialApplication(
      credentialApplication,
      manifest
    )

    // 4. ISSUER: Creating the VC
    // 5. ISSUER: Delivering the VC
    const fulfillment = await buildAndSignKycAmlFulfillment(
      issuer,
      acceptedApplication,
      revocationListFixture,
      kycAmlAttestationFixture
    )

    const verifiablePresentation = (await decodeVerifiablePresentation(
      fulfillment.presentation
    )) as RevocablePresentation

    verifiablePresentation.verifiableCredential!.forEach(
      (verifiableCredential: RevocableCredential) => {
        expect(verifiableCredential.type).toEqual([
          "VerifiableCredential",
          "KYCAMLAttestation"
        ])
        expect(verifiableCredential.proof).toBeDefined()

        const credentialSubject = verifiableCredential.credentialSubject
        expect(credentialSubject.id).toEqual(clientDidKey.controller)
        expect(credentialSubject.KYCAMLAttestation.serviceProviders).toEqual(
          kycAmlAttestationFixture.serviceProviders
        )

        const credentialStatus = verifiableCredential.credentialStatus
        expect(credentialStatus.id).toEqual(
          "http://example.com/revocation-list#42"
        )
        expect(credentialStatus.type).toEqual("RevocationList2021Status")
        expect(credentialStatus.statusListIndex).toEqual("42")
        expect(credentialStatus.statusListCredential).toEqual(
          "http://example.com/revocation-list"
        )
      }
    )
  })
})
