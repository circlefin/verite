import { randomBytes } from "crypto"

import {
  composeCredentialFulfillment,
  composeVerifiableCredential
} from "../../../lib/issuer"
import {
  buildKycAmlManifest,
  CREDIT_SCORE_CREDENTIAL_TYPE_NAME,
  KYCAML_CREDENTIAL_TYPE_NAME
} from "../../../lib/sample-data"
import {
  buildIssuer,
  verifyVerifiablePresentation,
  randomDidKey
} from "../../../lib/utils"
import {
  creditScoreAttestationFixture,
  kycAmlAttestationFixture
} from "../../fixtures/attestations"
import { KYC_ATTESTATION_SCHEMA_VC_OBJ } from "../../fixtures/credentials"
import { revocationListFixture } from "../../fixtures/revocation-list"
import { generateManifestAndIssuer } from "../../support/manifest-fns"

describe("composeFulfillmentFromAttestation", () => {
  it("works", async () => {
    const { manifest, issuer } = await generateManifestAndIssuer("kyc")
    const subjectDid = randomDidKey(randomBytes)
    const vc = await composeVerifiableCredential(
      issuer,
      subjectDid.subject,
      kycAmlAttestationFixture,
      KYCAML_CREDENTIAL_TYPE_NAME,
      { credentialSchema: KYC_ATTESTATION_SCHEMA_VC_OBJ }
    )
    const encodedFulfillment = await composeCredentialFulfillment(
      issuer,
      manifest,
      vc
    )

    // The client can then decode the presentation
    const fulfillment = await verifyVerifiablePresentation(encodedFulfillment)

    // The fulfillment looks like this:
    expect(fulfillment).toMatchObject({
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiablePresentation", "CredentialResponse"],
      holder: issuer.did,
      credential_response: {
        // id: "5f22f1ea-0441-4041-916b-2504a2a4075c",
        manifest_id: "KYCAMLManifest",
        descriptor_map: [
          {
            id: "KYCAMLCredential",
            format: "jwt_vc",
            path: "$.verifiableCredential[0]"
          }
        ]
      },
      verifiableCredential: [
        {
          credentialSubject: {
            KYCAMLAttestation: {
              type: "KYCAMLAttestation",
              process:
                "https://verite.id/definitions/processes/kycaml/0.0.1/usa"
              // approvalDate: "2021-11-12T18:56:16.508Z",
            },
            id: subjectDid.subject
          },
          issuer: {
            id: issuer.did
          },
          type: ["VerifiableCredential", "KYCAMLCredential"],
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            { "@vocab": "https://verite.id/identity/" }
          ],
          // issuanceDate: "2021-11-12T18:56:17.000Z",
          proof: {
            type: "JwtProof2020"
            // jwt: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSIsImh0dHBzOi8vdmVyaXR5LmlkL2lkZW50aXR5Il0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJLWUNBTUxBdHRlc3RhdGlvbiJdLCJjcmVkZW50aWFsU3ViamVjdCI6eyJLWUNBTUxBdHRlc3RhdGlvbiI6eyJAdHlwZSI6IktZQ0FNTEF0dGVzdGF0aW9uIiwiYXV0aG9yaXR5SWQiOiJkaWQ6d2ViOnZlcml0eS5pZCIsImFwcHJvdmFsRGF0ZSI6IjIwMjEtMTEtMTJUMTg6NTY6MTYuNTA4WiIsImF1dGhvcml0eU5hbWUiOiJWZXJpdHkiLCJhdXRob3JpdHlVcmwiOiJodHRwczovL3Zlcml0eS5pZCIsImF1dGhvcml0eUNhbGxiYWNrVXJsIjoiaHR0cHM6Ly9pZGVudGl0eS52ZXJpdHkuaWQifX19LCJzdWIiOiJkaWQ6a2V5Ono2TWtyMTJyWkx6VXNONmJxRjhqR0JYQlZtOGtLMzdxTWphRGpYa1NtUFoxcE1jYyIsIm5iZiI6MTYzNjc0MzM3NywiaXNzIjoiZGlkOmtleTp6Nk1rbTFyWFNMWFRxazFUNzRhZmZUVFNTRGU5S1RzVUdDYnFqcmpVaUVydVZQN1cifQ.7wwiJMxFB_wmB6drZlTLLE90rE_OV5CE_o48LkDVIt7hHP7d8bRtrmkNUqwU-YRXF9tL3NgEep1SA_JygrLUDg"
          }
        }
      ],
      proof: {
        type: "JwtProof2020"
        // jwt: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJ2cCI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVQcmVzZW50YXRpb24iLCJDcmVkZW50aWFsRnVsZmlsbG1lbnQiXSwiaG9sZGVyIjoiZGlkOmtleTp6Nk1rbTFyWFNMWFRxazFUNzRhZmZUVFNTRGU5S1RzVUdDYnFqcmpVaUVydVZQN1ciLCJ2ZXJpZmlhYmxlQ3JlZGVudGlhbCI6WyJleUpoYkdjaU9pSkZaRVJUUVNJc0luUjVjQ0k2SWtwWFZDSjkuZXlKMll5STZleUpBWTI5dWRHVjRkQ0k2V3lKb2RIUndjem92TDNkM2R5NTNNeTV2Y21jdk1qQXhPQzlqY21Wa1pXNTBhV0ZzY3k5Mk1TSXNJbWgwZEhCek9pOHZkbVZ5YVhSNUxtbGtMMmxrWlc1MGFYUjVJbDBzSW5SNWNHVWlPbHNpVm1WeWFXWnBZV0pzWlVOeVpXUmxiblJwWVd3aUxDSkxXVU5CVFV4QmRIUmxjM1JoZEdsdmJpSmRMQ0pqY21Wa1pXNTBhV0ZzVTNWaWFtVmpkQ0k2ZXlKTFdVTkJUVXhCZEhSbGMzUmhkR2x2YmlJNmV5SkFkSGx3WlNJNklrdFpRMEZOVEVGMGRHVnpkR0YwYVc5dUlpd2lZWFYwYUc5eWFYUjVTV1FpT2lKa2FXUTZkMlZpT25abGNtbDBlUzVwWkNJc0ltRndjSEp2ZG1Gc1JHRjBaU0k2SWpJd01qRXRNVEV0TVRKVU1UZzZOVFk2TVRZdU5UQTRXaUlzSW1GMWRHaHZjbWwwZVU1aGJXVWlPaUpXWlhKcGRIa2lMQ0poZFhSb2IzSnBkSGxWY213aU9pSm9kSFJ3Y3pvdkwzWmxjbWwwZVM1cFpDSXNJbUYxZEdodmNtbDBlVU5oYkd4aVlXTnJWWEpzSWpvaWFIUjBjSE02THk5cFpHVnVkR2wwZVM1MlpYSnBkSGt1YVdRaWZYMTlMQ0p6ZFdJaU9pSmthV1E2YTJWNU9ubzJUV3R5TVRKeVdreDZWWE5PTm1KeFJqaHFSMEpZUWxadE9HdExNemR4VFdwaFJHcFlhMU50VUZveGNFMWpZeUlzSW01aVppSTZNVFl6TmpjME16TTNOeXdpYVhOeklqb2laR2xrT210bGVUcDZOazFyYlRGeVdGTk1XRlJ4YXpGVU56UmhabVpVVkZOVFJHVTVTMVJ6VlVkRFluRnFjbXBWYVVWeWRWWlFOMWNpZlEuN3d3aUpNeEZCX3dtQjZkclpsVExMRTkwckVfT1Y1Q0VfbzQ4TGtEVkl0N2hIUDdkOGJSdHJta05VcXdVLVlSWEY5dEwzTmdFZXAxU0FfSnlnckxVRGciXX0sInN1YiI6ImRpZDprZXk6ejZNa20xclhTTFhUcWsxVDc0YWZmVFRTU0RlOUtUc1VHQ2JxanJqVWlFcnVWUDdXIiwiY3JlZGVudGlhbF9mdWxmaWxsbWVudCI6eyJpZCI6IjVmMjJmMWVhLTA0NDEtNDA0MS05MTZiLTI1MDRhMmE0MDc1YyIsIm1hbmlmZXN0X2lkIjoiS1lDQU1MQXR0ZXN0YXRpb24iLCJkZXNjcmlwdG9yX21hcCI6W3siaWQiOiJwcm9vZk9mSWRlbnRpZmllckNvbnRyb2xWUCIsImZvcm1hdCI6Imp3dF92YyIsInBhdGgiOiIkLnByZXNlbnRhdGlvbi5jcmVkZW50aWFsWzBdIn1dfSwiaXNzIjoiZGlkOmtleTp6Nk1rbTFyWFNMWFRxazFUNzRhZmZUVFNTRGU5S1RzVUdDYnFqcmpVaUVydVZQN1cifQ.T299mBMhBxfWtqvKSuGQ3tll2vLTfTJSTbMtpBduqHQdTCgbr8tQ4Pe2iXlGnCaIfw9PzNYUu3Y-44KSlEjfCg"
      }
    })
  })

  it("builds and signs a kyc/aml fulfillment", async () => {
    const issuerDidKey = await randomDidKey(randomBytes)
    const clientDidKey = await randomDidKey(randomBytes)
    const issuer = buildIssuer(issuerDidKey.subject, issuerDidKey.privateKey)
    const credentialIssuer = { id: issuer.did, name: "Verite" }
    const manifest = buildKycAmlManifest(credentialIssuer)

    const vc = await composeVerifiableCredential(
      issuer,
      clientDidKey,
      kycAmlAttestationFixture,
      KYCAML_CREDENTIAL_TYPE_NAME,
      {
        credentialSchema: KYC_ATTESTATION_SCHEMA_VC_OBJ,
        credentialStatus: revocationListFixture
      }
    )

    const encodedFulfillment = await composeCredentialFulfillment(
      issuer,
      manifest,
      vc
    )

    const fulfillment = await verifyVerifiablePresentation(encodedFulfillment)
    expect(fulfillment.credential_response).toBeDefined()
    expect(fulfillment.credential_response.manifest_id).toEqual(
      "KYCAMLManifest"
    )
  })
  it("builds and signs fulfillment with multiple VCs", async () => {
    // We need an Issuer, Credential Application, the credential claims or attestations
    // Map Issuer DID to Issuer for signing

    const subjectDid = randomDidKey(randomBytes)
    const { manifest, issuer } = await generateManifestAndIssuer("hybrid")

    const attestation1 = kycAmlAttestationFixture
    const attestation2 = creditScoreAttestationFixture

    // Builds a signed Verifiable Credential
    const vc1 = await composeVerifiableCredential(
      issuer,
      subjectDid,
      attestation1,
      KYCAML_CREDENTIAL_TYPE_NAME,
      // issuanceDate defaults to now, but for testing we will stub it out
      // Note that the did-jwt-vc library will strip out any milliseconds as
      // the JWT exp and iat properties must be in seconds.
      {
        credentialSchema: KYC_ATTESTATION_SCHEMA_VC_OBJ,
        issuanceDate: "2021-10-26T16:17:13.000Z"
      }
    )

    const vc2 = await composeVerifiableCredential(
      issuer,
      subjectDid,
      attestation2,
      CREDIT_SCORE_CREDENTIAL_TYPE_NAME,

      // issuanceDate defaults to now, but for testing we will stub it out
      // Note that the did-jwt-vc library will strip out any milliseconds as
      // the JWT exp and iat properties must be in seconds.
      {
        credentialSchema: KYC_ATTESTATION_SCHEMA_VC_OBJ,
        issuanceDate: "2021-10-26T16:17:13.000Z"
      }
    )

    const creds = [vc1, vc2]

    const encodedFulfillment = await composeCredentialFulfillment(
      issuer,
      manifest,
      creds
    )

    // The client can then decode the presentation
    const fulfillment = await verifyVerifiablePresentation(encodedFulfillment)
    expect(fulfillment).toMatchObject({
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiablePresentation", "CredentialResponse"],
      holder: issuer.did,
      credential_response: {
        manifest_id: "HybridManifest",
        descriptor_map: [
          {
            id: "KYCAMLCredential",
            format: "jwt_vc",
            path: "$.verifiableCredential[0]"
          },
          {
            id: "CreditScoreCredential",
            format: "jwt_vc",
            path: "$.verifiableCredential[1]"
          }
        ]
      },
      verifiableCredential: [
        {
          vc: {
            issuer: {
              id: issuer.did
            }
          },
          credentialSubject: {
            id: subjectDid.subject,
            KYCAMLAttestation: {
              type: "KYCAMLAttestation",
              process:
                "https://verite.id/definitions/processes/kycaml/0.0.1/usa"
            }
          },
          issuer: {
            id: issuer.did
          },
          type: ["VerifiableCredential", "KYCAMLCredential"],
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            {
              "@vocab": "https://verite.id/identity/"
            }
          ]
        },
        {
          vc: {
            issuer: {
              id: issuer.did
            }
          },
          credentialSubject: {
            id: subjectDid.subject,
            CreditScoreAttestation: {
              type: "CreditScoreAttestation",
              score: 700,
              scoreType: "Credit Score",
              provider: "Experian"
            }
          },
          issuer: {
            id: issuer.did
          },
          type: ["VerifiableCredential", "CreditScoreCredential"],
          "@context": [
            "https://www.w3.org/2018/credentials/v1",
            {
              "@vocab": "https://verite.id/identity/"
            }
          ]
        }
      ]
    })
  })
})
