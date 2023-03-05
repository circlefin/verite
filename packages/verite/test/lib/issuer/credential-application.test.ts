import { randomBytes } from "crypto"

import {
  CREDENTIAL_APPLICATION_TYPE_NAME,
  signVerifiablePresentation,
  validateCredentialApplication,
  VC_CONTEXT_URI,
  VERIFIABLE_PRESENTATION_TYPE_NAME,
  VerificationError
} from "../../../lib"
import {
  buildCredentialApplication,
  composeCredentialApplication,
  decodeCredentialApplication,
  evaluateCredentialApplication
} from "../../../lib/issuer/credential-application"
import { buildKycAmlManifest } from "../../../lib/sample-data/manifests"
import { buildIssuer, randomDidKey } from "../../../lib/utils/did-fns"
import { ClaimFormat } from "../../../types"
import { generateManifestAndIssuer } from "../../support/manifest-fns"

describe("composeCredentialApplication", () => {
  it("builds a valid credential application", async () => {
    const issuerDidKey = await randomDidKey(randomBytes)
    const issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)

    // 1. CLIENT: The client gets a DID
    const clientDidKey = await randomDidKey(randomBytes)
    const credentialIssuer = { id: issuer.did, name: "Verite" }
    const kycManifest = buildKycAmlManifest(credentialIssuer)

    const credentialApplication = await composeCredentialApplication(
      clientDidKey,
      kycManifest
    )

    const application = await evaluateCredentialApplication(
      credentialApplication,
      kycManifest
    )

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

describe("validateCredentialApplication", () => {
  it("decodes the Credential Application", async () => {
    const clientDidKey = randomDidKey(randomBytes)
    const { manifest } = await generateManifestAndIssuer()
    const application = await composeCredentialApplication(
      clientDidKey,
      manifest
    )
    const decodedApplication = await decodeCredentialApplication(application)
    await validateCredentialApplication(decodedApplication, manifest)

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
              format: ClaimFormat.JwtVp,
              path: "$.holder"
            }
          ]
        }
      },
      verifiableCredential: [],
      holder: clientDidKey.subject,
      type: ["VerifiablePresentation", "CredentialApplication"]
    })
  })

  it("rejects an expired input", async () => {
    expect.assertions(1)
    const credentialIssuer = { id: "did:example:1234", name: "Verite" }
    const kycManifest = buildKycAmlManifest(credentialIssuer)

    const clientDidKey = randomDidKey(randomBytes)
    const client = buildIssuer(clientDidKey.subject, clientDidKey.privateKey)
    const expiredVc =
      "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MjYyMDgzNTIsInZjIjp7IkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiXSwiY3JlZGVudGlhbFN1YmplY3QiOnsiZGVncmVlIjp7InR5cGUiOiJCYWNoZWxvckRlZ3JlZSIsIm5hbWUiOiJCYWNjYWxhdXLDqWF0IGVuIG11c2lxdWVzIG51bcOpcmlxdWVzIn19fSwic3ViIjoiZGlkOmV0aHI6MHg0MzVkZjNlZGE1NzE1NGNmOGNmNzkyNjA3OTg4MWYyOTEyZjU0ZGI0IiwibmJmIjoxNjI2MjA4MzQyLCJpc3MiOiJkaWQ6a2V5Ono2TWtzR0toMjNtSFp6MkZwZU5ENld4SnR0ZDhUV2hrVGdhN210Yk0xeDF6TTY1bSJ9.n0Cko-LZtZjrVHMjzlMUUxB6GGkx9MlNy68nALEeh_Doj42UDZkCwF872N4pVzyqKEexAX8PxAgtqote2rHMAA"

    const vp = {
      vp: {
        "@context": [VC_CONTEXT_URI],
        type: [
          VERIFIABLE_PRESENTATION_TYPE_NAME,
          CREDENTIAL_APPLICATION_TYPE_NAME
        ],
        credential_application: {
          id: "f584577a-607f-43d9-a128-39b21f126f96",
          manifest_id: kycManifest.id,
          format: { jwt_vp: { alg: ["EdDSA"] } },
          presentation_submission: {
            id: "0a97ed30-a4a9-43fb-9564-4d65db62d4bc",
            definition_id: "ProofOfControlPresentationDefinition",
            descriptor_map: [
              {
                id: "proofOfIdentifierControlVP",
                format: ClaimFormat.JwtVp,
                path: "$.holder"
              }
            ]
          }
        },
        verifiableCredential: [expiredVc],
        holder: clientDidKey.subject
      }
    }
    const signedApplication = await signVerifiablePresentation(vp, client)

    await expect(
      await evaluateCredentialApplication(signedApplication, kycManifest)
    ).rejects.toThrowError(VerificationError)
  })
})
