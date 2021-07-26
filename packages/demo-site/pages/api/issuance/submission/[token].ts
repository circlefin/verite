import {
  decodeVerifiablePresentation,
  EncodedCredentialApplication,
  EncodedCredentialFulfillment,
  RevocableCredential
} from "@centre/verity"
import { NextApiHandler } from "next"
import { ApiError } from "next/dist/next-server/server/api-utils"
import { methodNotAllowed, notFound, validationError } from "lib/api-fns"
import { findUserFromTemporaryAuthToken } from "lib/database"
import { pickListAndIndex, storeRevocableCredential } from "lib/database"
import { createFulfillment } from "lib/issuance/fulfillment"
import { validateCredentialSubmission } from "lib/issuance/submission"
import { credentialSigner } from "lib/signer"
import { ProcessedCredentialApplication } from "types"

const handler: NextApiHandler<EncodedCredentialFulfillment | ApiError> = async (
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

  const application: EncodedCredentialApplication = req.body
  let acceptedApplication: ProcessedCredentialApplication

  try {
    acceptedApplication = await validateCredentialSubmission(application)
  } catch (err) {
    return validationError(res, err)
  }

  const fulfillment: EncodedCredentialFulfillment = await createFulfillment(
    user,
    credentialSigner,
    acceptedApplication,
    await pickListAndIndex()
  )

  if (!fulfillment) {
    return notFound(res)
  }

  // Persist the decoded credential
  const decodedPresentation = await decodeVerifiablePresentation(
    fulfillment.presentation
  )

  const decodedCredential =
    decodedPresentation.verifiableCredential as RevocableCredential[]

  storeRevocableCredential(decodedCredential, user.id)

  res.json(fulfillment)
}

export default handler
