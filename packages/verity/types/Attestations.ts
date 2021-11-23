import type { Person } from "schema-dts"

export type KYCAMLAttestation = {
  "@type": "KYCAMLAttestation"
  authorityId: string
  approvalDate: string
  authorityName?: string
  authorityUrl?: string
  authorityCallbackUrl?: string
}

export type CreditScoreAttestation = {
  "@type": "CreditScoreAttestation"
  score: number
  scoreType: string
  provider: string
  historyStartDate?: string
  paymentHistoryPercentage?: string
  openAccounts?: number
  utilization?: number
  addressOwner?: AddressOwner[]
}

export type AddressOwner = {
  "@type": "AddressOwner"
  chain: string
  address: string
  proof: string
}

export type CounterpartyPerson = Person & {
  accountNumber: string
  accountSource: string
}
