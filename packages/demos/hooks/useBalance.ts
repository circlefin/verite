import { BigNumber } from "@ethersproject/bignumber"
import { PendingReceive, PendingSend } from "@prisma/client"
import useSWR from "swr"
import { KeyedMutator } from "swr/dist/types"
import { History } from "../lib/database/prisma"
import { jsonFetch } from "../lib/utils"

type Data = {
  balance: string
  address: string
  history: History[]
  pendingReceive: PendingReceive
  pendingSend: PendingSend
}

type AccountSummary = {
  data: Data
  accountBalance: BigNumber
  isLoading: boolean
  isError: boolean
  mutate: KeyedMutator<Record<string, unknown>>
}

export const useBalance = (): AccountSummary => {
  const { data, error, mutate } = useSWR(`/api/demos/cefi/balance`, jsonFetch, {
    refreshInterval: 2000
  })

  const accountBalance = BigNumber.from(data?.balance || 0)

  return {
    data: data as Data,
    accountBalance,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}
