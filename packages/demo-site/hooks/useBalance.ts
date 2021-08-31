import { Contract, getDefaultProvider } from "ethers"
import useSWR from "swr"
import TokenArtifact from "../contracts/Token.json"
import ContractAddress from "../contracts/contract-address.json"
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

const fetcher = async (key) => {
  const provider = getDefaultProvider("http://localhost:8545")

  const contract = new Contract(
    ContractAddress.Token,
    TokenArtifact.abi,
    provider
  )
  const name = await contract.name()
  const symbol = await contract.symbol()
  const balance = await contract["balanceOf"](key)
  return {
    name,
    symbol,
    balance
  }
}

export const useEthBalance = (address) => {
  const { data, error } = useSWR(address, fetcher)

  return {
    data
  }
}
