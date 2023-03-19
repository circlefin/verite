import type { PostalAddress } from "schema-dts"

export enum AttestationTypes {
  KYCAMLAttestation = "KYCAMLAttestation",
  KYBPAMLAttestation = "KYBPAMLAttestation",
  EntityAccInvAttestation = "EntityAccInvAttestation",
  IndivAccInvAttestation = "IndivAccInvAttestation",
  CreditScoreAttestation = "CreditScoreAttestation",
  AddressOwner = "AddressOwner", // TOFIX: why is this inconsistent?
  CounterpartyAccountHolder = "CounterpartyAccountHolder"
}

export type AttestationType = {
  type: string
}

export type ProcessAttestationType = AttestationType & {
  process: string
}
/**
 * This is a union type for the possible types of attestations.
 */
export type Attestation =
  | KYCAMLAttestation
  | KYBPAMLAttestation
  | EntityAccInvAttestation
  | IndivAccInvAttestation
  | CreditScoreAttestation
  | AddressOwner
  | CounterpartyAccountHolder

export type ProcessApprovalAttestation = ProcessAttestationType & {
  approvalDate: string
}

export type KYCAMLAttestation = ProcessApprovalAttestation

export type KYBPAMLAttestation = ProcessApprovalAttestation

export type EntityAccInvAttestation = ProcessApprovalAttestation

export type IndivAccInvAttestation = ProcessApprovalAttestation

export type CreditScoreAttestation = AttestationType & {
  score: number
  scoreType: string
  provider: string
}

export type AddressOwner = AttestationType & {
  chain: string
  address: string
  proof: string
}

export type CounterpartyAccountHolder = AttestationType & {
  legalName: string
  address: Omit<PostalAddress, "@type"> & { type: "PostalAddress" }
  accountNumber: string
  accountSource?: string
  legalID?: string
}

export type AttestationDefinition = {
  attestation: AttestationType | ProcessAttestationType
  revocable: boolean
  schema: string
  expirationTerm?: number
}
