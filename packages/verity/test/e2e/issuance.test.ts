import { buildAndSignFulfillment } from "../../lib/issuer/fulfillment"
import {
  createCredentialApplication,
  decodeCredentialApplication,
  createKycAmlManifest
} from "../../lib/issuer/manifest"
import { decodeVerifiablePresentation } from "../../lib/utils/credentials"
import { didKeyToIssuer, randomDidKey } from "../../lib/utils/did-fns"
import { validateCredentialApplication } from "../../lib/validators/validate-credential-application"
import type { RevocableCredential, RevocablePresentation } from "../../types"
import { kycAmlAttestationFixture } from "../fixtures/attestations"
import { revocationListFixture } from "../fixtures/revocation-list"

describe("issuance", () => {
  it("issues verified credentails", async () => {
    /**
     * The issuer and the client get a DID
     */
    const issuerDidKey = randomDidKey()
    const issuer = didKeyToIssuer(issuerDidKey)
    const clientDidKey = randomDidKey()

    /**
     * The issuer generates a QR code for the client to scan
     */
    const credentialIssuer = { id: issuer.did, name: "Verity" }
    const manifest = createKycAmlManifest(credentialIssuer)

    /**
     * The client scans the QR code and generates a credential application
     */
    const credentialApplication = await createCredentialApplication(
      clientDidKey,
      manifest
    )

    /**
     * The issuer validates the credential application
     */
    await validateCredentialApplication(credentialApplication, manifest)

    /**
     * The issuer builds and signs a fulfillment
     */
    const decodedApplication = await decodeCredentialApplication(
      credentialApplication
    )
    const fulfillment = await buildAndSignFulfillment(
      issuer,
      decodedApplication,
      kycAmlAttestationFixture,
      { credentialStatus: revocationListFixture }
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
        expect(credentialSubject.id).toEqual(clientDidKey.subject)

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
