import {
  attestationToCredentialType,
  CredentialManifest,
  validateCredentialApplication,
  decodeAndVerifyCredentialResponseJwt,
  EncodedCredentialResponseWrapper,
  isRevocable,
  RevocableCredential,
  StatusList2021Entry,
  buildIssuer,
  revokeCredential,
  getManifestIdFromCredentialApplication,
  attestationToVCSchema,
  manifestIdToAttestationType,
  CredentialPayloadBuilder,
  composeCredentialResponse,
  signVerifiableCredential,
  decodeAndVerifyCredentialApplicationJwt,
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

/**
 * Handle a POST request to containing an empty Verifiable Presentation proving
 * ownership of a client did.  The endpoint checks the validity of the Verifiable
 * Presentation, and issues a separate Verifiable Presentation containing
 * the Verifiable Credentials for this given user.
 */
export default apiHandler<EncodedCredentialResponseWrapper>(
  async (req, res) => {
    requireMethod(req, "POST")

    // Find the user record from a temporary auth token
    // We need to use a temporary auth token because this submission endpoint
    // may not be called directly from the user's browser (e.g. via mobile wallet)
    const user = await findUserFromTemporaryAuthToken(req.query.token as string)
    if (!user) {
      throw new NotFoundError()
    }

    // Decode the Credential Application and check the signature
    const credentialApplication = await decodeAndVerifyCredentialApplicationJwt(
      req.body
    )

    // Validate the format of the Verifiable Presentation.
    const manifestId = getManifestIdFromCredentialApplication(
      credentialApplication
    )
    const manifest = await findManifestById(manifestId)
    await validateCredentialApplication(credentialApplication, manifest)

    const attestationType = manifestIdToAttestationType(manifest.id)
    const attestationDefinition = getAttestionDefinition(attestationType)

    // Build a revocation list and index if needed. We currently only need
    // a revocable credential for KYC/AML credentials.
    let revocationList: StatusList2021Entry
    if (attestationDefinition.revocable) {
      revocationList = await handleRevocation(user, manifest)
    }

    // Set the expiration date if it's expirable. In the Verite implementation,
    // we introduced a notion of an AttestationDefinition, which stores
    // metadata such as expiration and revocability.
    const expirationDate = new Date(
      Date.now() + attestationDefinition.expirationTerm
    )

    const userAttestation = buildAttestationForUser(user, attestationType)

    const issuer = buildIssuer(
      process.env.ISSUER_DID,
      process.env.ISSUER_SECRET
    )

    // Generate new credentials for the user
    const vcs = new CredentialPayloadBuilder()
      .issuer(issuer.did)
      .type(attestationToCredentialType(attestationType))
      .attestations(
        credentialApplication.credential_application.applicant,
        userAttestation
      )
      .credentialSchema(attestationToVCSchema(attestationType))
      .credentialStatus(revocationList)
      .expirationDate(expirationDate)
      .build()

    // TODO: comgbine the following???
    const signedCredentials = await signVerifiableCredential(vcs, issuer)
    const fulfillment = await composeCredentialResponse(
      credentialApplication.credential_application,
      manifest,
      issuer,
      signedCredentials
    )

    res.send(fulfillment)
    // Save the credentials to the database
    await persistGeneratedCredentials(user, fulfillment)
  }
)

/**
 * If we are using revocable credentials (e.g. KYC), then we should revoke
 * existing credentials (optional) and generate a revocation list and index
 * for this credential
 */
async function handleRevocation(
  user: User,
  manifest: CredentialManifest
): Promise<StatusList2021Entry | undefined> {
  await revokeUserCredentials(user, manifest.id)
  return generateRevocationListStatus()
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
  fulfillment: EncodedCredentialResponseWrapper
): Promise<void> {
  const decodedResponse = await decodeAndVerifyCredentialResponseJwt(
    fulfillment
  )

  await storeCredentials(decodedResponse.verifiableCredential, user.id)
}
