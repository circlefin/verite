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
 * Build a Verifiable Credential (for subsequent signing) containing an attestation for the given holder.
 */
export async function buildVerifiableCredential(
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
 * "Build and sign" overloads provide convenience wrappers for 2 steps: building and signing.
 * You can call the wrapped functions separately for more fine-grained control.
 *
 * Signing is forwarded to the did-jwt-vc library.
 *
 */
export async function composeVerifiableCredential(
  issuer: Issuer,
  subject: string | DidKey,
  attestation: Attestation | Attestation[],
  credentialType: string | string[],
  payload: Partial<CredentialPayload> = {},
  options?: CreateCredentialOptions
): Promise<JWT> {
  const credentialPayload = await buildVerifiableCredential(
    issuer.did,
    parseSubjectId(subject),
    attestation,
    credentialType,
    payload
  )
  return signVerifiableCredential(credentialPayload, issuer, options)
}
