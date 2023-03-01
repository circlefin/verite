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
  VC_CONTEXT_URI,
  VERIFIABLE_PRESENTATION_TYPE_NAME,
  VERITE_VOCAB_URI
} from "../utils"
import {
  encodeVerifiablePresentation
} from "../utils/credentials"

import type {
  CreatePresentationOptions
} from "did-jwt-vc/src/types"
import { buildVerifiableCredential, signVerifiableCredential } from "./credential"

const DEFAULT_CONTEXT = [VC_CONTEXT_URI, { "@vocab": VERITE_VOCAB_URI }]

/**
 * Build a VerifiablePresentation containing a list of attestations.
 *
 * Creates a single Verifiable Credential.
 */
export async function buildAndSignFulfillment(
  signer: Issuer,
  subject: string | DidKey,
  manifest: CredentialManifest,
  attestation: Attestation | Attestation[],
  credentialType: string | string[],
  payload: Partial<CredentialPayload> = {},
  options?: CreatePresentationOptions
): Promise<EncodedCredentialFulfillment> {
  const encodedCredentials = await buildVerifiableCredential(
    signer,
    subject,
    attestation,
    credentialType,
    payload
  )
  const signedCredential = await signVerifiableCredential(signer, encodedCredentials, options)
  const format = ClaimFormat.JwtVc

  const encodedPresentation = await encodeVerifiablePresentation(
    signer.did,
    signedCredential,
    signer,
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
  signer: Issuer,
  manifest: CredentialManifest,
  encodedCredentials: string[],
  options?: CreatePresentationOptions
): Promise<EncodedCredentialFulfillment> {
  const encodedPresentation = await encodeVerifiablePresentation(
    signer.did,
    encodedCredentials,
    signer,
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
function parseSubjectId(subject: string | DidKey) {
  throw new Error("Function not implemented.")
}

