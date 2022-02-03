import { Web3Provider } from "@ethersproject/providers"
import { PlusIcon } from "@heroicons/react/solid"
import { useWeb3React } from "@web3-react/core"
import { FC } from "react"

import { injectedConnector } from "../../../lib/eth-fns"

const ConnectWallet: FC = () => {
  const { activate } = useWeb3React<Web3Provider>()

  return (
    <div className="text-center">
      <svg
        className="w-12 h-12 mx-auto text-gray-400"
        viewBox="0 0 231 231"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M80 128H152M116 92V164M72 32H144L168 56M8 176V56C8 49.6348 10.5286 43.5303 15.0294 39.0294C19.5303 34.5286 25.6348 32 32 32H68H104L128 56H200C206.365 56 212.47 58.5286 216.971 63.0294C221.471 67.5303 224 73.6348 224 80V176C224 182.365 221.471 188.47 216.971 192.971C212.47 197.471 206.365 200 200 200H32C25.6348 200 19.5303 197.471 15.0294 192.971C10.5286 188.47 8 182.365 8 176Z"
          stroke="black"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <h3 className="mt-2 text-sm font-medium text-gray-900">
        Connect your wallet
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        Connect your wallet to interact with this Dapp.
      </p>
      <p className="mt-1 text-sm text-gray-500">
        For this demo, ensure MetaMask is connected to{" "}
        <span className="font-mono font-bold">
          {process.env.NEXT_PUBLIC_ETH_NETWORK_NAME}
        </span>
      </p>
      <div className="mt-6">
        <button
          onClick={() => activate(injectedConnector)}
          type="button"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="w-5 h-5 mr-2 -ml-1" aria-hidden="true" />
          Connect Wallet
        </button>
      </div>
    </div>
  )
}

export default ConnectWallet
