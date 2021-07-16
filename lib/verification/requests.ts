import { v4 as uuidv4 } from "uuid"

const ONE_MONTH = 1000 * 60 * 60 * 24 * 30

export const kycVerificationRequest = () => {
  const now = Date.now()
  const expires = now + ONE_MONTH

  return {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://identity.foundation/presentation-exchange/definition/v1"
    ],
    type: ["VerifiablePresentation", "PresentationDefinition"],
    request: {
      id: uuidv4(),
      from: process.env.VERIFIER_DID,
      created_time: now,
      expires_time: expires,
      reply_url: `${process.env.HOST}/api/verification/responses`,
      reply_to: [process.env.VERIFIER_DID],
      callback_url: `${process.env.HOST}/api/verification/callback`,
      challenge: "e1b35ae0-9e0e-11ea-9bbf-a387b27c9e61" // TODO: Challenge
    },
    presentation_definition: {
      id: uuidv4(),
      input_descriptors: [
        {
          id: "kycaml_input",
          name: "Proof of KYC",
          purpose: "Please provide a valid credential from a KYC/AML issuer",
          schema: [
            {
              uri: "https://verity.id/identity/KYCAMLAttestation.json",
              required: true
            }
          ],
          constraints: {
            statuses: {
              active: {
                directive: "required"
              }
            },
            fields: [
              {
                path: ["$.issuer", "$.vc.issuer", "$.iss"],
                purpose:
                  "We can only verify KYC credentials attested by a trusted authority.",
                filter: {
                  type: "string",
                  pattern: "did:web:verity.id|did:web:coinbase.com"
                }
              }
            ]
          }
        }
      ]
    }
  }
}
