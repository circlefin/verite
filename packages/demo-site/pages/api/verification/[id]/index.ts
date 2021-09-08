import type { VerificationRequest } from "@centre/verity"
import { apiHandler, requireMethod } from "../../../../lib/api-fns"
import { findVerificationRequest } from "../../../../lib/database/verificationRequests"
import { NotFoundError } from "../../../../lib/errors"

/**
 * GET request handler
 *
 * Returns a VerificationRequest based on `id`
 */
export default apiHandler<VerificationRequest>(async (req, res) => {
  requireMethod(req, "GET")

  const verificationRequest = await findVerificationRequest(
    req.query.id as string
  )

  if (!verificationRequest) {
    throw new NotFoundError()
  }

  res.json(verificationRequest)
})
