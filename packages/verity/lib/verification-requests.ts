import { compact } from "lodash"
import { v4 as uuidv4 } from "uuid"
import { InputDescriptorConstraintStatusDirective } from "../types"
import type { PresentationDefinition, VerificationRequest } from "../types"

const ONE_MONTH = 1000 * 60 * 60 * 24 * 30
const KYC_PRESENTATION_DEFINITION_ID = "KYCAMLPresentationDefinition"

export const kycPresentationDefinition: PresentationDefinition = {
  id: KYC_PRESENTATION_DEFINITION_ID,
  input_descriptors: [
    {
      id: "kycaml_input",
      name: "Proof of KYC",
      purpose: "Please provide a valid credential from a KYC/AML issuer",
      schema: [
        {
          uri: "https://verity.id/schemas/identity/1.0.0/KYCAMLAttestation",
          required: true
        }
      ],
      constraints: {
        statuses: {
          active: {
            directive: InputDescriptorConstraintStatusDirective.REQUIRED
          }
        },
        fields: [
          {
            path: ["$.issuer", "$.vc.issuer", "$.iss", "$.issuer.id"],
            purpose:
              "We can only verify KYC credentials attested by a trusted authority.",
            filter: {
              type: "string",
              pattern: compact([
                "did:web:verity.id",
                "did:web:coinbase.com"
                // TODO: Include local issuer DID (make customizable)
              ]).join("|")
            }
          }
        ]
      }
    }
  ]
}

// TODO(kim)
export const generateKycVerificationRequest = (
  from: string,
  replyUrl: string,
  replyTo?: string,
  callbackUrl?: string
): VerificationRequest => {
  const now = Date.now()
  const expires = now + ONE_MONTH
  const id = uuidv4()

  return {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://identity.foundation/presentation-exchange/definition/v1"
    ],
    type: ["VerifiablePresentation", "PresentationDefinition"],
    request: {
      id,
      from: from,
      created_time: now,
      expires_time: expires,
      reply_url: replyUrl,
      reply_to: [replyTo || from],
      callback_url: callbackUrl,
      challenge: "e1b35ae0-9e0e-11ea-9bbf-a387b27c9e61" // TODO: Challenge
    },
    presentation_definition: kycPresentationDefinition
  }
}
