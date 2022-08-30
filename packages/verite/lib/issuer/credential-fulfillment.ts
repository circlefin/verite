import { isString } from "lodash"
import { v4 as uuidv4 } from "uuid"

import {
  DescriptorMap,
  EncodedCredentialFulfillment,
  Issuer,
  CredentialPayload,
  DidKey,
  JWT,
  Attestation,
  CredentialManifest,
  ClaimFormat
} from "../../types"
import {
  CREDENTIAL_RESPONSE_TYPE_NAME,
  parseClaimFormat,
  VC_CONTEXT_URI,
  VERIFIABLE_CREDENTIAL_TYPE_NAME,
  VERIFIABLE_PRESENTATION_TYPE_NAME,
  VERITE_VOCAB_URI
} from "../utils"
import {
  encodeVerifiableCredential,
  encodeVerifiablePresentation
} from "../utils/credentials"

import type {
  CreateCredentialOptions,
  CreatePresentationOptions
} from "did-jwt-vc/src/types"

const DEFAULT_CONTEXT = [VC_CONTEXT_URI, { "@vocab": VERITE_VOCAB_URI }]
/**
 * Build a VerifiableCredential containing an attestation for the given holder.
 */
export async function buildAndSignVerifiableCredential(
  signer: Issuer,
  subject: string | DidKey,
  attestation: Attestation | Attestation[],
  credentialType: string | string[],
  payload: Partial<CredentialPayload> = {},
  options?: CreateCredentialOptions
): Promise<JWT> {
  const subjectId = parseSubjectId(subject)

  // append all types other than "Verifiable Credential", which is already there
  const finalCredentialTypes = [VERIFIABLE_CREDENTIAL_TYPE_NAME].concat(
    Array.isArray(credentialType)
      ? credentialType.filter((c) => c !== VERIFIABLE_CREDENTIAL_TYPE_NAME)
      : credentialType !== VERIFIABLE_CREDENTIAL_TYPE_NAME
      ? [credentialType]
      : []
  )

  // For attestations, preserve the array or object structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let attsns: any[] | any
  if (Array.isArray(attestation)) {
    attsns = attestation.map((att) => {
      return {
        id: subjectId,
        [att["type"].toString()]: att
      }
    })
  } else {
    attsns = {
      id: subjectId,
      [attestation["type"].toString()]: attestation
    }
  }
  const vcPayload = Object.assign(
    {
      "@context": DEFAULT_CONTEXT,
      type: finalCredentialTypes,
      credentialSubject: attsns,
      issuanceDate: new Date(),
      issuer: { id: signer.did }
    },
    payload
  )
  return encodeVerifiableCredential(vcPayload, signer, options)
}

function parseSubjectId(subject: string | DidKey) {
  return isString(subject) ? subject : subject.subject
}

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
  const subjectId = parseSubjectId(subject)
  const encodedCredentials = await buildAndSignVerifiableCredential(
    signer,
    subjectId,
    attestation,
    credentialType,
    payload,
    options
  )
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const format = parseClaimFormat(manifest.format!) || ClaimFormat.JwtVc

  const encodedPresentation = await encodeVerifiablePresentation(
    signer.did,
    encodedCredentials,
    signer,
    options,
    [VERIFIABLE_PRESENTATION_TYPE_NAME, CREDENTIAL_RESPONSE_TYPE_NAME],
    {
      credential_fulfillment: {
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
      credential_fulfillment: {
        id: uuidv4(),
        manifest_id: manifest.id,
        descriptor_map:
          manifest.output_descriptors.map<DescriptorMap>((d, i) => {
            return {
              id: d.id,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              format: parseClaimFormat(manifest.format!) || ClaimFormat.JwtVc,
              path: `$.verifiableCredential[${i}]`
            }
          }) ?? []
      }
    }
  )

  return encodedPresentation as unknown as EncodedCredentialFulfillment
}
