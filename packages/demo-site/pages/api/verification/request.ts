import { VerificationRequest } from "@centre/verity"
import { apiHandler } from "lib/api-fns"
import { kycVerificationRequest } from "lib/verification/requests"

export default apiHandler<VerificationRequest>(async (req, res) => {
  res.json(kycVerificationRequest())
})
