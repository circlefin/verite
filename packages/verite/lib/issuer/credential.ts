import { CreateCredentialOptions } from "did-jwt-vc"
import { isString } from "lodash"

import {
  Issuer,
  CredentialPayload,
  DidKey,
  JWT,
  Attestation
} from "../../types"
import { CredentialPayloadBuilder } from "../builders"
import { signVerifiableCredential } from "../utils"


function parseSubjectId(subject: string | DidKey) : string {
  return isString(subject) ? subject : subject.subject
}
/**
 * @deprecated use build and sign separately
 * Build and sign a VerifiableCredential containing an attestation for the given holder.
 */
export async function buildAndSignVerifiableCredential(
  issuer: Issuer,
  subject: string | DidKey,
  attestation: Attestation | Attestation[],
  credentialType: string | string[],
  payload: Partial<CredentialPayload> = {},
  options?: CreateCredentialOptions
): Promise<JWT> {
  const normalizedPayload = await buildVerifiableCredential(issuer.did, parseSubjectId(subject), attestation, credentialType, payload)
  return signVerifiableCredential(normalizedPayload, issuer, options)
}

/**
 * Build a VerifiableCredential containing an attestation for the given holder.
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
