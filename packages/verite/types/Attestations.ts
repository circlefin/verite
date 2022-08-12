import type { PostalAddress } from "schema-dts"

/**
 * This is a union type for the possible types of attestations.
 */
export type Attestation =
  | ProcessApprovalAttestation
  | CreditScoreAttestation
  | AddressOwner
  | CounterpartyAccountHolder

export type ProcessApprovalAttestation = {
  type: string
  process: string
  approvalDate: string
}

export type CreditScoreAttestation = {
  type: "CreditScoreAttestation"
  score: number
  scoreType: string
  provider: string
}

export type AddressOwner = {
  type: "AddressOwnerAttestation"
  chain: string
  address: string
  proof: string
}

export type CounterpartyAccountHolder = {
  type: "CounterpartyAccountHolderAttestation"
  legalName: string
  address: Omit<PostalAddress, "@type"> & { type: "PostalAddress" }
  accountNumber: string
  accountSource?: string
  legalID?: string
}
