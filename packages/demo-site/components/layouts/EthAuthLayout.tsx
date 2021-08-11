import { Web3Provider } from "@ethersproject/providers"
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core"
import {
  InjectedConnector,
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from "@web3-react/injected-connector"
import { FC } from "react"
import Header, { HeaderProps } from "../Header"

export const injectedConnector = new InjectedConnector({
  supportedChainIds: [
    1, // Mainet
    3, // Ropsten
    4, // Rinkeby
    5, // Goerli
    42, // Kovan
    1337 // Hardhat
  ]
})

function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return "No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile."
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network."
  } else if (error instanceof UserRejectedRequestErrorInjected) {
    return "Please authorize this website to access your Ethereum account."
  } else {
    console.error(error)
    return "An unknown error occurred. Check the console for more details."
  }
}

function formatEthAddress(address: string) {
  const lower = address.toLowerCase()

  return `${lower.slice(0, 6)}...${lower.slice(-4)}`
}

const Layout: FC<HeaderProps> = ({ children, ...headerProps }) => {
  const { account, active, activate, deactivate, error } =
    useWeb3React<Web3Provider>()

  const onActivate = () => {
    activate(injectedConnector)
  }

  const onDeactivate = () => {
    deactivate()
  }

  if (error) {
    window.alert(getErrorMessage(error))
  }

  return (
    <div className="text-base antialiased text-black bg-white font-inter font-feature-default">
      <Header {...headerProps}>
        {active ? (
          <>
            <span className="hidden px-3 py-3 text-sm font-medium text-gray-300 rounded-md sm:inline">
              {formatEthAddress(account)}
            </span>
            <button
              className="px-3 py-1 text-sm font-medium text-gray-300 rounded-md hover:bg-blue-700 hover:text-white"
              onClick={onDeactivate}
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            className="px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-blue-700 hover:text-white"
            onClick={onActivate}
          >
            Connect Wallet
          </button>
        )}
      </Header>
      <main className="-mt-32">
        <div className="max-w-3xl px-4 pb-12 mx-auto sm:px-6 lg:px-8">
          <div className="px-5 py-6 bg-white rounded-lg shadow sm:px-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Layout
