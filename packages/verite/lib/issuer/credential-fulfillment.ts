import { v4 as uuidv4 } from "uuid"

import {
  DescriptorMap,
  EncodedCredentialFulfillment,
  Issuer,
  CredentialPayload,
  DidKey,
  Attestation,
  CredentialManifest,
  ClaimFormat
} from "../../types"
import {
  CREDENTIAL_RESPONSE_TYPE_NAME,
  VERIFIABLE_PRESENTATION_TYPE_NAME
} from "../utils"
import {
  signVerifiablePresentation
} from "../utils/credentials"

import type {
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
  options?: CreatePresentationOptions
): Promise<EncodedCredentialFulfillment> {
  const encodedCredentials = await buildAndSignVerifiableCredential(
    issuer,
    subject,
    attestation,
    credentialType,
    payload,
    options
  )

  const format = ClaimFormat.JwtVc

  const encodedPresentation = await signVerifiablePresentation(
    issuer.did,
    encodedCredentials,
    issuer,
    options,
    [VERIFIABLE_PRESENTATION_TYPE_NAME, CREDENTIAL_RESPONSE_TYPE_NAME],
    {
      credential_response: {
        id: uuidv4(),
        manifest_id: manifest.id,
        descriptor_map:
          manifest.output_descriptors.map<DescriptorMap>((d, i) => {
            return {
              id: d.id,
              format: format,
              path: `$.verifiableCredential[${i}]`
            }
          }) ?? []
      }
    }
  )

  return encodedPresentation as unknown as EncodedCredentialFulfillment
}

/**
 * Build a VerifiablePresentation from a list of signed Verifiable Credentials.
 */
export async function buildAndSignMultiVcFulfillment(
  issuer: Issuer,
  manifest: CredentialManifest,
  encodedCredentials: string[],
  options?: CreatePresentationOptions
): Promise<EncodedCredentialFulfillment> {
  const encodedPresentation = await signVerifiablePresentation(
    issuer.did,
    encodedCredentials,
    issuer,
    options,
    [VERIFIABLE_PRESENTATION_TYPE_NAME, CREDENTIAL_RESPONSE_TYPE_NAME],
    {
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
  )

  return encodedPresentation as unknown as EncodedCredentialFulfillment
}

