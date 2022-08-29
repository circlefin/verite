import { CredentialSchema } from "../../types";

export const KYC_ATTESTATION_SCHEMA = "https://verite.id/definitions/schemas/0.0.1/KYCAMLAttestation"
export const CREDIT_SCORE_ATTESTATION_SCHEMA = "https://verite.id/definitions/schemas/0.0.1/CreditScoreAttestation"

export const kycAttestationSchema: CredentialSchema = {
  id: KYC_ATTESTATION_SCHEMA,
  type: "KYCAMLAttestation"
}

export const creditScoreAttestationSchema: CredentialSchema = {
  id: CREDIT_SCORE_ATTESTATION_SCHEMA,
  type: "CreditScoreAttestation"
}

export const unrecognizedAttestationSchema: CredentialSchema = {
  id: "https://verite.id/definitions/schemas/0.0.1/UnrecognizedSchema",
  type: "SomeUnknownAttestation"
}
