import { UnsupportedChainIdError } from "@web3-react/core"
import {
  InjectedConnector,
  NoEthereumProviderError,
  UserRejectedRequestError
} from "@web3-react/injected-connector"

/**
 * Representats the supported ETH networks. For now, we only
 * want to support `hardhat` which is served from port 8545,
 * and is chainId `1337`. You can change it in the hardhat.config.js config file.
 *
 * Here's a list of network ids to use when deploying to other networks.
 * https://docs.metamask.io/guide/ethereum-provider.html#properties
 */
export const supportedChainIds = [
  /*
	1, // Mainet
	3, // Ropsten
	4, // Rinkeby
	5, // Goerli
	42, // Kovan
	*/
  1337 // Hardhat
]

/**
 * The connector for the etherum interface.
 */
export const injectedConnector = new InjectedConnector({ supportedChainIds })

/**
 * Get an error message from errors thrown by the ethereum provider
 */
export function getEthErrorMessage(error: Error): string {
  if (error instanceof NoEthereumProviderError) {
    return "No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile."
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network. Please set MetaMask to connect to localhost:8545."
  } else if (error instanceof UserRejectedRequestError) {
    return "Please authorize this website to access your Ethereum account."
  } else {
    console.error(error)
    return "An unknown error occurred. Check the console for more details."
  }
}

/**
 * Format an ethereum address for easier reading. This method lowercases
 * the address and adds an ellipsis to make it easier to read.
 */
export function formatEthAddress(address: string) {
  const lower = address.toLowerCase()

  return `${lower.slice(0, 6)}...${lower.slice(-4)}`
}
