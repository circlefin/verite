import { randomBytes } from "crypto"
import nock from "nock"

import { CredentialPayloadBuilder } from "../../lib"
import {
  composeCredentialApplicationJWT,
  composeCredentialResponseJWT,
  validateCredentialApplicationJWTForManifest,
  validateCredentialResponseJWT
} from "../../lib/issuer"
import {
  buildSampleProcessApprovalManifest,
  KYCAML_CREDENTIAL_TYPE_NAME
} from "../../lib/sample-data"
import { signVerifiableCredentialJWT } from "../../lib/utils/credentials"
import { buildSignerFromDidKey, randomDidKey } from "../../lib/utils/did-fns"
import {
  AttestationTypes,
  Signer,
  RevocableCredential,
  DidKey
} from "../../types"
import { kycAmlAttestationFixture } from "../fixtures/attestations"
import { KYC_VC_SCHEMA } from "../fixtures/credentials"
import { revocationListFixture } from "../fixtures/revocation-list"

let issuerDidKey: DidKey
let issuerSigner: Signer
let subjectSigner: Signer

beforeEach(() => {
  /**
   * Create a DID for both the issuer and the subject for this test. In the
   * real world, this would be done separately on the issuer side and the
   * subject side. For example, the subject's identity wallet could generate
   * the DID for them.
   */
  issuerDidKey = randomDidKey(randomBytes)
  const subjectDidKey = randomDidKey(randomBytes)
  issuerSigner = buildSignerFromDidKey(issuerDidKey)
  subjectSigner = buildSignerFromDidKey(subjectDidKey)
})

describe("E2E issuance", () => {
  it("issues verified credentails", async () => {
    /**
     * The issuer generates a QR code for the subject to scan, depending on
     * the type of credential they are issuing. In this case, it's a KYC/AML
     * credential.
     */
    const manifest = buildSampleProcessApprovalManifest(
      AttestationTypes.KYCAMLAttestation,
      {
        id: issuerSigner.did,
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
    const encodedApplication = await composeCredentialApplicationJWT(
      manifest,
      subjectSigner
    )

    /**
     * The client sends the Credential Application to the issuer.
     */

    /**
     * The issuer evaluates and decodes the Credential Application.
     * Note that the issuer may not know the manifest before decoding it,
     * in which case the issuer can call the functions wrapped by
     * evaluateCredentialApplication:
     * 1. decodeAndVerifyCredentialApplicationJwt
     * 2. validateCredentialApplication
     */
    const decodedApplication =
      await validateCredentialApplicationJWTForManifest(
        encodedApplication,
        manifest
      )

    /**
     * If the Credential Application is valid, then the issuer would issue a
     * credential to the subject. The issuer extracts the necessary information
     * from the Credential Application before issuing the credential.
     */
    const applicantDid = decodedApplication.credential_application.applicant
    const applicationId = decodedApplication.credential_application.id
    /**
     * Verite libraries allow high- and low-level methods. Compose
     * methods call build* and sign* methods.
     */
    const vc = new CredentialPayloadBuilder()
      .issuer(issuerSigner.did)
      .attestations(applicantDid, kycAmlAttestationFixture)
      .type(KYCAML_CREDENTIAL_TYPE_NAME)
      .credentialSchema(KYC_VC_SCHEMA)
      .credentialStatus(revocationListFixture)
      .build()
    const signedVc = await signVerifiableCredentialJWT(vc, issuerSigner)
    /**
     * The issuer wraps the signed VC in a Credential Response, and signs as a JWT
     */

    const encodedResponse = await composeCredentialResponseJWT(
      manifest,
      applicantDid,
      applicationId,
      issuerSigner,
      signedVc
    )

    /**
     * The issuer sends the Credential Response to the subject. The subject's
     * wallet can then decode and store it.
     */
    const result = await validateCredentialResponseJWT(encodedResponse)
    result.verifiableCredential?.forEach((vc) => {
      const verifiableCredential = vc as RevocableCredential
      expect(verifiableCredential.type).toEqual([
        "VerifiableCredential",
        "KYCAMLCredential"
      ])
      expect(verifiableCredential.proof).toBeDefined()

      const credentialSubject = verifiableCredential.credentialSubject
      expect(credentialSubject.id).toEqual(applicantDid)

      const credentialStatus = verifiableCredential.credentialStatus!
      expect(credentialStatus.id).toEqual(
        "http://example.com/revocation-list#42"
      )
      expect(credentialStatus.type).toEqual("StatusList2021Entry")
      expect(credentialStatus.statusPurpose).toEqual("revocation")
      expect(credentialStatus.statusListIndex).toEqual("42")
      expect(credentialStatus.statusListCredential).toEqual(
        "http://example.com/revocation-list"
      )
    })
  })

  it("issues credentials using did:web", async () => {
    /**
     * The issuer and the client get a DID
     */
    const didWeb = "did:web:example.com"
    const publicKey = Buffer.from(issuerDidKey.publicKey).toString("base64")

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
    const credentialIssuer = {
      id: issuerSigner.did,
      name: "Example Issuer"
    }
    const manifest = buildSampleProcessApprovalManifest(
      AttestationTypes.KYCAMLAttestation,
      credentialIssuer
    )

    /**
     * The client scans the QR code and generates a credential application
     */
    const encodedApplication = await composeCredentialApplicationJWT(
      manifest,
      subjectSigner
    )

    /**
     * The issuer validates the credential application
     */
    const decodedApplication =
      await validateCredentialApplicationJWTForManifest(
        encodedApplication,
        manifest
      )
    const applicantDid = decodedApplication.credential_application.applicant
    const applicationId = decodedApplication.credential_application.id
    /**
     * The issuer builds and signs a verifiable credential
     */

    const vc = new CredentialPayloadBuilder()
      .issuer(issuerSigner.did)
      .attestations(applicantDid, kycAmlAttestationFixture)
      .type(KYCAML_CREDENTIAL_TYPE_NAME)
      .credentialSchema(KYC_VC_SCHEMA)
      .credentialStatus(revocationListFixture)
      .build()

    const signedVc = await signVerifiableCredentialJWT(vc, issuerSigner)

    /**
     * The issuer builds and signs a response
     */
    const encodedResponse = await composeCredentialResponseJWT(
      manifest,
      applicantDid,
      applicationId,
      issuerSigner,
      signedVc
    )

    const result = await validateCredentialResponseJWT(encodedResponse)

    result.verifiableCredential!.forEach((vc) => {
      const verifiableCredential = vc as RevocableCredential
      expect(verifiableCredential.type).toEqual([
        "VerifiableCredential",
        "KYCAMLCredential"
      ])
      expect(verifiableCredential.proof).toBeDefined()

      const credentialSubject = verifiableCredential.credentialSubject
      expect(credentialSubject.id).toEqual(applicantDid)

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
    })
  })
})
