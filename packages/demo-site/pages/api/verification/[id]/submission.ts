import {
  validateVerificationSubmission,
  VerificationInfoResponse,
  verificationResult
} from "@centre/verity"
import type { EncodedVerificationSubmission } from "@centre/verity"
import { apiHandler, requireMethod } from "../../../../lib/api-fns"
import {
  findVerificationRequest,
  updateVerificationRequestStatus
} from "../../../../lib/database/verificationRequests"
import { NotFoundError } from "../../../../lib/errors"

type PostResponse = { status: string; result?: VerificationInfoResponse }

/**
 * POST request handler
 *
 * Accepts and verifies a `VerificationSubmission`, and updates it's status
 */
export default apiHandler<PostResponse>(async (req, res) => {
  requireMethod(req, "POST")

  const submission: EncodedVerificationSubmission = req.body
  const verificationRequest = await findVerificationRequest(
    req.query.id as string
  )

  if (!verificationRequest) {
    throw new NotFoundError()
  }

  try {
    await validateVerificationSubmission(
      submission,
      verificationRequest.body.presentation_definition
    )
  } catch (err) {
    await updateVerificationRequestStatus(
      verificationRequest.id,
      "rejected"
    )

    throw err
  }

  // If a subjectAddress and contractAddress are given, we will return a
  // verification result suitable for the ETH network
  const subjectAddress = req.query.subjectAddress as string
  const contractAddress = req.query.contractAddress as string
  let result: VerificationInfoResponse
  if (subjectAddress && contractAddress) {
    result = await verificationResult(
      subjectAddress,
      contractAddress,
      process.env.ETH_WALLET_MNEMONIC,
      parseInt(process.env.NEXT_PUBLIC_ETH_NETWORK, 10)
    )
  }

  await updateVerificationRequestStatus(
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
