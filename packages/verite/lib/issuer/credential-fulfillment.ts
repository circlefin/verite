import { v4 as uuidv4 } from "uuid"

import {
  DescriptorMap,
  EncodedCredentialFulfillment,
  Issuer,
  CredentialPayload,
  DidKey,
  Attestation,
  CredentialManifest,
  ClaimFormat,
  JWT,
  PresentationPayload,
  JwtPresentationPayload
} from "../../types"
import {
  CREDENTIAL_RESPONSE_TYPE_NAME,
  VC_CONTEXT_URI,
  VERIFIABLE_PRESENTATION_TYPE_NAME
} from "../utils"
import {
  signVerifiablePresentation
} from "../utils/credentials"

import type {
  CreateCredentialOptions,
  CreatePresentationOptions
} from "did-jwt-vc/src/types"
import { buildAndSignVerifiableCredential, buildVerifiableCredential } from "./credential"

/**
 * @decprecated use build and sign separately
 * Build a VerifiablePresentation containing a list of attestations.
 *
 * Creates a single Verifiable Credential.
 */
export async function buildAndSignFulfillment(
  issuer: Issuer,
  subject: string | DidKey,
  manifest: CredentialManifest,
  attestation: Attestation | Attestation[],
  credentialType: string | string[],
  payload: Partial<CredentialPayload> = {},
  options?: CreateCredentialOptions,
  presentationType: string | string[] = [VERIFIABLE_PRESENTATION_TYPE_NAME, CREDENTIAL_RESPONSE_TYPE_NAME],
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

  const fulfillment = buildFulfillment(manifest, encodedCredentials, presentationType)
  const encodedPresentation = await signVerifiablePresentation(
    fulfillment,
    issuer,
    presentationOptions,
  )

  return encodedPresentation as unknown as EncodedCredentialFulfillment

}

// TODO: switch to builder after fixing object structure
export function buildFulfillment(
  manifest: CredentialManifest,
  encodedCredentials: JWT | JWT[],
  presentationType: string | string[] = [VERIFIABLE_PRESENTATION_TYPE_NAME, CREDENTIAL_RESPONSE_TYPE_NAME]): JwtPresentationPayload {

   const credentialResponse = { credential_response: {
      id: uuidv4(),
      manifest_id: manifest.id,
      descriptor_map: manifest.output_descriptors.map<DescriptorMap>((d, i) => {
        return {
          id: d.id,
          format: ClaimFormat.JwtVc,
          path: `$.verifiableCredential[${i}]`
        }
      }) ?? []
    }
  }

  const vcJwtPayload = Array.isArray(encodedCredentials) ? encodedCredentials : [encodedCredentials]
  const payload = Object.assign({
    vp: {
      "@context": [VC_CONTEXT_URI],
      type: presentationType,
      verifiableCredential: vcJwtPayload,
      ...credentialResponse
    }
  })

 return payload;
}



/**
 * Build a VerifiablePresentation from a list of signed Verifiable Credentials.
 */
export async function buildAndSignMultiVcFulfillment(
  issuer: Issuer,
  manifest: CredentialManifest,
  encodedCredentials: JWT | JWT[],
  presentationType: string | string[] = [VERIFIABLE_PRESENTATION_TYPE_NAME, CREDENTIAL_RESPONSE_TYPE_NAME],
  options?: CreatePresentationOptions
): Promise<EncodedCredentialFulfillment> {

  const fulfillment = buildFulfillment(manifest, encodedCredentials, presentationType)
  const encodedPresentation = await signVerifiablePresentation(
    fulfillment,
    issuer,
    options,
  )

  return encodedPresentation as unknown as EncodedCredentialFulfillment
}

