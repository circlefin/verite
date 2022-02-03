import { Web3Provider } from "@ethersproject/providers"
import { useWeb3React } from "@web3-react/core"
import { FC } from "react"

import { formatEthAddress, getEthErrorMessage } from "../../../lib/eth-fns"
import Layout from "../../shared/Layout"

const DappLayout: FC = ({ children }) => {
  const { account, deactivate, error } = useWeb3React<Web3Provider>()

  if (error) {
    window.alert(getEthErrorMessage(error))
  }

  return (
    <Layout title="Demo: Permissioned Pool Requiring KYC">
      {account && (
        <div className="flex flex-col-reverse justify-end mb-6 border-b border-gray-200 sm:flex-row">
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

      <div className="py-0">{children}</div>
    </Layout>
  )
}

export default DappLayout
