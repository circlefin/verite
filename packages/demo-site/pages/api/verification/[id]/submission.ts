import { processVerificationSubmission } from "@centre/verity"
import type { EncodedVerificationSubmission } from "@centre/verity"
import { apiHandler, requireMethod } from "../../../../lib/api-fns"
import {
  findVerificationRequest,
  updateVerificationRequestStatus
} from "../../../../lib/database/verificationRequests"
import { NotFoundError } from "../../../../lib/errors"

type PostResponse = { status: string }

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
    await processVerificationSubmission(
      submission,
      verificationRequest.presentation_definition
    )
  } catch (err) {
    await updateVerificationRequestStatus(
      verificationRequest.request.id,
      "rejected"
    )

    throw err
  }

  await updateVerificationRequestStatus(
    verificationRequest.request.id,
    "approved"
  )

  res.json({ status: "ok" })
})
