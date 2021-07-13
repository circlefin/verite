import { NextApiHandler } from "next"
import { ApiError } from "next/dist/next-server/server/api-utils"
import { methodNotAllowed, notFound, validationError } from "lib/api-fns"
import { findUserFromTemporaryAuthToken } from "lib/database"
import { createFullfillment } from "lib/issuance/fulfillment"
import { validateCredentialSubmission } from "lib/issuance/submission"
import { issuer, CredentialApplication } from "lib/verity"
import { CredentialFulfillmentResponse } from "types"

const handler: NextApiHandler<CredentialFulfillmentResponse | ApiError> =
  async (req, res) => {
    if (req.method !== "POST") {
      return methodNotAllowed(res)
    }

    const { token } = req.query
    const user = await findUserFromTemporaryAuthToken(token as string)
    if (!user) {
      return notFound(res)
    }

    const application: CredentialApplication = req.body

    try {
      validateCredentialSubmission(application)
    } catch (err) {
      return validationError(res, err)
    }

    const fulfillment: CredentialFulfillmentResponse = await createFullfillment(
      issuer,
      application
    )

    res.json(fulfillment)
  }

export default handler
