import { Web3Provider } from "@ethersproject/providers"
import { useWeb3React } from "@web3-react/core"
import { BigNumber } from "ethers"
import { FC } from "react"

import { formatEthAddress, getEthErrorMessage } from "../../../lib/eth-fns"
import Layout from "../../shared/Layout"

type Props = {
  balance?: BigNumber
  symbol?: string
}

const DappLayout: FC<Props> = ({ children, balance, symbol }) => {
  const { account, deactivate, error } = useWeb3React<Web3Provider>()

  if (error) {
    window.alert(getEthErrorMessage(error))
  }

  return (
    <Layout title="Demo: Dapp Requiring KYC">
      {balance && symbol && account && (
        <div className="flex flex-col-reverse justify-between mb-6 border-b border-gray-200 sm:flex-row">
          <nav
            className="flex justify-center -mb-px space-x-8"
            aria-label="Tabs"
          >
            <span className="px-1 py-4 text-sm font-medium text-gray-500 whitespace-nowrap ">
              Balance:
              <span className="ml-3 text-lg font-bold">
                {balance.toString()} {symbol}
              </span>
            </span>
          </nav>

          <div className="flex justify-between -mb-px space-x-8">
            <span className="flex items-center px-1 py-4 text-sm font-medium text-gray-500 whitespace-nowrap">
              {formatEthAddress(account)}
            </span>
            <button
              onClick={() => deactivate()}
              className="px-1 py-4 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}

      <div className="px-5 py-6 sm:px-6">{children}</div>
    </Layout>
  )
}

export default DappLayout
