import { kycAmlPresentationDefinition } from "../../../lib/utils/sample-data/presentation-definitions"

describe("kycPresentationDefinition", () => {
  it("builds the Credential Definitions with no requirement on the issuer", () => {
    const definitions = kycAmlPresentationDefinition()

    expect(definitions).toEqual({
      id: "KYCAMLPresentationDefinition",
      input_descriptors: [
        {
          constraints: {
            fields: [
              {
                filter: {
                  type: "string"
                },
                path: [
                  "$.credentialSubject.KYCAMLAttestation.process",
                  "$.vc.credentialSubject.KYCAMLAttestation.process",
                  "$.KYCAMLAttestation.process"
                ],
                predicate: "required",
                purpose:
                  "The Attestation must contain the field: 'process'."
              },
              {
                filter: {
                  type: "string"
                },
                path: [
                  "$.credentialSubject.KYCAMLAttestation.approvalDate",
                  "$.vc.credentialSubject.KYCAMLAttestation.approvalDate",
                  "$.KYCAMLAttestation.approvalDate"
                ],
                predicate: "required",
                purpose:
                  "The Attestation must contain the field: 'approvalDate'."
              },
              {
                id: "subjectId",
                path: [
                  "$.credentialSubject.id",
                  "$.vc.credentialSubject.id",
                  "$.id"
                ],
                purpose:
                  "We need to ensure the holder and the subject have the same identifier"
              },
              {
                id: "credentialSchema",
                path: ["$.credentialSchema.id", "$.vc.credentialSchema.id"],
                filter: {
                  type: "string",
                  pattern:
                    "https://verite.id/definitions/schemas/0.0.1/KYCAMLAttestation"
                },
                purpose:
                  "We need to ensure the credential conforms to the expected schema"
              }
            ],
            is_holder: [
              {
                directive: "required",
                field_id: ["subjectId"]
              }
            ],
            statuses: {
              active: {
                directive: "required"
              }
            }
          },
          id: "KYCAMLCredential",
          name: "Proof of KYC",
          purpose: "Please provide a valid credential from a KYC/AML issuer",
          format: {
            jwt_vp: {
              alg: ["EdDSA"]
            },
            jwt_vc: {
              alg: ["EdDSA"]
            }
          }
        }
      ]
    })
  })

  it("allows you to customize the list of trusted issuers", () => {
    // Example where you might only want to accept credentials issued by
    // did:web:centre.io or did:web:example.com
    const definitions = kycAmlPresentationDefinition([
      "did:web:centre.io",
      "did:web:example.com"
    ])

    expect(definitions).toEqual({
      id: "KYCAMLPresentationDefinition",
      input_descriptors: [
        {
          constraints: {
            fields: [
              {
                filter: {
                  type: "string"
                },
                path: [
                  "$.credentialSubject.KYCAMLAttestation.process",
                  "$.vc.credentialSubject.KYCAMLAttestation.process",
                  "$.KYCAMLAttestation.process"
                ],
                predicate: "required",
                purpose:
                  "The Attestation must contain the field: 'process'."
              },
              {
                filter: {
                  type: "string"
                },
                path: [
                  "$.credentialSubject.KYCAMLAttestation.approvalDate",
                  "$.vc.credentialSubject.KYCAMLAttestation.approvalDate",
                  "$.KYCAMLAttestation.approvalDate"
                ],
                predicate: "required",
                purpose:
                  "The Attestation must contain the field: 'approvalDate'."
              },
              {
                id: "subjectId",
                path: [
                  "$.credentialSubject.id",
                  "$.vc.credentialSubject.id",
                  "$.id"
                ],
                purpose:
                  "We need to ensure the holder and the subject have the same identifier"
              },
              {
                id: "credentialSchema",
                path: ["$.credentialSchema.id", "$.vc.credentialSchema.id"],
                filter: {
                  type: "string",
                  pattern:
                    "https://verite.id/definitions/schemas/0.0.1/KYCAMLAttestation"
                },
                purpose:
                  "We need to ensure the credential conforms to the expected schema"
              },
              {
                filter: {
                  pattern: "^did:web:centre.io$|^did:web:example.com$",
                  type: "string"
                },
                path: ["$.issuer.id", "$.issuer", "$.vc.issuer", "$.iss"],
                purpose:
                  "We can only verify credentials attested by a trusted authority."
              }
            ],
            is_holder: [
              {
                directive: "required",
                field_id: ["subjectId"]
              }
            ],
            statuses: {
              active: {
                directive: "required"
              }
            }
          },
          id: "KYCAMLCredential",
          name: "Proof of KYC",
          purpose: "Please provide a valid credential from a KYC/AML issuer",
          format: {
            jwt_vp: {
              alg: ["EdDSA"]
            },
            jwt_vc: {
              alg: ["EdDSA"]
            }
          }
        }
      ]
    })
  })
})
