import { buildKycVerificationOffer } from "../../../lib/verifier/verification-offer"

describe("verification offer", () => {
  it("builds a Verification Offer", () => {
    const id = "c1cb4dcc-2b03-4cd1-92e8-877840a07d51"
    const from = "did:web:example.com"
    const replyUrl = "https://example.com/123"
    const statusUrl = "https://example.com/status/123"
    const trustedAuthorities: string[] = ["did:web:centre.io"]

    const offer = buildKycVerificationOffer(
      id,
      from,
      replyUrl,
      statusUrl,
      trustedAuthorities
    )

    expect(offer).toMatchObject({
      // "created_time": 1636569308367,
      // "expires_time": 1639161308367,
      from: from,
      id: id,
      reply_url: replyUrl,
      type: "https://verity.id/types/VerificationRequest",
      body: {
        // challenge: "cf282c9c-ae5f-4b7e-866d-960e95764afe",
        presentation_definition: {
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
                      "$.credentialSubject.KYCAMLAttestation.authorityId",
                      "$.vc.credentialSubject.KYCAMLAttestation.authorityId",
                      "$.KYCAMLAttestation.authorityId"
                    ],
                    predicate: "required",
                    purpose:
                      "The KYC/AML Attestation requires the field: 'authorityId'."
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
                      pattern: "^did:web:centre.io$",
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
              purpose:
                "Please provide a valid credential from a KYC/AML issuer",
              schema: [
                {
                  required: true,
                  uri: "https://verity.id/schemas/identity/1.0.0/KYCAMLAttestation"
                }
              ]
            }
          ]
        }
      }
    })
  })
})
