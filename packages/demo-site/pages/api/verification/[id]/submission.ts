import {
  validateVerificationSubmission,
  VerificationResultResponse,
  verificationResult
} from "@verity/core"
import type { EncodedPresentationSubmission } from "@verity/core"
import { apiHandler, requireMethod } from "../../../../lib/api-fns"
import {
  findVerificationOffer,
  updateVerificationOfferStatus
} from "../../../../lib/database/verificationRequests"
import { NotFoundError } from "../../../../lib/errors"

type PostResponse = { status: string; result?: VerificationResultResponse }

/**
 * POST request handler
 *
 * Accepts and verifies a `VerificationSubmission`, and updates it's status
 */
export default apiHandler<PostResponse>(async (req, res) => {
  requireMethod(req, "POST")

  const submission: EncodedPresentationSubmission = req.body
  const verificationRequest = await findVerificationOffer(
    req.query.id as string
  )

  if (!verificationRequest) {
    throw new NotFoundError()
  }

  const options = {
    challenge: verificationRequest.body.challenge
  }

  try {
    await validateVerificationSubmission(
      submission,
      verificationRequest.body.presentation_definition,
      options
    )
  } catch (err) {
    await updateVerificationOfferStatus(verificationRequest.id, "rejected")

    throw err
  }

  // If a subjectAddress and contractAddress are given, we will return a
  // verification result suitable for the ETH network
  const subjectAddress = req.query.subjectAddress as string
  const contractAddress = req.query.contractAddress as string
  let result: VerificationResultResponse
  if (subjectAddress && contractAddress) {
    result = await verificationResult(
      subjectAddress,
      contractAddress,
      process.env.VERIFIER_PRIVATE_KEY,
      parseInt(process.env.NEXT_PUBLIC_ETH_NETWORK, 10)
    )
  }

  await updateVerificationOfferStatus(
    verificationRequest.id,
    "approved",
    result
  )

  if (result) {
    res.json({ status: "approved", result })
  } else {
    res.json({ status: "approved" })
  }
})
