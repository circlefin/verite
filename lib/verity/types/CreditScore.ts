import { ChainAddressOwner } from "./ChainAddressOwner"

export type CreditScore = {
  "@type": "CreditScore"
  score: number
  scoreType: string
  provider: string
  historyStartDate?: string
  paymentHistoryPercentage?: string
  openAccounts?: number
  utilization?: number
  chainAddressOwner?: ChainAddressOwner[]
}
