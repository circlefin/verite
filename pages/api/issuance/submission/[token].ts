import { NextApiHandler } from "next"
import { ApiError } from "next/dist/next-server/server/api-utils"
import { methodNotAllowed } from "lib/api-fns"
import { generateFulfillment } from "lib/issuance/fulfillment"
import { CredentialFulfillmentResponse } from "types"

const SubmissionHandler: NextApiHandler<
  CredentialFulfillmentResponse | ApiError
> = (req, res) => {
  if (req.method !== "POST") {
    return methodNotAllowed(res)
  }

  // TODO: Validate the submission

  const fulfillment = generateFulfillment()

  res.json(fulfillment)
}

export default SubmissionHandler
