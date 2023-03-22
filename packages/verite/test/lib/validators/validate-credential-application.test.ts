import { randomBytes } from "crypto"

import {
  composeCredentialApplicationJWT,
  validateCredentialApplicationJWTForManifest
} from "../../../lib"
import { buildSampleProcessApprovalManifest } from "../../../lib/sample-data"
import { buildSignerFromDidKey, randomDidKey } from "../../../lib/utils/did-fns"
import {
  AttestationTypes,
  CredentialIssuer,
  DidKey,
  Signer
} from "../../../types"

let subjectDidKey: DidKey
let issuerDidKey: DidKey
let subjectSigner: Signer
let issuerSigner: Signer
let credentialIssuer: CredentialIssuer

beforeEach(() => {
  subjectDidKey = randomDidKey(randomBytes)
  issuerDidKey = randomDidKey(randomBytes)
  subjectSigner = buildSignerFromDidKey(subjectDidKey)
  issuerSigner = buildSignerFromDidKey(issuerDidKey)
  credentialIssuer = { id: issuerSigner.did, name: "Verite" }
})

describe("Credential Application validator", () => {
  it("evaluateCredentialApplication does not throw an error for a valid application", async () => {
    const kycManifest = buildSampleProcessApprovalManifest(
      AttestationTypes.KYCAMLAttestation,
      credentialIssuer
    )

    const credentialApplication = await composeCredentialApplicationJWT(
      kycManifest,
      subjectSigner
    )

    validateCredentialApplicationJWTForManifest(
      credentialApplication,
      kycManifest
    )

    await expect(
      validateCredentialApplicationJWTForManifest(
        credentialApplication,
        kycManifest
      )
    ).resolves.not.toThrowError()
  })

  it("evaluateCredentialApplication decodes the Credential Application", async () => {
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

    expect(application).toMatchObject({
      credential_application: {
        // "id": "ec2ab55f-de4a-4586-8b6c-be816978b23a",
        spec_version:
          "https://identity.foundation/credential-manifest/spec/v1.0.0/",
        format: {
          jwt_vc: {
            alg: ["EdDSA"]
          }
        },
        manifest_id: "KYCAMLManifest",
        applicant: subjectSigner.did
      }
    })
  })
})
