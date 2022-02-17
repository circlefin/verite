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
      // "created_time": "2021-11-10T18:35:08.367Z",
      // "expires_time": "2021-12-10T18:35:08.367Z",
      from: from,
      id: id,
      reply_url: replyUrl,
      type: "VerificationRequest",
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
                  uri: "https://demos.verite.id/schemas/identity/1.0.0/KYCAMLAttestation"
                }
              ]
            }
          ]
        }
      }
    })
  })
})
