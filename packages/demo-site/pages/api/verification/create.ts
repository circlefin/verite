import { NotFoundError } from "@centre/demo-site/lib/errors"
import {
  ChallengeTokenUrlWrapper,
  challengeTokenUrlWrapper,
  generateCreditScoreVerificationRequest,
  generateKycVerificationRequest,
  VerificationRequest
} from "@centre/verity"
import { v4 as uuidv4 } from "uuid"
import { apiHandler, requireMethod } from "../../../lib/api-fns"
import { saveVerificationRequest } from "../../../lib/database/verificationRequests"

type PostResponse = {
  challenge: Record<string, unknown>
  id: string
  qrCodeData: ChallengeTokenUrlWrapper
  type: string
}

/**
 * POST request handler
 *
 * Accepts and verifies a `VerificationSubmission`, and updates it's status
 */
export default apiHandler<PostResponse>(async (req, res) => {
  requireMethod(req, "POST")

  const type = req.query.type as string
  if (type !== "kyc" && type !== "credit-score") {
    throw new NotFoundError()
  }

  let verificationRequest: VerificationRequest
  if (type === "kyc") {
    const id = uuidv4()
    verificationRequest = await generateKycVerificationRequest(
      process.env.VERIFIER_DID,
      `${process.env.HOST}/api/verification/${id}/submission`,
      process.env.VERIFIER_DID,
      `${process.env.HOST}/api/verification/${id}/callback`,
      [process.env.ISSUER_DID],
      id
    )
  } else if (type === "credit-score") {
    const id = uuidv4()
    verificationRequest = await generateCreditScoreVerificationRequest(
      process.env.VERIFIER_DID,
      `${process.env.HOST}/api/verification/${id}/submission`,
      process.env.VERIFIER_DID,
      `${process.env.HOST}/api/verification/${id}/callback`,
      [process.env.ISSUER_DID],
      600,
      id
    )
  }
  await saveVerificationRequest(verificationRequest)

  const qrCodeData = challengeTokenUrlWrapper(
    `${process.env.HOST}/api/verification/${verificationRequest.request.id}`
  )

  const response = await fetch(qrCodeData.challengeTokenUrl)
  const challenge = await response.json()

  res.json({
    challenge,
    id: verificationRequest.request.id,
    qrCodeData,
    type
  })
})
