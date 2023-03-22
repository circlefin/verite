import {
  CredentialApplicationWrapper,
  CredentialManifest,
  JWT,
  MaybeCredential,
  Signer,
  Verifiable,
  W3CCredential
} from "../../types"
import { CredentialApplicationWrapperBuilder } from "../builders"
import { signJWT, verifyJWT } from "../utils"
import { validateCredentialApplicationForManifest } from "../validators"

/**
 * Convenience method for composing a signed, JWT-encoded Credential Application
 * @param manifest
 * @param signer
 * @param verifiableCredential
 * @returns
 */
export async function composeCredentialApplicationJWT(
  manifest: CredentialManifest,
  signer: Signer,
  verifiableCredential?: JWT | JWT[]
): Promise<JWT> {
  // FOLLOW_UP: generalize when we support other formats
  const application = new CredentialApplicationWrapperBuilder<JWT>()
    .withCredentialApplication((a) => {
      a.initFromManifest(manifest)
      a.applicant(signer.did)
    })
    .verifiableCredential(verifiableCredential)
    .build()

  const responseJwt = await signJWT(application, signer)
  return responseJwt
}

/**
 * Decode a JWT-encoded Credential Application.
 *
 * This method decodes and verifies the JWT-encoded Credential Application,
 * returning the decoded form.
 *
 * Note: does not decode the Credential Application's verifiable credentials.
 *
 * @returns the decoded Credential Application
 * @throws VerificationException if the Credential Application is not well-formed
 */
export async function decodeCredentialApplicationJWT(
  encodedApplication: JWT
): Promise<CredentialApplicationWrapper<MaybeCredential>> {
  const result = await verifyJWT(encodedApplication)
  return result.payload as CredentialApplicationWrapper<MaybeCredential>
}

/**
 * Decode and validate a JWT-encoded Credential Application.
 *
 * This is a convenience wrapper around `decodeCredentialApplicationJwt` and `validateCredentialApplicationForManifest`,
 * which can be called separately.
 *
 * @returns the Credential Application with its verifiable credentials decoded and verified
 * @throws VerificationException if the Credential Application is not valid
 */
export async function validateCredentialApplicationJWTForManifest(
  encodedApplication: JWT,
  manifest: CredentialManifest
): Promise<CredentialApplicationWrapper<Verifiable<W3CCredential>>> {
  const application = await decodeCredentialApplicationJWT(encodedApplication)
  const finalApp = await validateCredentialApplicationForManifest(
    application,
    manifest
  )
  return finalApp
}
