import { CreateCredentialOptions, CreatePresentationOptions } from "did-jwt-vc"

import {
  CredentialManifest,
  JWT,
  JwtPresentationPayload,
  Attestation,
  CredentialPayload,
  DidKey,
  EncodedCredentialResponseWrapper,
  Issuer
} from "../../types"
import { CredentialResponseWrapperBuilder } from "../builders/credential-response-wrapper-builder"
import { signVerifiablePresentation } from "../utils"
import { composeVerifiableCredential } from "./credential"

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
 * Builds and signs a Credential Response from attestation(s).
 * This includes the intermediate step of building and signing a Verifiable
 * Credential.
 */
export async function composeCredentialResponseFromAttestation(
  issuer: Issuer,
  subject: string | DidKey,
  manifest: CredentialManifest,
  attestation: Attestation | Attestation[],
  credentialType: string | string[],
  payload: Partial<CredentialPayload> = {},
  options?: CreateCredentialOptions,
  presentationOptions?: CreatePresentationOptions
): Promise<EncodedCredentialResponseWrapper> {
  const encodedCredentials = await composeVerifiableCredential(
    issuer,
    subject,
    attestation,
    credentialType,
    payload,
    options
  )

  return composeCredentialResponse(
    issuer,
    manifest,
    encodedCredentials,
    presentationOptions
  )
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
