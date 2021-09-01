import { PendingTransaction } from "@prisma/client"
import useSWR from "swr"
import { KeyedMutator } from "swr/dist/types"
import { jsonFetch } from "../lib/utils"

type Data = {
  balance: string
  address: string
  pendingTransaction: PendingTransaction
}

type AccountSummary = {
  data: Data
  isLoading: boolean
  isError: boolean
  mutate: KeyedMutator<Record<string, unknown>>
}

export const useBalance = (): AccountSummary => {
  const { data, error, mutate } = useSWR(`/api/cefi/balance`, jsonFetch)

  return {
    data: data as Data,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}
