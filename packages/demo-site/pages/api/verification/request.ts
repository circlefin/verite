import { VerificationRequest } from "@centre/verity"
import { NextApiHandler } from "next"
import { kycVerificationRequest } from "lib/verification/requests"

const handler: NextApiHandler<VerificationRequest> = (req, res) => {
  res.json(kycVerificationRequest())
}

export default handler
