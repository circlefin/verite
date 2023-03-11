import { attestationToVCSchema } from "../../lib"
import { AttestationTypes, CredentialSchema } from "../../types"

export const KYC_VC_SCHEMA: CredentialSchema = attestationToVCSchema(
  AttestationTypes.KYCAMLAttestation
)
export const CREDIT_SCORE_VC_SCHEMA: CredentialSchema = attestationToVCSchema(
  AttestationTypes.CreditScoreAttestation
)
