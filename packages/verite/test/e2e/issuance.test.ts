import { randomBytes } from "crypto"
import nock from "nock"

import {
  composeCredentialApplication,
  composeCredentialFulfillment,
  composeVerifiableCredential,
  evaluateCredentialApplication
} from "../../lib/issuer"
import {
  buildSampleProcessApprovalManifest,
  KYCAML_CREDENTIAL_TYPE_NAME
} from "../../lib/sample-data"
import { verifyVerifiablePresentation } from "../../lib/utils/credentials"
import { buildIssuer, randomDidKey } from "../../lib/utils/did-fns"
import { validateCredentialApplication } from "../../lib/validators/validate-credential-application"
import {
  AttestationTypes,
  DecodedCredentialApplication,
  RevocableCredential,
  RevocablePresentation
} from "../../types"
import { kycAmlAttestationFixture } from "../fixtures/attestations"
import { KYC_VC_SCHEMA } from "../fixtures/credentials"
import { revocationListFixture } from "../fixtures/revocation-list"

describe("E2E issuance", () => {
  it("issues verified credentails", async () => {
    /**
     * Create a DID for both the issuer and the subject for this test. In the
     * real world, this would be done separately on the issuer side and the
     * subject side. For example, the subject's identity wallet could generate
     * the DID for them.
     */
    const issuerDidKey = randomDidKey(randomBytes)
    const issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)
    const subjectDidKey = randomDidKey(randomBytes)

    /**
     * The issuer generates a QR code for the subject to scan, depending on
     * the type of credential they are issuing. In this case, it's a KYC/AML
     * credential.
     */
    const manifest = buildSampleProcessApprovalManifest(
      AttestationTypes.KYCAMLAttestation,
      {
        id: issuer.did,
        name: "Verite"
      }
    )

    /**
     * The issuer makes the manifest available to the subject. In this case,
     * we're assuming the issuer displays a QR code for the subject to scan.
     *
     * The subject scans the QR code with their wallet, which retrieves the
     * manifest.
     */

    /**
     * The wallet code calls composeCredentialApplication to build and
     * sign Credential Application.
     */
    const encodedApplication = await composeCredentialApplication(
      subjectDidKey,
      manifest
    )

    /**
     * The client sends the Credential Application to the issuer.
     */

    /**
     * The issuer evaluates the Credential Application
     */
    await evaluateCredentialApplication(encodedApplication, manifest)

    /**
     * In general, the issuer would extract data from the Credential
     * Application. If the Credential Application is valid, then the
     * issuer would issue a credential to the subject.
     *
     * Verite libraries allow high- and low-level methods. Compose
     * methods call build* and sign* methods.
     */
    const vc = await composeVerifiableCredential(
      issuer,
      subjectDidKey.subject,
      kycAmlAttestationFixture,
      KYCAML_CREDENTIAL_TYPE_NAME,
      {
        credentialSchema: KYC_VC_SCHEMA,
        credentialStatus: revocationListFixture
      }
    )
    /**
     * The issuer wraps the signed VC in a Credential Fulfillment, which
     * is a signed VP
     */
    const fulfillment = await composeCredentialFulfillment(issuer, manifest, vc)

    /**
     * The issuer sends the Credential Fulfillment to the subject. The subject's
     * wallet can then verify the VP and store it.
     */

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
        expect(credentialSubject.id).toEqual(subjectDidKey.subject)

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
      .times(2)
      .reply(200, JSON.stringify(didDocument))

    /**
     * The issuer generates a QR code for the client to scan
     */
    const credentialIssuer = { id: issuer.did, name: "Example Issuer" }
    const manifest = buildSampleProcessApprovalManifest(
      AttestationTypes.KYCAMLAttestation,
      credentialIssuer
    )

    /**
     * The client scans the QR code and generates a credential application
     */
    const encodedApplication = await composeCredentialApplication(
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
    const vc = await composeVerifiableCredential(
      issuer,
      clientDidKey.subject,
      kycAmlAttestationFixture,
      KYCAML_CREDENTIAL_TYPE_NAME,
      {
        credentialSchema: KYC_VC_SCHEMA,
        credentialStatus: revocationListFixture
      }
    )

    /**
     * The issuer builds and signs a fulfillment
     */
    const fulfillment = await composeCredentialFulfillment(issuer, manifest, vc)

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
