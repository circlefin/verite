import {
  createCredentialApplication,
  decodeCredentialApplication
} from "../../lib/credential-application-fns"
import { buildAndSignFulfillment } from "../../lib/issuer/fulfillment"
import { createKycAmlManifest } from "../../lib/issuer/manifest"
import { decodeVerifiablePresentation } from "../../lib/utils/credentials"
import { didKeyToIssuer, randomDidKey } from "../../lib/utils/did-fns"
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

    // TODO(mv): should we validate this??
    // await validateCredentialApplication(credentialApplication, manifest)

    const decodedApplication = await decodeCredentialApplication(
      credentialApplication
    )

    // 4. ISSUER: Creating the VC
    // 5. ISSUER: Delivering the VC
    const fulfillment = await buildAndSignFulfillment(
      issuer,
      decodedApplication,
      kycAmlAttestationFixture,
      revocationListFixture
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
