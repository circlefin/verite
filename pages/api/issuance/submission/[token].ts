import { NextApiHandler } from "next"
import { ApiError } from "next/dist/next-server/server/api-utils"
import { methodNotAllowed, validationError } from "lib/api-fns"
import { createFullfillment } from "lib/issuance/fulfillment"
import { validateCredentialSubmission } from "lib/issuance/submission"
import { issuer } from "lib/sign-utils"
import { CredentialFulfillmentResponse } from "types"
import { CredentialApplicationWrapper } from "types/presentation_submission/PresentationSubmission"

const handler: NextApiHandler<CredentialFulfillmentResponse | ApiError> =
  async (req, res) => {
    if (req.method !== "POST") {
      return methodNotAllowed(res)
    }

    const application: CredentialApplicationWrapper = req.body

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
