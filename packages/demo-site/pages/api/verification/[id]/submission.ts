import {
  processVerificationSubmission,
  VerificationInfoResponse,
  verificationResult
} from "@centre/verity"
import type { EncodedVerificationSubmission } from "@centre/verity"
import { apiHandler, requireMethod } from "../../../../lib/api-fns"
import {
  findVerificationRequest,
  updateVerificationRequestStatus
} from "../../../../lib/database/verificationRequests"
import { NotFoundError, ProcessingError } from "../../../../lib/errors"

type PostResponse = { status: string; result?: VerificationInfoResponse }

const WALLET_MNEMONIC =
  "announce room limb pattern dry unit scale effort smooth jazz weasel alcohol"

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
    const processedSubmission = await processVerificationSubmission(
      submission,
      verificationRequest.presentation_definition
    )

    if (!processedSubmission.accepted()) {
      throw new ProcessingError(processedSubmission.errors())
    }
  } catch (err) {
    await updateVerificationRequestStatus(
      verificationRequest.request.id,
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
      WALLET_MNEMONIC
    )
  }

  await updateVerificationRequestStatus(
    verificationRequest.request.id,
    "approved",
    result
  )

  if (result) {
    res.json({ status: "approved", result })
  } else {
    res.json({ status: "approved" })
  }
})
