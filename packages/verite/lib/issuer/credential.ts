import { isString } from "lodash"


import {
  EncodedCredentialFulfillment,
  Issuer,
  CredentialPayload,
  DidKey,
  Attestation,
  CredentialManifest,
  JWT,
} from "../../types"
import {
  CREDENTIAL_RESPONSE_TYPE_NAME,
  VERIFIABLE_PRESENTATION_TYPE_NAME,
  signVerifiableCredential,
  signVerifiablePresentation
} from "../utils"

import type {
  CreateCredentialOptions,
  CreatePresentationOptions
} from "did-jwt-vc/src/types"


import { CredentialPayloadBuilder } from "../builders"



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



function parseSubjectId(subject: string | DidKey) : string {
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
  const credentialPayload = await constructVerifiableCredential(issuer.did, parseSubjectId(subject), attestation, credentialType, payload)
  return signVerifiableCredential(credentialPayload, issuer, options)
}
