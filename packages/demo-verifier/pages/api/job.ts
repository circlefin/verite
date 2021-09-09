import { generateVerificationRequest } from "@centre/verity"
import { NextApiRequest, NextApiResponse } from "next"

export default async function credentials(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  /**
   * For demo purposes, imagine that this API method requires that a user first
   * verify their credentials. Using Presentation Exchange, we'll return a
   * Presentation Request, that instructs the client how it can complete
   * verification.
   */
  const presentationRequest = generateVerificationRequest(
    "KYCAMLAttestation", // type
    process.env.NEXT_PUBLIC_VERIFIER_DID, // verifier did
    "/api/verifications", // replyUrl
    "/api/callback", // callbackUrl
    [process.env.NEXT_PUBLIC_ISSUER_DID] // trusted authorities
  )

  res.status(200).json(presentationRequest)
}
