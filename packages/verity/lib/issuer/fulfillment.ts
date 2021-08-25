import {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt
} from "did-jwt-vc"
import { v4 as uuidv4 } from "uuid"
import type {
  DescriptorMap,
  EncodedCredentialFulfillment,
  Issuer,
  KYCAMLAttestation,
  DecodedCredentialApplication,
  CreditScoreAttestation,
  CredentialPayload,
  JWT
} from "../../types"
import { verifiablePresentationPayload } from "../utils/credentials"

/**
 * Build a VerifiableCredential contaning an attestation for the given holder.
 */
export function buildAndSignVerifiableCredential(
  signer: Issuer,
  holderDid: string,
  attestation: KYCAMLAttestation | CreditScoreAttestation,
  payload: Partial<CredentialPayload> = {}
): Promise<JWT> {
  const type = attestation["@type"]

  const vcPayload: CredentialPayload = Object.assign(
    {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://verity.id/identity"
      ],
      type: ["VerifiableCredential", type],
      credentialSubject: {
        id: holderDid,
        [type]: attestation
      },
      issuanceDate: new Date(),
      issuer: { id: signer.did }
    },
    payload
  )

  return createVerifiableCredentialJwt(vcPayload, signer)
}

/**
 * Build a VerifiablePresentation containing a list of attestations (VerifiableCredentials)
 */
export async function buildAndSignFulfillment(
  signer: Issuer,
  application: DecodedCredentialApplication,
  attestation: KYCAMLAttestation | CreditScoreAttestation,
  payload: Partial<CredentialPayload> = {}
): Promise<EncodedCredentialFulfillment> {
  const encodedCredentials = await buildAndSignVerifiableCredential(
    signer,
    application.presentation.holder,
    attestation,
    payload
  )

  const encodedPresentation = await createVerifiablePresentationJwt(
    verifiablePresentationPayload(signer.did, encodedCredentials),
    signer
  )

  return {
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
        ) || []
    },
    presentation: encodedPresentation
  }
}
