import jwt from "jsonwebtoken"
import { NextApiRequest, NextApiResponse } from "next"
import { v4 as uuidv4 } from "uuid"
import {
  buildKycVerificationOffer,
  kycAmlPresentationDefinition,
  evaluatePresentationSubmission,
  verificationResult
} from "verite"

export default async function verifications(
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
   * will require an approvate date, and issued by
   * did:key:z6MktD288XZYEwedyKzWPpHZzoJ4k7iz5R39PtcVR4F7Lkpg
   */
  const definition = kycAmlPresentationDefinition([
    process.env.NEXT_PUBLIC_ISSUER_DID
  ])

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
  const presentationRequest = buildKycVerificationOffer(
    uuidv4(),
    process.env.NEXT_PUBLIC_VERIFIER_DID, // verifier did
    `${process.env.NEXT_PUBLIC_BASEURL}/api/verifications/${token}`, // replyUrl
    `${process.env.NEXT_PUBLIC_BASEURL}/api/callback`, // statusUrl
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
    await evaluatePresentationSubmission(req.body, definition)
  } catch (e) {
    res.status(400).json({
      status: "invalid",
      errors: [
        {
          message: e.message
        }
      ]
    })
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
