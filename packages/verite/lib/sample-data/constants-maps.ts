import { AttestationTypes } from "../../types"
import {
  CREDIT_SCORE_CREDENTIAL_TYPE_NAME,
  KYBPAML_CREDENTIAL_TYPE_NAME,
  KYCAML_CREDENTIAL_TYPE_NAME,
  INDIV_ACC_INV_CREDENTIAL_TYPE_NAME,
  ENTITY_ACC_INV_CREDENTIAL_TYPE_NAME,
  ADDRESS_OWNER_CREDENTIAL_TYPE_NAME,
  COUNTERPARTY_ACCOUNT_HOLDER_CREDENTIAL_TYPE_NAME,
  CREDIT_SCORE_MANIFEST_ID,
  KYBPAML_MANIFEST_ID,
  KYCAML_MANIFEST_ID,
  INDIV_ACC_INV_MANIFEST_ID,
  ENTITY_ACC_INV_MANIFEST_ID,
  ADDRESS_OWNER_MANIFEST_ID,
  COUNTERPARTY_ACCOUNT_HOLDER_MANIFEST_ID,
  CREDIT_SCORE_PRESENTATION_DEFINITION_ID,
  KYBPAML_PRESENTATION_DEFINITION_ID,
  KYCAML_PRESENTATION_DEFINITION_ID,
  INDIV_ACC_INV_PRESENTATION_DEFINITION_ID,
  ENTITY_ACC_INV_PRESENTATION_DEFINITION_ID,
  ADDRESS_OWNER_PRESENTATION_DEFINITION_ID,
  COUNTERPARTY_ACCOUNT_HOLDER_PRESENTATION_DEFINITION_ID
} from "./constants"

const credentialTypeMap = new Map<AttestationTypes, string>([
  [AttestationTypes.CreditScoreAttestation, CREDIT_SCORE_CREDENTIAL_TYPE_NAME],
  [AttestationTypes.KYBPAMLAttestation, KYBPAML_CREDENTIAL_TYPE_NAME],
  [AttestationTypes.KYCAMLAttestation, KYCAML_CREDENTIAL_TYPE_NAME],
  [AttestationTypes.IndivAccInvAttestation, INDIV_ACC_INV_CREDENTIAL_TYPE_NAME],
  [
    AttestationTypes.EntityAccInvAttestation,
    ENTITY_ACC_INV_CREDENTIAL_TYPE_NAME
  ],
  [AttestationTypes.AddressOwner, ADDRESS_OWNER_CREDENTIAL_TYPE_NAME],
  [
    AttestationTypes.CounterpartyAccountHolder,
    COUNTERPARTY_ACCOUNT_HOLDER_CREDENTIAL_TYPE_NAME
  ]
])

const manifestIdMap = new Map<AttestationTypes, string>([
  [AttestationTypes.CreditScoreAttestation, CREDIT_SCORE_MANIFEST_ID],
  [AttestationTypes.KYBPAMLAttestation, KYBPAML_MANIFEST_ID],
  [AttestationTypes.KYCAMLAttestation, KYCAML_MANIFEST_ID],
  [AttestationTypes.IndivAccInvAttestation, INDIV_ACC_INV_MANIFEST_ID],
  [AttestationTypes.EntityAccInvAttestation, ENTITY_ACC_INV_MANIFEST_ID],
  [AttestationTypes.AddressOwner, ADDRESS_OWNER_MANIFEST_ID],
  [
    AttestationTypes.CounterpartyAccountHolder,
    COUNTERPARTY_ACCOUNT_HOLDER_MANIFEST_ID
  ]
])

const definitionIdMap = new Map<AttestationTypes, string>([
  [
    AttestationTypes.CreditScoreAttestation,
    CREDIT_SCORE_PRESENTATION_DEFINITION_ID
  ],
  [AttestationTypes.KYBPAMLAttestation, KYBPAML_PRESENTATION_DEFINITION_ID],
  [AttestationTypes.KYCAMLAttestation, KYCAML_PRESENTATION_DEFINITION_ID],
  [
    AttestationTypes.IndivAccInvAttestation,
    INDIV_ACC_INV_PRESENTATION_DEFINITION_ID
  ],
  [
    AttestationTypes.EntityAccInvAttestation,
    ENTITY_ACC_INV_PRESENTATION_DEFINITION_ID
  ],
  [AttestationTypes.AddressOwner, ADDRESS_OWNER_PRESENTATION_DEFINITION_ID],
  [
    AttestationTypes.CounterpartyAccountHolder,
    COUNTERPARTY_ACCOUNT_HOLDER_PRESENTATION_DEFINITION_ID
  ]
])

export function attestationToCredentialType(
  attestationType: AttestationTypes
): string {
  const result = credentialTypeMap.get(attestationType)
  if (result === undefined) {
    throw new Error(
      `No credential type found for attestation type ${attestationType}`
    )
  }
  return result
}

export function attestationToManifestId(
  attestationType: AttestationTypes
): string {
  const result = manifestIdMap.get(attestationType)
  if (result === undefined) {
    throw new Error(
      `No manifest ID found for attestation type ${attestationType}`
    )
  }
  return result
}

// TOFIX: need to handle hybrid manifests
export function manifestIdToAttestationType(
  manifestId: string
): AttestationTypes {
  for (const [attestationType, id] of manifestIdMap) {
    if (id === manifestId) {
      return attestationType
    }
  }
  throw new Error(`No attestation type found for manifest ID ${manifestId}`)
}

export function attestationToPresentationDefinitionId(
  attestationType: AttestationTypes
): string {
  const result = definitionIdMap.get(attestationType)
  if (result === undefined) {
    throw new Error(
      `No presentatiom definition ID found for attestation type ${attestationType}`
    )
  }
  return result
}
