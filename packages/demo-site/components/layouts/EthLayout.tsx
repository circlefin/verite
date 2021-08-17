import { Web3Provider } from "@ethersproject/providers"
import { useWeb3React } from "@web3-react/core"
import { FC } from "react"
import {
  formatEthAddress,
  getEthErrorMessage,
  injectedConnector
} from "../../lib/eth-fns"
import Header, { HeaderProps } from "../Header"

type Props = HeaderProps & {
  noPadding?: boolean
}

const Layout: FC<Props> = ({ children, noPadding, ...headerProps }) => {
  const { account, active, activate, deactivate, error } =
    useWeb3React<Web3Provider>()

  if (error) {
    window.alert(getEthErrorMessage(error))
  }

  const bodyPadding = noPadding ? "" : "px-5 py-6 sm:px-6"

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
              onClick={() => {
                deactivate()
              }}
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            className="text-sm font-medium text-gray-300 rounded-md hover:bg-blue-700 hover:text-white"
            onClick={() => {
              activate(injectedConnector)
            }}
          >
            Connect Wallet
          </button>
        )}
      </Header>
      <main className="-mt-32">
        <div className="max-w-3xl px-4 pb-12 mx-auto sm:px-6 lg:px-8">
          <div
            className={`bg-white rounded-lg shadow ${bodyPadding} overflow-hidden`}
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Layout
