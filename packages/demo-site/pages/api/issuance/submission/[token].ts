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
import { findUserFromTemporaryAuthToken, User } from "../../../../lib/database"
import {
  generateRevocationListStatus,
  storeRevocableCredential
} from "../../../../lib/database"
import { buildAndSignFulfillmentForUser } from "../../../../lib/issuance/fulfillment"
import { findManifestById } from "../../../../lib/manifest"

export default apiHandler<EncodedCredentialFulfillment>(async (req, res) => {
  if (req.method !== "POST") {
    return methodNotAllowed(res)
  }

  // Find the user from a temporary auth token
  // We need to use a temporary auth token because this submission endpoint
  // may not be called directly from the user's browser (e.g. via mobile wallet)
  const user = await findUserFromTemporaryAuthToken(req.query.token as string)
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

  const fulfillment: EncodedCredentialFulfillment =
    await buildAndSignFulfillmentForUser(
      user,
      buildIssuer(process.env.ISSUER_DID, process.env.ISSUER_SECRET),
      acceptedApplication,
      await generateRevocationListStatus()
    )

  if (!fulfillment) {
    return notFound(res)
  }

  await persistGeneratedCredentials(user, fulfillment)

  res.json(fulfillment)
})

/**
 * Persist the verifiable credential to the database, associated with the user.
 */
async function persistGeneratedCredentials(
  user: User,
  fulfillment: EncodedCredentialFulfillment
): Promise<void> {
  const decodedPresentation = await decodeVerifiablePresentation(
    fulfillment.presentation
  )

  const decodedCredential =
    decodedPresentation.verifiableCredential as RevocableCredential[]

  await storeRevocableCredential(decodedCredential, user.id)
}
