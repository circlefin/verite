import { NextApiHandler } from "next"
import { ApiError } from "next/dist/next-server/server/api-utils"
import { methodNotAllowed, notFound, validationError } from "lib/api-fns"
import { findUserFromTemporaryAuthToken } from "lib/database"
import { createKycAmlFulfillment } from "lib/issuance/fulfillment"
import { validateCredentialSubmission } from "lib/issuance/submission"
import {
  issuer,
  CredentialApplication,
  CredentialFulfillment
} from "lib/verity"

const handler: NextApiHandler<CredentialFulfillment | ApiError> = async (
  req,
  res
) => {
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
    const acceptedApplication = await validateCredentialSubmission(application)
    const fulfillment: CredentialFulfillment = await createKycAmlFulfillment(
      user,
      issuer,
      acceptedApplication
    )

    res.json(fulfillment)
  } catch (err) {
    return validationError(res, err)
  }
}

export default handler
