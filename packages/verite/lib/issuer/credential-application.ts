import { JWTHeader, JWTOptions, JWTPayload } from "did-jwt"

import {
  CredentialApplicationWrapper,
  CredentialManifest,
  DecodedCredentialApplicationWrapper,
  EncodedCredentialApplicationWrapper,
  Issuer,
  JWT
} from "../../types"
import {
  signJWT,
  decodeJWT2,
  verifyJWT2,
  verifyVerifiableCredential
} from "../utils"
import { validateCredentialApplication } from "../validators"

// TOFIX: where should this live?
export async function signVeriteJwt(
  payload: Partial<JWTPayload>, // TOFIX: export JWTPayload from did-jwt
  issuer: Issuer,
  options?: JWTOptions, // TOFIX: here and below: figure out how far out to plumb options and header
  header?: Partial<JWTHeader>
): Promise<JWT> {
  // TOFIX: dbl-check order
  const options2 = {
    issuer: issuer.did,
    signer: issuer.signer,
    ...options
  }

  const jwt = await signJWT(payload, options2, header)

  return jwt
}

/**
 * Decode an encoded Credential Application.
 *
 * This method decodes the submitted Credential Application, verifies it as a Verifiable
 * Presentation, and returns the decoded Credential Application.
 *
 * @returns the decoded Credential Application
 * @throws VerificationException if the Credential Application is not valid
 */
export async function decodeAndVerifyCredentialApplicationJwt(
  encodedApplication: EncodedCredentialApplicationWrapper
): Promise<DecodedCredentialApplicationWrapper> {
  const result = await decodeJWT2(encodedApplication)
  const valid = await verifyJWT2(encodedApplication) // TOFIX: options
  const caw = result.payload as CredentialApplicationWrapper
  let decodedArray
  if (caw.verifiableCredential) {
    decodedArray = await Promise.all(
      caw.verifiableCredential.map((vc) => verifyVerifiableCredential(vc))
    )
  }
  const decoded = {
    credential_application: caw.credential_application,
    ...(decodedArray !== undefined && { verifiableCredential: decodedArray })
  }

  return decoded
}

/**
 * Decode and validate an encoded Credential Application.
 *
 * This is a convenience wrapper around `decodeCredentialApplication` and `validateCredentialApplication`,
 * which can be called separately.
 *
 * @returns the decoded Credential Application
 * @throws VerificationException if the Credential Application is not a valid
 *  Verifiable Presentation
 */
export async function evaluateCredentialApplication(
  encodedApplication: EncodedCredentialApplicationWrapper,
  manifest: CredentialManifest,
  options?: JWTOptions
): Promise<DecodedCredentialApplicationWrapper> {
  // TOFIX: so many verifies
  const application = await decodeAndVerifyCredentialApplicationJwt(
    encodedApplication
  )

  await validateCredentialApplication(application, manifest)
  return application
}
