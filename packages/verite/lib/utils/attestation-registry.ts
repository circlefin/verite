import {
  AttestationDefinition,
  AttestationTypes,
  CredentialSchema
} from "../../types"
import { ValidationError } from "../errors"

const VERITE_SCHEMAS_PREFIX_URI = "https://verite.id/definitions/schemas/0.0.1"
const VERITE_PROCESSES_PREFIX_URI = "https://verite.id/definitions/processes"

function instantiate(
  attestationName: string,
  process?: string
): AttestationDefinition {
  return {
    attestation: {
      type: `${attestationName}`,
      ...(process && { process: process })
    },
    schema: `${VERITE_SCHEMAS_PREFIX_URI}/${attestationName}`
  }
}

const allAttestations = new Map<string, AttestationDefinition>([
  [
    AttestationTypes.KYCAMLAttestation,
    instantiate(
      AttestationTypes.KYCAMLAttestation,
      `${VERITE_PROCESSES_PREFIX_URI}/kycaml/0.0.1/usa`
    )
  ],
  [
    AttestationTypes.KYBPAMLAttestation,
    instantiate(
      AttestationTypes.KYBPAMLAttestation,
      `${VERITE_PROCESSES_PREFIX_URI}/kybpaml/0.0.1/usa`
    )
  ],
  [
    AttestationTypes.EntityAccInvAttestation,
    instantiate(
      AttestationTypes.EntityAccInvAttestation,
      `${VERITE_PROCESSES_PREFIX_URI}/kycaml/0.0.1/generic--usa-entity-accinv-all-checks`
    )
  ],
  [
    AttestationTypes.IndivAccInvAttestation,
    instantiate(
      AttestationTypes.IndivAccInvAttestation,
      `${VERITE_PROCESSES_PREFIX_URI}/kycaml/0.0.1/generic--usa-indiv-accinv-all-checks`
    )
  ],
  [
    AttestationTypes.CreditScoreAttestation,
    instantiate(AttestationTypes.CreditScoreAttestation)
  ],
  [AttestationTypes.AddressOwner, instantiate(AttestationTypes.AddressOwner)],
  [
    AttestationTypes.CounterpartyAccountHolder,
    instantiate(AttestationTypes.CounterpartyAccountHolder)
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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    type: attestationDefinition.attestation.type!
  }
}

export function attestationToVCSchema(
  attestationType: AttestationTypes
): CredentialSchema {
  return getCredentialSchemaAsVCObject(getAttestionDefinition(attestationType))
}
