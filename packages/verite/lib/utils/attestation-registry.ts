import { ValidationError } from "../errors"

function instantiate1(attestationName: string): KnownAttestationInfo {
  return {     
    type: `${attestationName}`,
    schema: `https://verite.id/definitions/schemas/0.0.1/${attestationName}`,
  }
}

function instantiate(attestationName: string, process: string): KnownAttestationInfo {
  return {     
    type: `${attestationName}`,
    schema: `https://verite.id/definitions/schemas/0.0.1/${attestationName}`,
    process: process
  }
}

export type KnownAttestationInfo = {   
    type: string,
    schema: string,
    process?: string
}

const allAttestations = new Map<string, KnownAttestationInfo>([
  ["KYCAMLAttestation", instantiate("KYCAMLAttestation", "https://verite.id/definitions/processes/kycaml/0.0.1/usa")],
  ["EntityAccInvAttestation", instantiate("EntityAccInvAttestation", "https://verite.id/definitions/processes/kycaml/0.0.1/generic--usa-entity-accinv-all-checks")],
  ["IndivAccInvAttestation", instantiate("IndivAccInvAttestation", "https://verite.id/definitions/processes/kycaml/0.0.1/generic--usa-indiv-accinv-all-checks")],
  ["CreditScoreAttestation", instantiate1("CreditScoreAttestation")],
  ["AddressOwnerAttestation", instantiate1("AddressOwnerAttestation")],
  ["CounterpartyAccountHolder", instantiate1("CounterpartyAccountHolder")],
])


export function getKnownProcessApprovalAttestations(): Map<string, KnownAttestationInfo> {
  return allAttestations
}

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

// TODO: non-normative
export function attestationToCredentialType(attestationType: string): string[] {
  const types = ["VerifiableCredential"]
  const result = typeMap.get(attestationType)
  if (result) {
    types.push(result)
  }
  return types
}

// TODO: non-normative
export function credentialTypeToAttestations(credentialType: string): KnownAttestationInfo[] {
  const attestationType = credentialToAttestationMap.get(credentialType)
  if (!attestationType) {
    throw new ValidationError(
      "Unknown Credential Type",
      `Unknown Credential Type: ${credentialType}`
    )
  }
  const attrs = (!Array.isArray(attestationType)) ? [attestationType] : attestationType
  return attrs.map((a) => getAttestionInformation(a))
}


const typeMap = new Map<string, string>([
  ["KYCAMLAttestation", "KYCAMLCredential"],
  ["KYBPAMLAttestation", "KYBPAMLCredential"],
  ["CreditScoreAttestation", "CreditScoreCredential"],
  ["AddressOwnerAttestation", "AddressOwnerCredential"],
  ["CounterpartyAccountHolderAttestation", "CounterpartyAccountHolderCredential"]
])

const credentialToAttestationMap = new Map<string, string | string[]>([
  ["KYCAMLCredential", "KYCAMLAttestation"],
  ["KYBPAMLCredential", "KYBPAMLAttestation"],
  ["CreditScoreCredential", "CreditScoreAttestation"],
  ["AddressOwnerCredential", "AddressOwnerAttestation"],
  ["CounterpartyAccountHolderCredential", "CounterpartyAccountHolderAttestation"]
])
