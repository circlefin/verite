import { isString } from "lodash"

import {
  Issuer,
  CredentialPayload,
  DidKey,
  Attestation,
  JWT
} from "../../types"
import { CredentialPayloadBuilder } from "../builders"
import { signVerifiableCredential } from "../utils"

import type { CreateCredentialOptions } from "did-jwt-vc/src/types"

/**
 * Construct a Credential Payload containing an attestation for the given holder.
 */
export async function constructVerifiableCredential(
  issuerDid: string,
  subjectDid: string,
  attestation: Attestation | Attestation[],
  credentialType: string | string[],
  additionalPayload: Partial<CredentialPayload> = {}
): Promise<CredentialPayload> {
  return new CredentialPayloadBuilder()
    .issuer(issuerDid)
    .type(credentialType)
    .attestations(subjectDid, attestation)
    .additionalPayload(additionalPayload)
    .build()
}

function parseSubjectId(subject: string | DidKey): string {
  return isString(subject) ? subject : subject.subject
}

/**
 *  Build and sign a VerifiableCredential containing attestations for the subject.
 *
 * "Build" overloads provide convenience wrappers for 2 steps: constructing and signing.
 * You can call the construct and sign steps separately for more fine-grained control.
 *
 */
export async function buildVerifiableCredential(
  issuer: Issuer,
  subject: string | DidKey,
  attestation: Attestation | Attestation[],
  credentialType: string | string[],
  payload: Partial<CredentialPayload> = {},
  options?: CreateCredentialOptions
): Promise<JWT> {
  const credentialPayload = await constructVerifiableCredential(
    issuer.did,
    parseSubjectId(subject),
    attestation,
    credentialType,
    payload
  )
  return signVerifiableCredential(credentialPayload, issuer, options)
}
