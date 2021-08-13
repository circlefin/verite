import { Web3Provider } from "@ethersproject/providers"
import { useWeb3React } from "@web3-react/core"
import { FC } from "react"
import { injectedConnector } from "../../lib/eth-fns"
import NetworkErrorMessage from "./NetworkErrorMessage"

export type ConnectProps = {
  networkError: string
  dismiss: React.MouseEventHandler
}

const ConnectWallet: FC<ConnectProps> = ({ networkError, dismiss }) => {
  const { activate } = useWeb3React<Web3Provider>()

  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className="text-center col-12">
          {/* Metamask network should be set to Localhost:8545. */}
          {networkError && (
            <NetworkErrorMessage message={networkError} dismiss={dismiss} />
          )}
        </div>
        <div className="p-4 text-center col-6">
          <p>Please connect to your wallet.</p>
          <button
            className="btn btn-warning"
            type="button"
            onClick={() => {
              activate(injectedConnector)
            }}
          >
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConnectWallet
