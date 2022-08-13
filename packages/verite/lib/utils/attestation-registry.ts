import { ValidationError } from "../errors"

export const KYCAML_ATTESTATION = "KYCAMLAttestation"
export const KYBPAML_ATTESTATION = "KYBPAMLAttestation"
export const CREDIT_SCORE_ATTESTATION = "CreditScoreAttestation"
export const ENTITY_ACC_INV_ATTESTATION = "EntityAccInvAttestation"
export const INDIV_ACC_INV_ATTESTATION = "IndivAccInvAttestation"
export const ADDRESS_OWNER_ATTESTATION = "AddressOwnerAttestation"
export const COUNTERPARTY_ACCOUNT_HOLDER_ATTESTATION = "CounterpartyAccountHolder"

export const VERIFIABLE_CREDENTIAL = "VerifiableCredential"

export const VERITE_SCHEMAS_PREFIX = "https://verite.id/definitions/schemas/0.0.1"
export const VERITE_PROCESSES_PREFIX = "https://verite.id/definitions/processes"

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
  [KYCAML_ATTESTATION, instantiate(KYCAML_ATTESTATION, `${VERITE_PROCESSES_PREFIX}/kycaml/0.0.1/usa`)],
  [ENTITY_ACC_INV_ATTESTATION, instantiate(ENTITY_ACC_INV_ATTESTATION, `${VERITE_PROCESSES_PREFIX}/kycaml/0.0.1/generic--usa-entity-accinv-all-checks`)],
  [INDIV_ACC_INV_ATTESTATION, instantiate(INDIV_ACC_INV_ATTESTATION, `${VERITE_PROCESSES_PREFIX}}/kycaml/0.0.1/generic--usa-indiv-accinv-all-checks`)],
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
