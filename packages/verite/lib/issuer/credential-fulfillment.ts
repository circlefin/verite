import { isString } from "lodash"
import { v4 as uuidv4 } from "uuid"

import { VERIFIABLE_CREDENTIAL } from "../utils/attestation-registry"
import {
  encodeVerifiableCredential,
  encodeVerifiablePresentation
} from "../utils/credentials"

import type {
  DescriptorMap,
  EncodedCredentialFulfillment,
  Issuer,
  DecodedCredentialApplication,
  CredentialPayload,
  DidKey,
  JWT,
  Attestation
} from "../../types"
import type {
  CreateCredentialOptions,
  CreatePresentationOptions
} from "did-jwt-vc/src/types"


const DEFAULT_CONTEXT = [
  "https://www.w3.org/2018/credentials/v1",
  { "@vocab": "https://verite.id/identity/" }
]
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

  const finalCredentialTypes = [VERIFIABLE_CREDENTIAL]
  const subjectId = isString(subject) ? subject : subject.subject
  if (Array.isArray(credentialType)) {
    const newTypes = credentialType.filter(c => c !== VERIFIABLE_CREDENTIAL)
    finalCredentialTypes.push(...newTypes)
  } else {
    if (credentialType !== VERIFIABLE_CREDENTIAL) {
      finalCredentialTypes.push(credentialType)
    }
  }
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

/**
 * Build a VerifiablePresentation containing a list of attestations.
 * 
 * Creates a single Verifiable Credential.
 */
export async function buildAndSignFulfillment(
  signer: Issuer,
  application: DecodedCredentialApplication,
  attestation: Attestation | Attestation[],
  credentialType: string | string[],
  payload: Partial<CredentialPayload> = {},
  options?: CreatePresentationOptions
): Promise<EncodedCredentialFulfillment> {
  const encodedCredentials = await buildAndSignVerifiableCredential(
    signer,
    application.holder,
    attestation,
    credentialType,
    payload,
    options
  )

  const encodedPresentation = await encodeVerifiablePresentation(
    signer.did,
    encodedCredentials,
    signer,
    options,
    ["VerifiablePresentation", "CredentialFulfillment"],
    {
      credential_fulfillment: {
        id: uuidv4(),
        manifest_id: application.credential_application.manifest_id,
        descriptor_map:
          application.presentation_submission?.descriptor_map?.map<DescriptorMap>(
            (d, i) => {
              return {
                id: d.id,
                format: "jwt_vc",
                path: `$.presentation.credential[${i}]`
              }
            }
          ) ?? []
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
  application: DecodedCredentialApplication,
  encodedCredentials: string[],
  options?: CreatePresentationOptions
): Promise<EncodedCredentialFulfillment> {

  const encodedPresentation = await encodeVerifiablePresentation(
    signer.did,
    encodedCredentials,
    signer,
    options,
    ["VerifiablePresentation", "CredentialFulfillment"],
    {
      credential_fulfillment: {
        id: uuidv4(),
        manifest_id: application.credential_application.manifest_id,
        descriptor_map:
          application.presentation_submission?.descriptor_map?.map<DescriptorMap>(
            (d, i) => {
              return {
                id: d.id,
                format: "jwt_vc",
                path: `$.presentation.credential[${i}]`
              }
            }
          ) ?? []
      }
    }
  )

  return encodedPresentation as unknown as EncodedCredentialFulfillment
}
