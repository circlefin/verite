import { CreatePresentationOptions } from "did-jwt-vc"

import {
  CredentialManifest,
  JWT,
  JwtPresentationPayload,
  EncodedCredentialResponseWrapper,
  Issuer
} from "../../types"
import { CredentialResponseWrapperBuilder } from "../builders/credential-response-wrapper-builder"
import { signVerifiablePresentation } from "../utils"

export function buildCredentialResponse(
  manifest: CredentialManifest,
  encodedCredentials: JWT | JWT[]
): JwtPresentationPayload {
  const wrapper = new CredentialResponseWrapperBuilder()
    .withCredentialResponse((r) => r.initFromManifest(manifest))
    .verifiableCredential(encodedCredentials)
    .build()

  const payload = Object.assign({
    vp: wrapper
  })

  return payload
}

/**
 * Compose a Credential Fulfillment (which is a VerifiablePresentation) from a list of signed Verifiable Credentials.
 *
 * "Compose" overloads provide convenience wrappers for 2 steps: building and signing.
 * You can call the wrapped functions separately for more fine-grained control.
 *
 * Signing is forwarded to the did-jwt-vc library.
 *
 */
export async function composeCredentialResponse(
  issuer: Issuer,
  manifest: CredentialManifest,
  encodedCredentials: JWT | JWT[],
  options?: CreatePresentationOptions
): Promise<EncodedCredentialResponseWrapper> {
  const fulfillment = buildCredentialResponse(manifest, encodedCredentials)
  const signedPresentation = await signVerifiablePresentation(
    fulfillment,
    issuer,
    options
  )

  return signedPresentation as unknown as EncodedCredentialResponseWrapper
}
