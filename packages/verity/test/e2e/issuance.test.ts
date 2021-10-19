import nock from "nock"
import {
  buildCredentialApplication,
  decodeCredentialApplication
} from "../../lib/issuer/credential-application"
import { buildAndSignFulfillment } from "../../lib/issuer/fulfillment"
import { createKycAmlManifest } from "../../lib/issuer/manifest"
import { decodeVerifiablePresentation } from "../../lib/utils/credentials"
import { buildIssuer, randomDidKey } from "../../lib/utils/did-fns"
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
    const issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)
    const clientDidKey = randomDidKey()

    /**
     * The issuer generates a QR code for the client to scan
     */
    const credentialIssuer = { id: issuer.did, name: "Example Issuer" }
    const manifest = createKycAmlManifest(credentialIssuer)

    /**
     * The client scans the QR code and generates a credential application
     */
    const credentialApplication = await buildCredentialApplication(
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

  it("issues credentials using did:web", async () => {
    /**
     * The issuer and the client get a DID
     */
    const issuerDidKey = randomDidKey()
    const didWeb = "did:web:example.com"
    const issuer = buildIssuer("did:web:example.com", issuerDidKey.privateKey)
    const publicKey = Buffer.from(issuerDidKey.publicKey).toString("base64")

    const clientDidKey = randomDidKey()

    const didDocument = {
      "@context": [
        "https://www.w3.org/ns/did/v1",
        "https://w3id.org/security/suites/ed25519-2018/v1"
      ],
      id: didWeb,
      verificationMethod: [
        {
          id: `${didWeb}#${publicKey}`,
          type: "Ed25519VerificationKey2018",
          controller: didWeb,
          publicKeyBase64: publicKey
        }
      ],
      authentication: [`${didWeb}#${publicKey}`]
    }

    // stub out the https request for a did document
    nock("https://example.com")
      .get("/.well-known/did.json")
      .times(0)
      .reply(200, JSON.stringify(didDocument))

    /**
     * The issuer generates a QR code for the client to scan
     */
    const credentialIssuer = { id: issuer.did, name: "Example Issuer" }
    const manifest = createKycAmlManifest(credentialIssuer)

    /**
     * The client scans the QR code and generates a credential application
     */
    const credentialApplication = await buildCredentialApplication(
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
