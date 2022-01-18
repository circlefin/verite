import { apiHandler, requireMethod } from "../../../../lib/api-fns"
import {
  createVerificationOffer,
  VerificationRequestResponse
} from "../../../../lib/verification-request"

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
  const verifierSubmit = req.query.verifierSubmit as string
  const registryAddress = req.query.registryAddress as string

  const result = await createVerificationOffer(
    type,
    subjectAddress,
    contractAddress,
    verifierSubmit === "true",
    registryAddress
  )

  res.json(result)
})
