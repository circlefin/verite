import type { PostalAddress } from "schema-dts"

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

export type ProcessApprovalAttestation = {
  type: string
  process: string
  approvalDate: string
}

export type KYCAMLAttestation = ProcessApprovalAttestation

export type KYBPAMLAttestation = ProcessApprovalAttestation

export type EntityAccInvAttestation = ProcessApprovalAttestation

export type IndivAccInvAttestation = ProcessApprovalAttestation

export type CreditScoreAttestation = {
  type: string
  score: number
  scoreType: string
  provider: string
}

export type AddressOwner = {
  type: string
  chain: string
  address: string
  proof: string
}

export type CounterpartyAccountHolder = {
  type: string
  legalName: string
  address: Omit<PostalAddress, "@type"> & { type: "PostalAddress" }
  accountNumber: string
  accountSource?: string
  legalID?: string
}
