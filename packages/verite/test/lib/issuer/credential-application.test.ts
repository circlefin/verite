import { randomBytes } from "crypto"

import {
  composeCredentialApplicationJWT,
  validateCredentialApplicationForManifest,
  VerificationError
} from "../../../lib"
import {
  decodeCredentialApplicationJWT,
  validateCredentialApplicationJWTForManifest
} from "../../../lib/issuer/credential-application"
import { buildSampleProcessApprovalManifest } from "../../../lib/sample-data/manifests"
import { buildSignerFromDidKey, randomDidKey } from "../../../lib/utils/did-fns"
import {
  AttestationTypes,
  CredentialIssuer,
  DidKey,
  Signer
} from "../../../types"

let subjectDidKey: DidKey
let issuerDidKey: DidKey
let credentialIssuer: CredentialIssuer
let subjectSigner: Signer

beforeEach(() => {
  subjectDidKey = randomDidKey(randomBytes)
  issuerDidKey = randomDidKey(randomBytes)
  credentialIssuer = { id: issuerDidKey.controller, name: "Verite" }
  subjectSigner = buildSignerFromDidKey(subjectDidKey)
})

describe("composeCredentialApplication", () => {
  it("builds a valid KYCAML credential application", async () => {
    const kycManifest = buildSampleProcessApprovalManifest(
      AttestationTypes.KYCAMLAttestation,
      credentialIssuer
    )

    const credentialApplication = await composeCredentialApplicationJWT(
      kycManifest,
      subjectSigner
    )

    const application = await validateCredentialApplicationJWTForManifest(
      credentialApplication,
      kycManifest
    )
    expect(application).toBeDefined()

    expect(application.credential_application.manifest_id).toEqual(
      "KYCAMLManifest"
    )
  })
})

describe("decodeCredentialApplication", () => {
  it("decodes the Credential Application", async () => {
    const kycManifest = buildSampleProcessApprovalManifest(
      AttestationTypes.KYCAMLAttestation,
      credentialIssuer
    )

    const application = await composeCredentialApplicationJWT(
      kycManifest,
      subjectSigner
    )
    // This variant first decodes the JWT, which is useful if the manifest
    // id is not yet known
    const decodedApplication = await decodeCredentialApplicationJWT(application)
    await validateCredentialApplicationForManifest(
      decodedApplication,
      kycManifest
    )

    expect(decodedApplication).toMatchObject({
      credential_application: {
        // id: 'f584577a-607f-43d9-a128-39b21f126f96', client-generated unique identifier
        manifest_id: "KYCAMLManifest",
        format: { jwt_vc: { alg: ["EdDSA"] } }
      }
    })
  })

  it("rejects a credential application with expired input", async () => {
    const kycManifest = buildSampleProcessApprovalManifest(
      AttestationTypes.KYCAMLAttestation,
      credentialIssuer
    )

    const expiredVc =
      "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MjYyMDgzNTIsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiZGVncmVlIjp7InR5cGUiOiJCYWNoZWxvckRlZ3JlZSIsIm5hbWUiOiJCYWNjYWxhdXLDqWF0IGVuIG11c2lxdWVzIG51bcOpcmlxdWVzIn19fSwic3ViIjoiZGlkOmV0aHI6MHg0MzVkZjNlZGE1NzE1NGNmOGNmNzkyNjA3OTg4MWYyOTEyZjU0ZGI0IiwibmJmIjoxNjI2MjA4MzQyLCJpc3MiOiJkaWQ6a2V5Ono2TWtzR0toMjNtSFp6MkZwZU5ENld4SnR0ZDhUV2hrVGdhN210Yk0xeDF6TTY1bSJ9.n0Cko-LZtZjrVHMjzlMUUxB6GGkx9MlNy68nALEeh_Doj42UDZkCwF872N4pVzyqKEexAX8PxAgtqote2rHMAA"

    const application = await composeCredentialApplicationJWT(
      kycManifest,
      subjectSigner,
      expiredVc
    )

    expect.assertions(1)
    await expect(
      validateCredentialApplicationJWTForManifest(application, kycManifest)
    ).rejects.toThrowError(VerificationError)
  })
})
