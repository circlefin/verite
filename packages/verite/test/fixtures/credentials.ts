import {
  attestationToVCSchema,
  CREDIT_SCORE_ATTESTATION,
  KYCAML_ATTESTATION
} from "../../lib"
import { CredentialSchema } from "../../types"

export const KYC_ATTESTATION_SCHEMA_VC_OBJ: CredentialSchema =
  attestationToVCSchema(KYCAML_ATTESTATION)
export const CREDIT_SCORE_ATTESTATION_SCHEMA_VC_OBJ: CredentialSchema =
  attestationToVCSchema(CREDIT_SCORE_ATTESTATION)
