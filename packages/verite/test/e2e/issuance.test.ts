import { randomBytes } from "crypto"
import nock from "nock"

import {
  buildAndSignCredentialApplication,
  buildAndSignCredentialFulfillment,
  buildAndSignVerifiableCredential,
  buildCredentialFulfillment,
  buildVerifiableCredential
} from "../../lib/issuer"
import {
  buildKycAmlManifest,
  KYCAML_CREDENTIAL_TYPE_NAME
} from "../../lib/sample-data"
import {
  signVerifiableCredential,
  signVerifiablePresentation,
  verifyVerifiablePresentation
} from "../../lib/utils/credentials"
import { buildIssuer, randomDidKey } from "../../lib/utils/did-fns"
import { validateCredentialApplication } from "../../lib/validators/validate-credential-application"
import { kycAmlAttestationFixture } from "../fixtures/attestations"
import { KYC_ATTESTATION_SCHEMA_VC_OBJ } from "../fixtures/credentials"
import { revocationListFixture } from "../fixtures/revocation-list"

import type {
  DecodedCredentialApplication,
  RevocableCredential,
  RevocablePresentation
} from "../../types"

describe("issuance", () => {
  it("issues verified credentails", async () => {
    /**
     * The issuer and the client get a DID
     */
    const issuerDidKey = randomDidKey(randomBytes)
    const issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)
    const clientDidKey = randomDidKey(randomBytes)

    /**
     * The issuer generates a QR code for the client to scan
     */
    const credentialIssuer = { id: issuer.did, name: "Verite" }
    const manifest = buildKycAmlManifest(credentialIssuer)

    /**
     * The client scans the QR code and generates a credential application
     */
    const encodedApplication = await buildAndSignCredentialApplication(
      clientDidKey,
      manifest
    )

    /**
     * The issuer validates the credential application
     */
    const credentialApplication = (await verifyVerifiablePresentation(
      encodedApplication
    )) as DecodedCredentialApplication

    await validateCredentialApplication(credentialApplication, manifest)

    const vc = await buildVerifiableCredential(
      issuer.did,
      clientDidKey.subject,
      kycAmlAttestationFixture,
      KYCAML_CREDENTIAL_TYPE_NAME,
      {
        credentialSchema: KYC_ATTESTATION_SCHEMA_VC_OBJ,
        credentialStatus: revocationListFixture
      }
    )
    const jwt = await signVerifiableCredential(vc, issuer)
    const fulfillment = await buildCredentialFulfillment(manifest, jwt)
    const signedVp = await signVerifiablePresentation(fulfillment, issuer)

    const verifiablePresentation = (await verifyVerifiablePresentation(
      signedVp
    )) as RevocablePresentation

    verifiablePresentation.verifiableCredential!.forEach(
      (verifiableCredential: RevocableCredential) => {
        expect(verifiableCredential.type).toEqual([
          "VerifiableCredential",
          "KYCAMLCredential"
        ])
        expect(verifiableCredential.proof).toBeDefined()

        const credentialSubject = verifiableCredential.credentialSubject
        expect(credentialSubject.id).toEqual(clientDidKey.subject)

        const credentialStatus = verifiableCredential.credentialStatus
        expect(credentialStatus.id).toEqual(
          "http://example.com/revocation-list#42"
        )
        expect(credentialStatus.type).toEqual("StatusList2021Entry")
        expect(credentialStatus.statusPurpose).toEqual("revocation")
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
    const issuerDidKey = randomDidKey(randomBytes)
    const didWeb = "did:web:example.com"
    const issuer = buildIssuer("did:web:example.com", issuerDidKey.privateKey)
    const publicKey = Buffer.from(issuerDidKey.publicKey).toString("base64")

    const clientDidKey = randomDidKey(randomBytes)

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
    const manifest = buildKycAmlManifest(credentialIssuer)

    /**
     * The client scans the QR code and generates a credential application
     */
    const encodedApplication = await buildAndSignCredentialApplication(
      clientDidKey,
      manifest
    )

    /**
     * The issuer validates the credential application
     */
    const credentialApplication = (await verifyVerifiablePresentation(
      encodedApplication
    )) as DecodedCredentialApplication
    await validateCredentialApplication(credentialApplication, manifest)

    /**
     * The issuer builds and signs a verifiable credential
     */
    const vc = await buildAndSignVerifiableCredential(
      issuer,
      clientDidKey.subject,
      kycAmlAttestationFixture,
      KYCAML_CREDENTIAL_TYPE_NAME,
      {
        credentialSchema: KYC_ATTESTATION_SCHEMA_VC_OBJ,
        credentialStatus: revocationListFixture
      }
    )

    /**
     * The issuer builds and signs a fulfillment
     */
    const fulfillment = await buildAndSignCredentialFulfillment(
      issuer,
      manifest,
      vc
    )

    const verifiablePresentation = (await verifyVerifiablePresentation(
      fulfillment
    )) as RevocablePresentation

    verifiablePresentation.verifiableCredential!.forEach(
      (verifiableCredential: RevocableCredential) => {
        expect(verifiableCredential.type).toEqual([
          "VerifiableCredential",
          "KYCAMLCredential"
        ])
        expect(verifiableCredential.proof).toBeDefined()

        const credentialSubject = verifiableCredential.credentialSubject
        expect(credentialSubject.id).toEqual(clientDidKey.subject)

        const credentialStatus = verifiableCredential.credentialStatus
        expect(credentialStatus.id).toEqual(
          "http://example.com/revocation-list#42"
        )
        expect(credentialStatus.type).toEqual("StatusList2021Entry")
        expect(credentialStatus.statusPurpose).toEqual("revocation")
        expect(credentialStatus.statusListIndex).toEqual("42")
        expect(credentialStatus.statusListCredential).toEqual(
          "http://example.com/revocation-list"
        )
      }
    )
  })
})
