import { randomBytes } from "crypto"

import {
  buildHybridManifest,
  buildSampleProcessApprovalManifest
} from "../../../lib"
import {
  composeCredentialResponseJWT,
  validateCredentialResponseJWT
} from "../../../lib/issuer"
import {
  buildCreditScoreVC,
  buildProcessApprovalVC
} from "../../../lib/sample-data/verifiable-credentials"
import { buildSignerFromDidKey, randomDidKey } from "../../../lib/utils"
import { AttestationTypes, CredentialIssuer, Signer } from "../../../types"
import { revocationListFixture } from "../../fixtures/revocation-list"

let subjectDid: string
let issuerDid: string
let credentialIssuer: CredentialIssuer
let issuerSigner: Signer

beforeEach(() => {
  const subjectDidKey = randomDidKey(randomBytes)
  const issuerDidKey = randomDidKey(randomBytes)
  issuerSigner = buildSignerFromDidKey(issuerDidKey)
  credentialIssuer = { id: issuerDid, name: "Verite" }
  subjectDid = subjectDidKey.subject
  issuerDid = issuerDidKey.subject
})

describe("composeCredentialResponse", () => {
  it("works", async () => {
    const manifest = buildSampleProcessApprovalManifest(
      AttestationTypes.KYCAMLAttestation,
      credentialIssuer
    )

    const vc = await buildProcessApprovalVC(
      AttestationTypes.KYCAMLAttestation,
      issuerSigner,
      subjectDid,
      revocationListFixture
    )

    const encodedResponse = await composeCredentialResponseJWT(
      manifest,
      subjectDid,
      "5f22f1ea-0441-4041-916b-2504a2a4075c",
      issuerSigner,
      vc
    )

    // The subject can then decode the presentation
    const response = await validateCredentialResponseJWT(encodedResponse)

    // The response looks like this:
    expect(response).toMatchObject({
      credential_response: {
        // id: "5f22f1ea-0441-4041-916b-2504a2a4075c",
        manifest_id: "KYCAMLManifest",
        fulfillment: {
          descriptor_map: [
            {
              id: "KYCAMLCredential",
              format: "jwt_vc",
              path: "$.verifiableCredential[0]"
            }
          ]
        }
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
            id: subjectDid
          },
          issuer: {
            id: issuerDid
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
      ]
    })
  })

  it("builds and signs response with multiple VCs", async () => {
    const manifest = buildHybridManifest(
      [
        AttestationTypes.KYCAMLAttestation,
        AttestationTypes.CreditScoreAttestation
      ],
      credentialIssuer
    )

    const vc1 = await buildProcessApprovalVC(
      AttestationTypes.KYCAMLAttestation,
      issuerSigner,
      subjectDid,
      revocationListFixture
    )
    const vc2 = await buildCreditScoreVC(
      issuerSigner,
      subjectDid,
      700,
      revocationListFixture
    )

    const creds = [vc1, vc2]

    const encodedResponse = await composeCredentialResponseJWT(
      manifest,
      subjectDid,
      "5f22f1ea-0441-4041-916b-2504a2a4075c",
      issuerSigner,
      creds
    )

    // The client can then decode the presentation
    // The subject can then decode the presentation
    const response = await validateCredentialResponseJWT(encodedResponse)

    expect(response).toMatchObject({
      credential_response: {
        manifest_id: "Verite Hybrid Manifest",
        fulfillment: {
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
        }
      },
      verifiableCredential: [
        {
          credentialSubject: {
            id: subjectDid,
            KYCAMLAttestation: {
              type: "KYCAMLAttestation",
              process:
                "https://verite.id/definitions/processes/kycaml/0.0.1/usa"
            }
          },
          issuer: {
            id: issuerDid
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
          credentialSubject: {
            id: subjectDid,
            CreditScoreAttestation: {
              type: "CreditScoreAttestation",
              score: 700,
              scoreType: "Credit Score",
              provider: "Experian"
            }
          },
          issuer: {
            id: issuerDid
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
