import type { PostalAddress } from "schema-dts"

/**
 * This is a union type for the possible types of attestations.
 */
export type Attestation =
  | KYCAMLAttestation
  | KYBPAMLAttestation
  | CreditScoreAttestation
  | AddressOwner
  | CounterpartyAccountHolder

export type KYCAMLAttestation = {
  type: "KYCAMLAttestation"
  process: string
  approvalDate: string
}

export type KYBPAMLAttestation = {
  type: "KYBPAMLAttestation"
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
  type: "AddressOwner"
  chain: string
  address: string
  proof: string
}

export type CounterpartyAccountHolder = {
  type: "CounterpartyAccountHolder"
  legalName: string
  address: Omit<PostalAddress, "@type"> & { type: "PostalAddress" }
  accountNumber: string
  accountSource?: string
  legalID?: string
}
