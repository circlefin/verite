import { CredentialSchema } from "../../types"
import { ValidationError } from "../errors"
import {
  ADDRESS_OWNER_ATTESTATION,
  COUNTERPARTY_ACCOUNT_HOLDER_ATTESTATION,
  CREDIT_SCORE_ATTESTATION,
  ENTITY_ACC_INV_ATTESTATION,
  INDIV_ACC_INV_ATTESTATION,
  KYCAML_ATTESTATION
} from "./constants"

export const VERITE_SCHEMAS_PREFIX_URI =
  "https://verite.id/definitions/schemas/0.0.1"
export const VERITE_PROCESSES_PREFIX_URI =
  "https://verite.id/definitions/processes"
export const KYCAML_USA_PROCESS_DEFINITION_URI = `${VERITE_PROCESSES_PREFIX_URI}/kycaml/0.0.1/usa`
export const ACCINV_ENTITY_USA_PROCESS_DEFINITION_URI = `${VERITE_PROCESSES_PREFIX_URI}/kycaml/0.0.1/generic--usa-entity-accinv-all-checks`
export const ACCINV_IND_USA_PROCESS_DEFINITION_URI = `${VERITE_PROCESSES_PREFIX_URI}}/kycaml/0.0.1/generic--usa-indiv-accinv-all-checks`

function instantiate(
  attestationName: string,
  process?: string
): AttestationInfo {
  return {
    type: `${attestationName}`,
    schema: `${VERITE_SCHEMAS_PREFIX_URI}/${attestationName}`,
    ...(process && { process: process })
  }
}

export type AttestationInfo = {
  type: string
  schema: string
  process?: string
}

const allAttestations = new Map<string, AttestationInfo>([
  [
    KYCAML_ATTESTATION,
    instantiate(KYCAML_ATTESTATION, KYCAML_USA_PROCESS_DEFINITION_URI)
  ],
  [
    ENTITY_ACC_INV_ATTESTATION,
    instantiate(
      ENTITY_ACC_INV_ATTESTATION,
      ACCINV_ENTITY_USA_PROCESS_DEFINITION_URI
    )
  ],
  [
    INDIV_ACC_INV_ATTESTATION,
    instantiate(
      INDIV_ACC_INV_ATTESTATION,
      ACCINV_IND_USA_PROCESS_DEFINITION_URI
    )
  ],
  [CREDIT_SCORE_ATTESTATION, instantiate(CREDIT_SCORE_ATTESTATION)],
  [ADDRESS_OWNER_ATTESTATION, instantiate(ADDRESS_OWNER_ATTESTATION)],
  [
    COUNTERPARTY_ACCOUNT_HOLDER_ATTESTATION,
    instantiate(COUNTERPARTY_ACCOUNT_HOLDER_ATTESTATION)
  ]
])

export function getAttestionInformation(
  attestationName: string
): AttestationInfo {
  const attestationInfo = allAttestations.get(attestationName)
  if (!attestationInfo) {
    throw new ValidationError(
      "Unknown Attestation Name",
      `Unknown Attestation Name: ${attestationName}`
    )
  }
  return attestationInfo
}

export function getCredentialSchemaAsVCObject(
  attestationName: string
): CredentialSchema {
  const attestationInfo = getAttestionInformation(attestationName)
  return {
    id: attestationInfo.schema,
    type: attestationInfo.type
  }
}

export const KYC_ATTESTATION_SCHEMA_URI =
  getAttestionInformation(KYCAML_ATTESTATION).schema
export const CREDIT_SCORE_ATTESTATION_SCHEMA_URI = getAttestionInformation(
  CREDIT_SCORE_ATTESTATION
).schema

export const KYC_ATTESTATION_SCHEMA_VC_OBJ: CredentialSchema =
  getCredentialSchemaAsVCObject(KYCAML_ATTESTATION)
export const CREDIT_SCORE_ATTESTATION_SCHEMA_VC_OBJ: CredentialSchema =
  getCredentialSchemaAsVCObject(CREDIT_SCORE_ATTESTATION)
