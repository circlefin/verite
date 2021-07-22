import { kycVerificationRequest } from "lib/verification/requests"
import { NextApiHandler } from "next"

const handler: NextApiHandler = (req, res) => {
  res.json(kycVerificationRequest())
}

export default handler
