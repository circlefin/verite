import {
  CreatePresentationOptions,
  VerifyPresentationOptions
} from "did-jwt-vc/src/types"

import {
  CredentialManifest,
  DecodedCredentialApplication,
  DidKey,
  EncodedCredentialApplication,
  JWT,
  JwtPresentationPayload
} from "../../types"
import { CredentialApplicationWrapperBuilder } from "../builders/credential-application-wrapper-builder"
import {
  buildIssuer,
  verifyVerifiablePresentation,
  signVerifiablePresentation
} from "../utils"
import { validateCredentialApplication } from "../validators"

export function buildCredentialApplication(
  manifest: CredentialManifest,
  verifiableCredential?: JWT | JWT[]
): JwtPresentationPayload {
  const wrapper = new CredentialApplicationWrapperBuilder()
    .withCredentialApplication((a) => a.initFromManifest(manifest))
    .verifiableCredential(verifiableCredential)
    .build()

  // TODO: call this embed?
  const payload = Object.assign({
    vp: wrapper
  })

  return payload
}

/**
 * Generates a Credential Application as response to a Credential Manifest
 *
 * @returns an encoded & signed application that can be submitted to the issuer
 */
export async function composeCredentialApplication(
  didKey: DidKey,
  manifest: CredentialManifest,
  verifiableCredential?: JWT | JWT[],
  options?: CreatePresentationOptions
): Promise<EncodedCredentialApplication> {
  const application = buildCredentialApplication(manifest, verifiableCredential)
  const client = buildIssuer(didKey.subject, didKey.privateKey)
  const vp = await signVerifiablePresentation(application, client, options)

  return vp
}

/**
 * Decode an encoded Credential Application.
 *
 * A Credential Application is a Verifiable Presentation. This method decodes
 * the submitted Credential Application, verifies it as a Verifiable
 * Presentation, and returns the decoded Credential Application.
 *
 * @returns the decoded Credential Application
 * @throws VerificationException if the Credential Application is not a valid
 *  Verifiable Presentation
 */
export async function decodeCredentialApplication(
  encodedApplication: EncodedCredentialApplication,
  options?: VerifyPresentationOptions
): Promise<DecodedCredentialApplication> {
  const decodedPresentation = await verifyVerifiablePresentation(
    encodedApplication,
    options
  )

  return decodedPresentation as DecodedCredentialApplication
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
  encodedApplication: EncodedCredentialApplication,
  manifest: CredentialManifest,
  options?: VerifyPresentationOptions
): Promise<DecodedCredentialApplication> {
  const application = await decodeCredentialApplication(
    encodedApplication,
    options
  )
  await validateCredentialApplication(application, manifest)
  return application
}
