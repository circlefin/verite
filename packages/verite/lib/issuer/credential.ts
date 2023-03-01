import { CreateCredentialOptions } from "did-jwt-vc"
import { isString } from "lodash"

import {
  Issuer,
  CredentialPayload,
  DidKey,
  JWT,
  Attestation,
  JwtCredentialPayload
} from "../../types"
import {
  VC_CONTEXT_URI,
  VERIFIABLE_CREDENTIAL_TYPE_NAME,
  VERITE_VOCAB_URI
} from "../utils"
import {
  encodeVerifiableCredential
} from "../utils/credentials"


const DEFAULT_CONTEXT = [VC_CONTEXT_URI, { "@vocab": VERITE_VOCAB_URI }]

function parseSubjectId(subject: string | DidKey) : string {
  return isString(subject) ? subject : subject.subject
}
/**
 * @deprecated use build and sign separately
 * Build and sign a VerifiableCredential containing an attestation for the given holder.
 */
export async function buildAndSignVerifiableCredential(
  signer: Issuer,
  subject: string | DidKey,
  attestation: Attestation | Attestation[],
  credentialType: string | string[],
  payload: Partial<CredentialPayload> = {},
  options?: CreateCredentialOptions
): Promise<JWT> {
  const normalizedPayload = await buildVerifiableCredential(signer, subject, attestation, credentialType, payload)
  return encodeVerifiableCredential(normalizedPayload, signer, options)
}

/**
 * Build a VerifiableCredential containing an attestation for the given holder.
 */
export async function buildVerifiableCredential(
  signer: Issuer,
  subject: string | DidKey,
  attestation: Attestation | Attestation[],
  credentialType: string | string[],
  payload: Partial<CredentialPayload> = {}
): Promise<CredentialPayload> {
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
  return vcPayload
}

export async function signVerifiableCredential(
  signer: Issuer,
  vcPayload: CredentialPayload | JwtCredentialPayload,
  options?: CreateCredentialOptions
): Promise<JWT> {
  return encodeVerifiableCredential(vcPayload, signer, options)
}