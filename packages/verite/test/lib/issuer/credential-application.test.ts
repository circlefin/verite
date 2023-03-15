import { randomBytes } from "crypto"

import { validateCredentialApplication, VerificationError } from "../../../lib"
import {
  composeCredentialApplication,
  decodeCredentialApplication,
  evaluateCredentialApplication
} from "../../../lib/issuer/credential-application"
import { buildSampleProcessApprovalManifest } from "../../../lib/sample-data/manifests"
import { buildIssuer, randomDidKey } from "../../../lib/utils/did-fns"
import {
  AttestationTypes,
  CredentialIssuer,
  DidKey,
  Issuer
} from "../../../types"

let subjectDidKey: DidKey
let issuerDidKey: DidKey
let issuer: Issuer
let credentialIssuer: CredentialIssuer

beforeEach(() => {
  subjectDidKey = randomDidKey(randomBytes)
  issuerDidKey = randomDidKey(randomBytes)
  issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)
  credentialIssuer = { id: issuer.did, name: "Verite" }
})

describe("composeCredentialApplication", () => {
  it("builds a valid KYCAML credential application", async () => {
    const kycManifest = buildSampleProcessApprovalManifest(
      AttestationTypes.KYCAMLAttestation,
      credentialIssuer
    )

    const credentialApplication = await composeCredentialApplication(
      subjectDidKey,
      kycManifest
    )

    const application = await evaluateCredentialApplication(
      credentialApplication,
      kycManifest
    )
    expect(application).toBeDefined()

    expect(application.credential_application.manifest_id).toEqual(
      "KYCAMLManifest"
    )
    expect(
      application.credential_application.presentation_submission
    ).toBeDefined()
    expect(
      application.credential_application.presentation_submission?.definition_id
    ).toEqual(kycManifest.presentation_definition?.id)
  })
})

describe("decodeCredentialApplication", () => {
  it("decodes the Credential Application", async () => {
    const kycManifest = buildSampleProcessApprovalManifest(
      AttestationTypes.KYCAMLAttestation,
      credentialIssuer
    )

    const application = await composeCredentialApplication(
      subjectDidKey,
      kycManifest
    )
    const decodedApplication = await decodeCredentialApplication(application)
    await validateCredentialApplication(decodedApplication, kycManifest)

    expect(decodedApplication).toMatchObject({
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      credential_application: {
        // id: 'f584577a-607f-43d9-a128-39b21f126f96', client-generated unique identifier
        manifest_id: "KYCAMLManifest",
        format: { jwt_vp: { alg: ["EdDSA"] } },
        presentation_submission: {
          // id: '0a97ed30-a4a9-43fb-9564-4d65db62d4bc', client-generated unique identifier
          definition_id: "ProofOfControlPresentationDefinition",
          descriptor_map: [
            {
              id: "proofOfIdentifierControlVP",
              format: "jwt_vp",
              path: "$.holder"
            }
          ]
        }
      },
      verifiableCredential: [],
      holder: subjectDidKey.subject,
      type: ["VerifiablePresentation", "CredentialApplication"]
    })
  })

  it("rejects a credential application with expired input", async () => {
    const kycManifest = buildSampleProcessApprovalManifest(
      AttestationTypes.KYCAMLAttestation,
      credentialIssuer
    )

    const expiredVc =
      "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MjYyMDgzNTIsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiZGVncmVlIjp7InR5cGUiOiJCYWNoZWxvckRlZ3JlZSIsIm5hbWUiOiJCYWNjYWxhdXLDqWF0IGVuIG11c2lxdWVzIG51bcOpcmlxdWVzIn19fSwic3ViIjoiZGlkOmV0aHI6MHg0MzVkZjNlZGE1NzE1NGNmOGNmNzkyNjA3OTg4MWYyOTEyZjU0ZGI0IiwibmJmIjoxNjI2MjA4MzQyLCJpc3MiOiJkaWQ6a2V5Ono2TWtzR0toMjNtSFp6MkZwZU5ENld4SnR0ZDhUV2hrVGdhN210Yk0xeDF6TTY1bSJ9.n0Cko-LZtZjrVHMjzlMUUxB6GGkx9MlNy68nALEeh_Doj42UDZkCwF872N4pVzyqKEexAX8PxAgtqote2rHMAA"

    const application = await composeCredentialApplication(
      subjectDidKey,
      kycManifest,
      expiredVc
    )

    expect.assertions(1)
    await expect(
      evaluateCredentialApplication(application, kycManifest)
    ).rejects.toThrowError(VerificationError)
  })
})
