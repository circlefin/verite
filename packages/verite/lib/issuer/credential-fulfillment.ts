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
import { buildVerifiableCredential } from "./credential"

// TODO: fix up after making consistent with latest Credential Manifest
export function constructCredentialFulfillment(
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
 * Keeping for backwards compatibility. Signature is too complex; use buildVerifiableCredential and buildFulfillment instead.
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
  const encodedCredentials = await buildVerifiableCredential(
    issuer,
    subject,
    attestation,
    credentialType,
    payload,
    options
  )

  return buildCredentialFulfillment(
    issuer,
    manifest,
    encodedCredentials,
    presentationType,
    presentationOptions
  )
}

/**
 * Construct and sign a Credential Fulfillment (which is a VerifiablePresentation) from a list of signed Verifiable Credentials.
 *
 * "Build" overloads provide convenience wrappers for 2 steps: constructing and signing.
 * You can call the construct and sign steps separately for more fine-grained control.
 *
 */
export async function buildCredentialFulfillment(
  issuer: Issuer,
  manifest: CredentialManifest,
  encodedCredentials: JWT | JWT[],
  presentationType: string | string[] = [
    VERIFIABLE_PRESENTATION_TYPE_NAME,
    CREDENTIAL_RESPONSE_TYPE_NAME
  ],
  options?: CreatePresentationOptions
): Promise<EncodedCredentialFulfillment> {
  const fulfillment = constructCredentialFulfillment(
    manifest,
    encodedCredentials,
    presentationType
  )
  const encodedPresentation = await signVerifiablePresentation(
    fulfillment,
    issuer,
    options
  )

  return encodedPresentation as unknown as EncodedCredentialFulfillment
}
