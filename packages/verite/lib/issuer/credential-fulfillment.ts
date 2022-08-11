import { isString } from "lodash"
import { v4 as uuidv4 } from "uuid"

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


const typeMap = new Map<string, string>([
  ["KYCAMLAttestation", "KYCAMLCredential"],
  ["KYBPAMLAttestation", "KYBPAMLCredential"],
  ["CreditScoreAttestation", "CreditScoreCredential"],
  ["AddressOwner", "AddressOwnerCredential"],
  ["CounterpartyAccountHolder", "CounterpartyAccountHolderCredential"]
])

/**
 * Build a VerifiableCredential containing an attestation for the given holder.
 */
export async function buildAndSignVerifiableCredential(
  signer: Issuer,
  subject: string | DidKey,
  attestation: Attestation,
  payload: Partial<CredentialPayload> = {},
  options?: CreateCredentialOptions
): Promise<JWT> {
  const type = attestation["type"].toString()
  const credentialType = typeMap.get(type)
  const subjectId = isString(subject) ? subject : subject.subject

  const vcPayload: CredentialPayload = Object.assign(
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        { "@vocab": "https://verite.id/identity/" }
      ],
      type: ["VerifiableCredential", credentialType],
      credentialSubject: {
        id: subjectId,
        [type]: attestation
      },
      issuanceDate: new Date(),
      issuer: { id: signer.did }
    },
    payload
  )

  console.log(JSON.stringify(vcPayload))

  return encodeVerifiableCredential(vcPayload, signer, options)
}

/**
 * Build a VerifiablePresentation containing a list of attestations (VerifiableCredentials)
 */
export async function buildAndSignFulfillment(
  signer: Issuer,
  application: DecodedCredentialApplication,
  attestation: Attestation,
  payload: Partial<CredentialPayload> = {},
  options?: CreatePresentationOptions
): Promise<EncodedCredentialFulfillment> {
  const encodedCredentials = await buildAndSignVerifiableCredential(
    signer,
    application.holder,
    attestation,
    payload
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
