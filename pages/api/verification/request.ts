import { NextApiHandler } from "next"
import { kycVerificationRequest } from "lib/verification/requests"

const handler: NextApiHandler = (req, res) => {
  res.json(kycVerificationRequest())
}

export default handler
