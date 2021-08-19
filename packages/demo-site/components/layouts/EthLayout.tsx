import { Web3Provider } from "@ethersproject/providers"
import { useWeb3React } from "@web3-react/core"
import { FC } from "react"
import {
  formatEthAddress,
  getEthErrorMessage,
  injectedConnector
} from "../../lib/eth-fns"
import { HeaderProps } from "../Header"
import BaseLayout from "./BaseLayout"

type Props = HeaderProps & {
  noPadding?: boolean
}

const EthLayout: FC<Props> = ({ children, ...props }) => {
  const { account, active, activate, deactivate, error } =
    useWeb3React<Web3Provider>()

  if (error) {
    window.alert(getEthErrorMessage(error))
  }

  const authSection = (
    <>
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
          className="px-3 py-1 text-sm font-medium text-gray-300 rounded-md hover:bg-blue-700 hover:text-white"
          onClick={() => {
            activate(injectedConnector)
          }}
        >
          Connect Wallet
        </button>
      )}
    </>
  )

  return (
    <BaseLayout authSection={authSection} {...props}>
      {children}
    </BaseLayout>
  )
}

export default EthLayout
