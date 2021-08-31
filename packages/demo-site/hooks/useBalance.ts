import useSWR from "swr"
import { jsonFetch } from "../lib/utils"

export const useBalance = () => {
  const { data, error, mutate } = useSWR(`/api/cefi/balance`, jsonFetch)

  return {
    balance: data,
    isLoading: !error && !data,
    isError: error,
    mutate
  }
}
