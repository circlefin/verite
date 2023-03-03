import { CreateCredentialOptions, CreatePresentationOptions } from "did-jwt-vc"
import { v4 as uuidv4 } from "uuid"

import {
  DescriptorMap,
  CredentialManifest,
  ClaimFormat,
  JWT,
  JwtPresentationPayload,
  Attestation,
  CredentialPayload,
  DidKey,
  EncodedCredentialFulfillment,
  Issuer
} from "../../types"
import {
  CREDENTIAL_RESPONSE_TYPE_NAME,
  signVerifiablePresentation,
  VC_CONTEXT_URI,
  VERIFIABLE_PRESENTATION_TYPE_NAME
} from "../utils"
import { buildAndSignVerifiableCredential } from "./credential"

export function buildCredentialFulfillment(
  manifest: CredentialManifest,
  encodedCredentials: JWT | JWT[],
  presentationType: string | string[] = [
    VERIFIABLE_PRESENTATION_TYPE_NAME,
    CREDENTIAL_RESPONSE_TYPE_NAME
  ]
): JwtPresentationPayload {
  const credentialResponse = {
    credential_response: {
      id: uuidv4(),
      manifest_id: manifest.id,
      descriptor_map:
        manifest.output_descriptors.map<DescriptorMap>((d, i) => {
          return {
            id: d.id,
            format: ClaimFormat.JwtVc,
            path: `$.verifiableCredential[${i}]`
          }
        }) ?? []
    }
  }

  const vcJwtPayload = Array.isArray(encodedCredentials)
    ? encodedCredentials
    : [encodedCredentials]
  const payload = Object.assign({
    vp: {
      "@context": [VC_CONTEXT_URI],
      type: presentationType,
      verifiableCredential: vcJwtPayload,
      ...credentialResponse
    }
  })

  return payload
}

/**
 * @deprecated
 * Keeping for backwards compatibility. Signature is too confisuing and complex; use buildAndSignVerifiableCredential and buildAndSignCredentialFulfillment instead.
 */
export async function buildAndSignFulfillment(
  issuer: Issuer,
  subject: string | DidKey,
  manifest: CredentialManifest,
  attestation: Attestation | Attestation[],
  credentialType: string | string[],
  payload: Partial<CredentialPayload> = {},
  options?: CreateCredentialOptions,
  presentationType: string | string[] = [
    VERIFIABLE_PRESENTATION_TYPE_NAME,
    CREDENTIAL_RESPONSE_TYPE_NAME
  ],
  presentationOptions?: CreatePresentationOptions
): Promise<EncodedCredentialFulfillment> {
  const encodedCredentials = await buildAndSignVerifiableCredential(
    issuer,
    subject,
    attestation,
    credentialType,
    payload,
    options
  )

  return buildAndSignCredentialFulfillment(
    issuer,
    manifest,
    encodedCredentials,
    presentationType,
    presentationOptions
  )
}

/**
 * Build and sign a Credential Fulfillment (which is a VerifiablePresentation) from a list of signed Verifiable Credentials.
 *
 * "Build and sign" overloads provide convenience wrappers for 2 steps: building and signing.
 * You can call the wrapped functions separately for more fine-grained control.
 *
 * Signing is forwarded to the did-jwt-vc library.
 *
 */
export async function buildAndSignCredentialFulfillment(
  issuer: Issuer,
  manifest: CredentialManifest,
  encodedCredentials: JWT | JWT[],
  presentationType: string | string[] = [
    VERIFIABLE_PRESENTATION_TYPE_NAME,
    CREDENTIAL_RESPONSE_TYPE_NAME
  ],
  options?: CreatePresentationOptions
): Promise<EncodedCredentialFulfillment> {
  const fulfillment = buildCredentialFulfillment(
    manifest,
    encodedCredentials,
    presentationType
  )
  const signedPresentation = await signVerifiablePresentation(
    fulfillment,
    issuer,
    options
  )

  return signedPresentation as unknown as EncodedCredentialFulfillment
}
