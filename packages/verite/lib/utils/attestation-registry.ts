import { ValidationError } from "../errors"

const VERITE_SCHEMAS_PREFIX_URI =
  "https://verite.id/definitions/schemas/0.0.1"
const VERITE_PROCESSES_PREFIX_URI =
  "https://verite.id/definitions/processes"

  // Known Attestations
export const KYCAML_ATTESTATION = "KYCAMLAttestation"
export const KYBPAML_ATTESTATION = "KYBPAMLAttestation"
export const CREDIT_SCORE_ATTESTATION = "CreditScoreAttestation"
export const ENTITY_ACC_INV_ATTESTATION = "EntityAccInvAttestation"
export const INDIV_ACC_INV_ATTESTATION = "IndivAccInvAttestation"
export const ADDRESS_OWNER_ATTESTATION = "AddressOwnerAttestation"
export const COUNTERPARTY_ACCOUNT_HOLDER_ATTESTATION =
  "CounterpartyAccountHolder"

function instantiate(
  attestationName: string,
  process?: string
): AttestationDefinition {
  return {
    type: `${attestationName}`,
    schema: `${VERITE_SCHEMAS_PREFIX_URI}/${attestationName}`,
    ...(process && { process: process })
  }
}

export type AttestationDefinition = {
  type: string
  schema: string
  process?: string
}


const allAttestations = new Map<string, AttestationDefinition>([
  [
    KYCAML_ATTESTATION,
    instantiate(KYCAML_ATTESTATION, `${VERITE_PROCESSES_PREFIX_URI}/kycaml/0.0.1/usa`)
  ],
  [
    ENTITY_ACC_INV_ATTESTATION,
    instantiate(
      ENTITY_ACC_INV_ATTESTATION,
      `${VERITE_PROCESSES_PREFIX_URI}/kycaml/0.0.1/generic--usa-entity-accinv-all-checks`
    )
  ],
  [
    INDIV_ACC_INV_ATTESTATION,
    instantiate(
      INDIV_ACC_INV_ATTESTATION,
      `${VERITE_PROCESSES_PREFIX_URI}}/kycaml/0.0.1/generic--usa-indiv-accinv-all-checks`
    )
  ],
  [CREDIT_SCORE_ATTESTATION, instantiate(CREDIT_SCORE_ATTESTATION)],
  [ADDRESS_OWNER_ATTESTATION, instantiate(ADDRESS_OWNER_ATTESTATION)],
  [
    COUNTERPARTY_ACCOUNT_HOLDER_ATTESTATION,
    instantiate(COUNTERPARTY_ACCOUNT_HOLDER_ATTESTATION)
  ]
])

export function getAttestionDefinition(
  attestationName: string
): AttestationDefinition {
  const attestationInfo = allAttestations.get(attestationName)
  if (!attestationInfo) {
    throw new ValidationError(
      "Unknown Attestation Name",
      `Unknown Attestation Name: ${attestationName}`
    )
  }
  return attestationInfo
}
