import type {
  ProcessApprovalAttestation
} from "../../types"

const typeMap = new Map<string, string>([
  ["KYCAMLAttestation", "KYCAMLCredential"],
  ["KYBPAMLAttestation", "KYBPAMLCredential"],
  ["CreditScoreAttestation", "CreditScoreCredential"],
  ["AddressOwner", "AddressOwnerCredential"],
  ["CounterpartyAccountHolder", "CounterpartyAccountHolderCredential"]
])

export type KnownProcessApprovalAttestation = Omit<ProcessApprovalAttestation, "approvalDate"> & { schema: string }

function instantiate(attestationName: string, process: string): KnownProcessApprovalAttestation {
  return {     
    type: `${attestationName}`,
    process: process,
    schema: `https://verite.id/definitions/schemas/0.0.1/${attestationName}`
  }
}

const processApprovalMap = new Map<string, KnownProcessApprovalAttestation>([
  ["KYCAMLAttestation", instantiate("KYCAMLAttestation", "https://verite.id/definitions/processes/kycaml/0.0.1/usa")],
  ["EntityAccInvAttestation", instantiate("EntityAccInvAttestation", "https://verite.id/definitions/processes/kycaml/0.0.1/generic--usa-entity-accinv-all-checks")],
  ["IndivAccInvAttestation", instantiate("IndivAccInvAttestation", "https://verite.id/definitions/processes/kycaml/0.0.1/generic--usa-indiv-accinv-all-checks")],
])

export function getKnownProcessApprovalAttestations(): Map<string, KnownProcessApprovalAttestation> {
  return processApprovalMap
}

// TODO: non-normative
export function attestationToCredentialType(attestationType: string): string[] {
  const types = ["VerifiableCredential"]
  const result = typeMap.get(attestationType)
  if (result) {
    types.push(result)
  }
  return types
}