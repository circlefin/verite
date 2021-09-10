import {
  validateVerificationSubmission,
  PresentationDefinition,
  decodeVerifiablePresentation
} from "@centre/verity"
import { NextApiRequest, NextApiResponse } from "next"

export default async function credentials(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  /**
   * Using Presentation Exchange, the server will challenge the client with a
   * "Presentation Request" that defines how a client can complete
   * verification. The request includes a definition, including the constraints
   * on what credentials qualify.
   *
   * For example, a credential must fit the KYCAMLAttestation schema,
   * will require an authorityId, an approvate date, and issued by
   * did:key:z6MktD288XZYEwedyKzWPpHZzoJ4k7iz5R39PtcVR4F7Lkpg
   */
  const definition: PresentationDefinition = {
    id: "KYCAMLPresentationDefinition",
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
              directive: "required"
            }
          },
          fields: [
            {
              path: [
                "$.credentialSubject.KYCAMLAttestation.authorityId",
                "$.vc.credentialSubject.KYCAMLAttestation.authorityId",
                "$.KYCAMLAttestation.authorityId"
              ],
              purpose:
                "The KYC/AML Attestation requires the field: 'authorityId'.",
              predicate: "required",
              filter: {
                type: "string"
              }
            },
            {
              path: [
                "$.credentialSubject.KYCAMLAttestation.approvalDate",
                "$.vc.credentialSubject.KYCAMLAttestation.approvalDate",
                "$.KYCAMLAttestation.approvalDate"
              ],
              purpose:
                "The KYC/AML Attestation requires the field: 'approvalDate'.",
              predicate: "required",
              filter: {
                type: "string"
              }
            },
            {
              path: ["$.issuer.id", "$.issuer", "$.vc.issuer", "$.iss"],
              purpose:
                "We can only verify credentials attested by a trusted authority.",
              filter: {
                type: "string",
                pattern:
                  "^did:key:z6MktD288XZYEwedyKzWPpHZzoJ4k7iz5R39PtcVR4F7Lkpg$"
              }
            }
          ]
        }
      }
    ]
  }

  // Perform verification.
  try {
    await validateVerificationSubmission(req.body, definition)
  } catch (e) {
    res.status(400).json({ status: "invalid" })
    throw e
  }

  res.status(200).json({ status: "ok" })
}
