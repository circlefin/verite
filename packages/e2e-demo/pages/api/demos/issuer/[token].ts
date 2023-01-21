import {
  attestationToCredentialType,
  buildAndSignFulfillment,
  CredentialManifest,
  decodeCredentialApplication,
  EncodedCredentialFulfillment,
  isRevocable,
  RevocableCredential,
  StatusList2021Entry,
  buildIssuer,
  revokeCredential,
  decodeVerifiablePresentation,
  getManifestIdFromCredentialApplication,
  requiresRevocableCredentials,
  validateCredentialApplication,
  CREDIT_SCORE_MANIFEST_ID,
  getCredentialSchemaAsVCObject,
  getAttestionDefinition
} from "verite"

import { apiHandler, requireMethod } from "../../../../lib/api-fns"
import {
  findUserFromTemporaryAuthToken,
  User,
  findAllOrCreateRevocationLists,
  saveRevocationList,
  findCredentialsByUserIdAndType,
  generateRevocationListStatus,
  storeCredentials
} from "../../../../lib/database"
import { NotFoundError } from "../../../../lib/errors"
import { buildAttestationForUser } from "../../../../lib/issuance/fulfillment"
import { findManifestById } from "../../../../lib/manifest"

const oneMinute = 60 * 1000
const twoMonths = 2 * 30 * 24 * 60 * 60 * 1000

/**
 * Handle a POST request to containing an empty Verifiable Presentation proving
 * ownership of a client did.  The endpoint checks the validity of the Verifiable
 * Presentation, and issues a separate Verifiable Presentation containing
 * the Verifiable Credentials for this given user.
 */
export default apiHandler<EncodedCredentialFulfillment>(async (req, res) => {
  requireMethod(req, "POST")

  // Find the user record from a temporary auth token
  // We need to use a temporary auth token because this submission endpoint
  // may not be called directly from the user's browser (e.g. via mobile wallet)
  const user = await findUserFromTemporaryAuthToken(req.query.token as string)
  if (!user) {
    throw new NotFoundError()
  }

  // Decode the Verifiable Presentation and check the signature
  const credentialApplication = await decodeCredentialApplication(req.body)

  // Validate the format of the Verifiable Presentation.
  const manifestId = getManifestIdFromCredentialApplication(
    credentialApplication
  )
  const manifest = await findManifestById(manifestId)
  await validateCredentialApplication(credentialApplication, manifest)

  // Build a revocation list and index if needed. We currently only need
  // a revocable credential for KYC/AML credentials.
  const revocationList = await handleRevocationIfNecessary(user, manifest)

  // If this is a Credit Score attestation, set the expiration to be
  // one minute for the sake of a demo
  const expirationDate =
    manifest.id === CREDIT_SCORE_MANIFEST_ID
      ? new Date(Date.now() + oneMinute)
      : new Date(Date.now() + twoMonths)

  const userAttestation = buildAttestationForUser(user, manifest)
  const attestationDefinition = getAttestionDefinition(userAttestation.type)

  // Generate new credentials for the user
  const fulfillment = await buildAndSignFulfillment(
    buildIssuer(process.env.ISSUER_DID, process.env.ISSUER_SECRET),
    credentialApplication.holder,
    manifest,
    userAttestation,
    attestationToCredentialType(userAttestation.type),
    {
      credentialSchema: getCredentialSchemaAsVCObject(attestationDefinition),
      credentialStatus: revocationList,
      expirationDate
    }
  )



  // Save the credentials to the database
  await persistGeneratedCredentials(user, fulfillment)

  res.send(fulfillment)
})

/**
 * If we are using revocable credentials (e.g. KYC), then we should revoke
 * existing credentials (optional) and generate a revocation list and index
 * for this credential
 */
async function handleRevocationIfNecessary(
  user: User,
  manifest: CredentialManifest
): Promise<StatusList2021Entry | undefined> {
  if (requiresRevocableCredentials(manifest)) {
    // Before we issue a new credential of this type to a user, revoke all their
    // previous credentials of the same type.
    await revokeUserCredentials(user, manifest.id)
    return generateRevocationListStatus()
  }
}

/**
 * Revokes all the credentials for a given user and type.
 */
async function revokeUserCredentials(user: User, type: string) {
  const credentials = await findCredentialsByUserIdAndType(user.id, type)
  const revocable = credentials.filter((c) =>
    isRevocable(c)
  ) as RevocableCredential[]

  for (const credential of revocable) {
    try {
      // Find the credential's revocation list
      const url = credential.credentialStatus.statusListCredential
      const revocationLists = await findAllOrCreateRevocationLists()
      const revocationList = revocationLists.find((l) => l.id === url)

      // Revoke the credential
      const list = await revokeCredential(
        credential,
        revocationList,
        buildIssuer(process.env.ISSUER_DID, process.env.ISSUER_SECRET)
      )

      // Persist the new revocation list
      await saveRevocationList(list)
    } catch (e) {
      console.error(e)
    }
  }
}

/**
 * Persist the verifiable credential to the database, associated with the user.
 */
async function persistGeneratedCredentials(
  user: User,
  fulfillment: EncodedCredentialFulfillment
): Promise<void> {
  const decodedPresentation = await decodeVerifiablePresentation(fulfillment)

  await storeCredentials(decodedPresentation.verifiableCredential, user.id)
}
