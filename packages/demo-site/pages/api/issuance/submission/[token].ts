import type {
  EncodedCredentialApplication,
  EncodedCredentialFulfillment,
  RevocableCredential
} from "@centre/verity"
import {
  buildIssuer,
  revokeCredential,
  decodeVerifiablePresentation,
  getManifestIdFromCredentialApplication,
  ProcessedCredentialApplication,
  validateCredentialApplication
} from "@centre/verity"
import {
  apiHandler,
  methodNotAllowed,
  notFound,
  validationError
} from "../../../../lib/api-fns"
import { findUserFromTemporaryAuthToken, User } from "../../../../lib/database"
import {
  allRevocationLists,
  saveRevocationList,
  findCredentialsByUserIdAndType,
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
  const manifest = await findManifestById(
    getManifestIdFromCredentialApplication(application)
  )

  let acceptedApplication: ProcessedCredentialApplication

  try {
    acceptedApplication = await validateCredentialApplication(
      application,
      manifest
    )
  } catch (err) {
    return validationError(res, err)
  }

  // Before we issue a new credential of this type to a user, revoke all their
  // previous credentials of the same type.
  await revokeUserCredentials(user, manifest.id)

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

/**
 * Revokes all the credentials for a given user and type.
 *
 * @param user
 * @param type
 */
async function revokeUserCredentials(user: User, type: string) {
  const credentials = await findCredentialsByUserIdAndType(user.id, type)

  for (const credential of credentials) {
    // Find the credential's revocation list
    const url = credential.credentialStatus.statusListCredential
    const revocationLists = await allRevocationLists()
    const revocationList = revocationLists.find((l) => l.id === url)

    // Revoke the credential
    const list = await revokeCredential(
      credential,
      revocationList,
      buildIssuer(process.env.ISSUER_DID, process.env.ISSUER_SECRET)
    )

    // Persist the new revocation list
    await saveRevocationList(list)
  }
}
