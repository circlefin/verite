import {
  CREDIT_SCORE_ATTESTATION,
  getAttestionDefinition,
  getCredentialSchemaAsVCObject,
  KYCAML_ATTESTATION
} from "../../lib"
import { CredentialSchema } from "../../types"

export const KYC_ATTESTATION_SCHEMA_VC_OBJ: CredentialSchema =
  getCredentialSchemaAsVCObject(getAttestionDefinition(KYCAML_ATTESTATION))
export const CREDIT_SCORE_ATTESTATION_SCHEMA_VC_OBJ: CredentialSchema =
  getCredentialSchemaAsVCObject(
    getAttestionDefinition(CREDIT_SCORE_ATTESTATION)
  )
