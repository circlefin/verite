import { kycPresentationDefinition } from "../../../lib/verifier/presentation-definitions"

describe("kycPresentationDefinition", () => {
  it("builds the Credential Definitions with no requirement on the issuer", () => {
    const definitions = kycPresentationDefinition()

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
                  "The KYC/AML Attestation requires the field: 'process'."
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
                  "The KYC/AML Attestation requires the field: 'approvalDate'."
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
          id: "kycaml_input",
          name: "Proof of KYC",
          purpose: "Please provide a valid credential from a KYC/AML issuer",
          schema: [
            {
              required: true,
              uri: "https://verite.id/definitions/schemas/0.0.1/KYCAMLAttestation"
            }
          ]
        }
      ]
    })
  })

  it("allows you to customize the list of trusted issuers", () => {
    // Example where you might only want to accept credentials issued by
    // did:web:centre.io or did:web:example.com
    const definitions = kycPresentationDefinition([
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
                  "The KYC/AML Attestation requires the field: 'process'."
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
                  "The KYC/AML Attestation requires the field: 'approvalDate'."
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
          id: "kycaml_input",
          name: "Proof of KYC",
          purpose: "Please provide a valid credential from a KYC/AML issuer",
          schema: [
            {
              required: true,
              uri: "https://verite.id/definitions/schemas/0.0.1/KYCAMLAttestation"
            }
          ]
        }
      ]
    })
  })
})
