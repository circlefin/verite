import {
  AttestationDefinition,
  AttestationTypes,
  CredentialSchema,
  ProcessAttestationType,
  AttestationType
} from "../../types"
import { ValidationError } from "../errors"

const VERITE_SCHEMAS_PREFIX_URI = "https://verite.id/definitions/schemas/0.0.1"
const VERITE_PROCESSES_PREFIX_URI = "https://verite.id/definitions/processes"

const ONE_MINUTE = 60 * 1000
const TWO_MONTHS = 2 * 30 * 24 * 60 * 60 * 1000

class AttestationDefinitionBuilder {
  _builder: Partial<AttestationDefinition>

  constructor() {
    this._builder = {}
  }

  attestation(
    attestation: AttestationType | ProcessAttestationType
  ): AttestationDefinitionBuilder {
    this._builder.attestation = attestation
    return this
  }

  revocable(revocable: boolean): AttestationDefinitionBuilder {
    this._builder.revocable = revocable
    return this
  }

  expirationTerm(expirationTerm: number): AttestationDefinitionBuilder {
    this._builder.expirationTerm = expirationTerm
    return this
  }

  schema(schema: string): AttestationDefinitionBuilder {
    this._builder.schema = schema
    return this
  }

  build(): AttestationDefinition {
    if (!this._builder.attestation) {
      throw new ValidationError("Attestation is required")
    }
    return this._builder as AttestationDefinition
  }
}

function buildProcessApprovalAttestationDefinition(
  attestationType: AttestationTypes,
  process: string,
  expirationTerm = TWO_MONTHS,
  isRevocable = true
): AttestationDefinition {
  return new AttestationDefinitionBuilder()
    .attestation({
      type: attestationType,
      process
    })
    .expirationTerm(expirationTerm)
    .schema(`${VERITE_SCHEMAS_PREFIX_URI}/${attestationType}`)
    .revocable(isRevocable)
    .build()
}

function buildAttestationDefinition(
  attestationType: AttestationTypes,
  expirationTerm = ONE_MINUTE,
  isRevocable = false
): AttestationDefinition {
  return new AttestationDefinitionBuilder()
    .attestation({
      type: attestationType
    })
    .expirationTerm(expirationTerm)
    .schema(`${VERITE_SCHEMAS_PREFIX_URI}/${attestationType}`)
    .revocable(isRevocable)
    .build()
}

const allAttestations = new Map<string, AttestationDefinition>([
  [
    AttestationTypes.KYCAMLAttestation,
    buildProcessApprovalAttestationDefinition(
      AttestationTypes.KYCAMLAttestation,
      `${VERITE_PROCESSES_PREFIX_URI}/kycaml/0.0.1/usa`
    )
  ],
  [
    AttestationTypes.KYBPAMLAttestation,
    buildProcessApprovalAttestationDefinition(
      AttestationTypes.KYBPAMLAttestation,
      `${VERITE_PROCESSES_PREFIX_URI}/kybpaml/0.0.1/usa`
    )
  ],
  [
    AttestationTypes.EntityAccInvAttestation,
    buildProcessApprovalAttestationDefinition(
      AttestationTypes.EntityAccInvAttestation,
      `${VERITE_PROCESSES_PREFIX_URI}/kycaml/0.0.1/generic--usa-entity-accinv-all-checks`
    )
  ],
  [
    AttestationTypes.IndivAccInvAttestation,
    buildProcessApprovalAttestationDefinition(
      AttestationTypes.IndivAccInvAttestation,
      `${VERITE_PROCESSES_PREFIX_URI}/kycaml/0.0.1/generic--usa-indiv-accinv-all-checks`
    )
  ],
  [
    AttestationTypes.CreditScoreAttestation,
    buildAttestationDefinition(AttestationTypes.CreditScoreAttestation)
  ],
  [
    AttestationTypes.AddressOwner,
    buildAttestationDefinition(AttestationTypes.AddressOwner)
  ],
  [
    AttestationTypes.CounterpartyAccountHolder,
    buildAttestationDefinition(AttestationTypes.CounterpartyAccountHolder)
  ]
])

export function getAttestionDefinition(
  attestationType: AttestationTypes
): AttestationDefinition {
  const attestationInfo = allAttestations.get(attestationType)
  if (!attestationInfo) {
    throw new ValidationError(
      "Unknown Attestation Name",
      `Unknown Attestation Name: ${attestationType}`
    )
  }
  return attestationInfo
}

export function getCredentialSchemaAsVCObject(
  attestationDefinition: AttestationDefinition
): CredentialSchema {
  return {
    id: attestationDefinition.schema,
    type: attestationDefinition.attestation.type
  }
}

export function attestationToVCSchema(
  attestationType: AttestationTypes
): CredentialSchema {
  return getCredentialSchemaAsVCObject(getAttestionDefinition(attestationType))
}
