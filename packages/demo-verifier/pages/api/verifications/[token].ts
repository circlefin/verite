import {
  generateVerificationRequest,
  PresentationDefinition,
  validateVerificationSubmission,
  verificationResult
} from "@centre/verity"
import { NextApiRequest, NextApiResponse } from "next"
import jwt from "jsonwebtoken"

export default async function credentials(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method.toLowerCase() === "get") {
    // GET request is client following the challengeTokenUrl
    await challengeTokenUrl(req, res)
  } else {
    // POST request is client trying to complete verification
    await completeVerification(req, res)
  }
}

async function challengeTokenUrl(req: NextApiRequest, res: NextApiResponse) {
  /**
   * JWT encodes the given subject address
   */
  const payload = jwt.verify(req.query.token as string, process.env.JWT_SECRET)

  /*
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
                pattern: `^${process.env.NEXT_PUBLIC_ISSUER_DID}$`
              }
            }
          ]
        }
      }
    ]
  }

  /**
   * Generate a new JWT for the final API call. This includes not only the
   * subject's address, but also the verification definition.
   */
  const token = jwt.sign({ definition }, process.env.JWT_SECRET, {
    subject: payload.sub as string,
    algorithm: "HS256",
    expiresIn: "1h"
  })

  /**
   * For demo purposes, imagine that this API method requires that a user first
   * verify their credentials. Using Presentation Exchange, we'll return a
   * Presentation Request, that instructs the client how it can complete
   * verification.
   *
   * Note that this method returns a verification request that has an identical
   * definition as shown above.
   */
  const presentationRequest = generateVerificationRequest(
    "KYCAMLAttestation", // type
    process.env.NEXT_PUBLIC_VERIFIER_DID, // verifier did
    `/api/verifications/${token}`, // replyUrl
    "/api/callback", // callbackUrl
    [process.env.NEXT_PUBLIC_ISSUER_DID] // trusted authorities
  )

  return res.status(200).json(presentationRequest)
}

async function completeVerification(req: NextApiRequest, res: NextApiResponse) {
  /**
   * JWT encodes the given subject address
   */
  const token = jwt.verify(req.query.token as string, process.env.JWT_SECRET)

  const definition = token["definition"]

  // Perform verification.
  try {
    await validateVerificationSubmission(req.body, definition)
  } catch (e) {
    res.status(400).json({ status: "invalid" })
    throw e
  }

  // Generate the verification info signature.
  const subjectAddress = token.sub as string
  const contractAddress = process.env.CONTRACT_ADDRESS
  const signer = process.env.VERIFIER_PRIVATE_KEY
  const chainId = 1337 // Hard Hat
  const result = await verificationResult(
    subjectAddress,
    contractAddress,
    signer,
    chainId
  )

  res.status(200).json(result)
}
