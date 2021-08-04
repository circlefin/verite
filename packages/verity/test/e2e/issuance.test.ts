import {
  createCredentialApplication,
  decodeVerifiablePresentation,
  validateCredentialSubmission,
  didKeyToIssuer,
  createKycAmlManifest,
  buildAndSignKycAmlFulfillment,
  kycAmlAttestation
} from "../../lib"
import type {
  KYCAMLProvider,
  RevocableCredential,
  RevocablePresentation,
  RevocationList2021Status
} from "../../types"
import { randomDidKey } from "../support/did-fns"

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

    const acceptedApplication = await validateCredentialSubmission(
      credentialApplication,
      async () => manifest
    )

    // 4. ISSUER: Creating the VC
    // 5. ISSUER: Delivering the VC
    const revocationList: RevocationList2021Status = {
      id: "http://example.com/revocation-list#42",
      type: "RevocationList2021Status",
      statusListIndex: "42",
      statusListCredential: "http://example.com/revocation-list"
    }
    const kycServiceProvider: KYCAMLProvider = {
      "@type": "KYCAMLProvider",
      name: "Some Service",
      score: 200
    }
    const fulfillment = await buildAndSignKycAmlFulfillment(
      issuer,
      acceptedApplication,
      revocationList,
      kycAmlAttestation([kycServiceProvider])
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
        expect(credentialSubject.KYCAMLAttestation.serviceProviders).toEqual([
          kycServiceProvider
        ])

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
