import type {
  EncodedCredentialApplication,
  EncodedCredentialFulfillment,
  RevocableCredential
} from "@centre/verity"
import {
  buildIssuer,
  decodeVerifiablePresentation,
  ProcessedCredentialApplication,
  validateCredentialSubmission
} from "@centre/verity"
import {
  apiHandler,
  methodNotAllowed,
  notFound,
  validationError
} from "../../../../lib/api-fns"
import { findUserFromTemporaryAuthToken } from "../../../../lib/database"
import {
  generateRevocationListStatus,
  storeRevocableCredential
} from "../../../../lib/database"
import { createFulfillment } from "../../../../lib/issuance/fulfillment"
import { findManifestById } from "../../../../lib/manifest"

export default apiHandler<EncodedCredentialFulfillment>(async (req, res) => {
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
    acceptedApplication = await validateCredentialSubmission(
      application,
      findManifestById
    )
  } catch (err) {
    return validationError(res, err)
  }

  const fulfillment: EncodedCredentialFulfillment = await createFulfillment(
    user,
    buildIssuer(process.env.ISSUER_DID, process.env.ISSUER_SECRET),
    acceptedApplication,
    await generateRevocationListStatus()
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
})
