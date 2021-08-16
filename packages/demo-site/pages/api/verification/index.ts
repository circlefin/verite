import {
  ChallengeTokenUrlWrapper,
  challengeTokenUrlWrapper,
  generateVerificationRequest,
  verificationRequestWrapper
} from "@centre/verity"
import { v4 as uuidv4 } from "uuid"
import { apiHandler, publicUrl, requireMethod } from "../../../lib/api-fns"
import { saveVerificationRequest } from "../../../lib/database/verificationRequests"
import { NotFoundError } from "../../../lib/errors"

type PostResponse = {
  id: string
  challenge: Record<string, unknown>
  qrCodeData: ChallengeTokenUrlWrapper
}

const ATTESTATION_TYPE_MAPPINGS = {
  kyc: "KYCAMLAttestation",
  "credit-score": "CreditScoreAttestation"
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

  // If the request includes a subjectAddress and contractAddress query
  // parameter, we will use it to generate an ETH verification result.
  const id = uuidv4()
  const replyTo = replyUrl(
    id,
    req.query.subjectAddress as string,
    req.query.contractAddress as string
  )

  // Build the verification request for display
  const verificationRequest = generateVerificationRequest(
    ATTESTATION_TYPE_MAPPINGS[type],
    process.env.VERIFIER_DID,
    process.env.VERIFIER_DID,
    replyTo,
    publicUrl(`/api/verification/${id}/callback`),
    [process.env.ISSUER_DID],
    { id, minimumCreditScore: 600 }
  )

  await saveVerificationRequest(verificationRequest)

  res.json({
    id,
    challenge: verificationRequestWrapper(verificationRequest),
    qrCodeData: challengeTokenUrlWrapper(
      publicUrl(`/api/verification/${verificationRequest.request.id}`)
    )
  })
})

function replyUrl(
  id: string,
  subjectAddress?: string,
  contractAddress?: string
): string {
  const url = new URL(publicUrl(`/api/verification/${id}/submission`))

  if (subjectAddress) {
    url.searchParams.append("subjectAddress", subjectAddress)
  }

  if (contractAddress) {
    url.searchParams.append("contractAddress", contractAddress)
  }

  return url.href
}
