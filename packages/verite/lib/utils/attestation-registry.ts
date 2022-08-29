import { ValidationError } from "../errors"
import { ACCINV_IND_USA_PROCESS_DEFINITION, ACCINV_ENTITY_USA_PROCESS_DEFINITION, ADDRESS_OWNER_ATTESTATION, COUNTERPARTY_ACCOUNT_HOLDER_ATTESTATION, CREDIT_SCORE_ATTESTATION, ENTITY_ACC_INV_ATTESTATION, INDIV_ACC_INV_ATTESTATION, KYCAML_ATTESTATION, KYCAML_USA_PROCESS_DEFINITION, VERITE_SCHEMAS_PREFIX } from "./constants"

function instantiate(attestationName: string, process?: string): KnownAttestationInfo {
  return {     
    type: `${attestationName}`,
    schema: `${VERITE_SCHEMAS_PREFIX}/${attestationName}`,
      ...(process && {process: process})
  }
}

export type KnownAttestationInfo = {   
    type: string,
    schema: string,
    process?: string
}


const allAttestations = new Map<string, KnownAttestationInfo>([
  [KYCAML_ATTESTATION, instantiate(KYCAML_ATTESTATION, KYCAML_USA_PROCESS_DEFINITION)],
  [ENTITY_ACC_INV_ATTESTATION, instantiate(ENTITY_ACC_INV_ATTESTATION, ACCINV_ENTITY_USA_PROCESS_DEFINITION)],
  [INDIV_ACC_INV_ATTESTATION, instantiate(INDIV_ACC_INV_ATTESTATION, ACCINV_IND_USA_PROCESS_DEFINITION)],
  [CREDIT_SCORE_ATTESTATION, instantiate(CREDIT_SCORE_ATTESTATION)],
  [ADDRESS_OWNER_ATTESTATION, instantiate(ADDRESS_OWNER_ATTESTATION)],
  [COUNTERPARTY_ACCOUNT_HOLDER_ATTESTATION, instantiate(COUNTERPARTY_ACCOUNT_HOLDER_ATTESTATION)],
])

export function getAttestionInformation(attestationName: string): KnownAttestationInfo {
  const attestationInfo = allAttestations.get(attestationName)
  if (!attestationInfo) {
    throw new ValidationError(
      "Unknown Attestation Name",
      `Unknown Attestation Name: ${attestationName}`
    )
  }
  return attestationInfo
}
