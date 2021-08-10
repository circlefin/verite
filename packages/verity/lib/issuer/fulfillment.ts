import {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt,
  CredentialPayload
} from "did-jwt-vc"
import { v4 as uuidv4 } from "uuid"
import type {
  DescriptorMap,
  EncodedCredentialFulfillment,
  Issuer,
  RevocationList2021Status,
  KYCAMLAttestation,
  DecodedCredentialApplication,
  CreditScoreAttestation,
  CredentialIssuer,
  JWT
} from "../../types"
import { verifiablePresentationPayload } from "../utils/credentials"

function buildVerifiableCredentialPayload(
  issuer: CredentialIssuer, // TODO: Can we auto-gen this?
  subject: string,
  attestation: KYCAMLAttestation | CreditScoreAttestation,
  credentialStatus?: RevocationList2021Status
): CredentialPayload {
  const type = attestation["@type"]

  return {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      "https://verity.id/identity"
    ],
    type: ["VerifiableCredential", type],
    credentialSubject: {
      id: subject,
      [type]: attestation
    },
    issuanceDate: new Date(),
    issuer,
    credentialStatus
  }
}

/**
 * Build a VerifiableCredential contaning an attestation for the given holder.
 */
export function buildAndSignVerifiableCredential(
  signer: Issuer,
  holderDid: string,
  attestation: KYCAMLAttestation | CreditScoreAttestation,
  credentialStatus?: RevocationList2021Status
): Promise<JWT> {
  const vcPayload = buildVerifiableCredentialPayload(
    { id: signer.did },
    holderDid,
    attestation,
    credentialStatus
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
  credentialStatus?: RevocationList2021Status
): Promise<EncodedCredentialFulfillment> {
  const encodedCredentials = await buildAndSignVerifiableCredential(
    signer,
    application.presentation.holder,
    attestation,
    credentialStatus
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
