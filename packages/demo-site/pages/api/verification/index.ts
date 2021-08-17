import { apiHandler, requireMethod } from "../../../lib/api-fns"
import {
  createVerificationRequest,
  VerificationRequestResponse
} from "../../../lib/verification"

/**
 * POST request handler
 *
 * Accepts and verifies a `VerificationSubmission`, and updates it's status
 */
export default apiHandler<VerificationRequestResponse>(async (req, res) => {
  requireMethod(req, "POST")

  const type = req.query.type as string
  const subjectAddress = req.query.subjectAddress as string
  const contractAddress = req.query.contractAddress as string

  const result = await createVerificationRequest(
    type,
    subjectAddress,
    contractAddress
  )

  res.json(result)
})
