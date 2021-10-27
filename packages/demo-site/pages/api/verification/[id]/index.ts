import type { VerificationOffer } from "@centre/verity"
import { apiHandler, requireMethod } from "../../../../lib/api-fns"
import { findVerificationOffer } from "../../../../lib/database/verificationRequests"
import { NotFoundError } from "../../../../lib/errors"

/**
 * GET request handler
 *
 * Returns a VerificationOffer based on `id`
 */
export default apiHandler<VerificationOffer>(async (req, res) => {
  requireMethod(req, "GET")

  const verificationRequest = await findVerificationOffer(
    req.query.id as string
  )

  if (!verificationRequest) {
    throw new NotFoundError()
  }

  res.json(verificationRequest)
})
