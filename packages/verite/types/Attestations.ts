import type { Person } from "schema-dts"

export type KYCAMLAttestation = {
  "type": "KYCAMLAttestation"
  process: string
  approvalDate: string
}

export type CreditScoreAttestation = {
  "type": "CreditScoreAttestation"
  score: number
  scoreType: string
  provider: string
}

export type AddressOwner = {
  "type": "AddressOwner"
  chain: string
  address: string
  proof: string
}

export type CounterpartyAccountHolder = Person & {
  accountNumber: string
  accountSource: string
}
