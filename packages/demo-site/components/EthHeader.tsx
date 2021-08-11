import { Web3Provider } from "@ethersproject/providers"
import { useWeb3React } from "@web3-react/core"
import {
  InjectedConnector,
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from "@web3-react/injected-connector"

export const injectedConnector = new InjectedConnector({
  supportedChainIds: [
    1, // Mainet
    3, // Ropsten
    4, // Rinkeby
    5, // Goerli
    42 // Kovan
  ]
})

function getErrorMessage(error: Error) {
  if (error instanceof NoEthereumProviderError) {
    return "No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile."
    // } else if (error instanceof UnsupportedChainIdError) {
    //   return "You're connected to an unsupported network."
  } else if (error instanceof UserRejectedRequestErrorInjected) {
    return "Please authorize this website to access your Ethereum account."
  } else {
    console.error(error)
    return "An unknown error occurred. Check the console for more details."
  }
}

export default function Header(): JSX.Element {
  const { account, active, activate, deactivate, error } =
    useWeb3React<Web3Provider>()

  const onActivate = () => {
    activate(injectedConnector)
  }

  const onDeactivate = () => {
    deactivate()
  }

  return (
    <>
      <header>
        <h2>{active ? "🟢" : error ? "🔴" : "🟠"}</h2>
        {active ? (
          <>
            <span>{account}</span>
            <button onClick={onDeactivate}>Sign out</button>
          </>
        ) : (
          <button onClick={onActivate}>Activate</button>
        )}
        {error && <div>{getErrorMessage(error)}</div>}
      </header>
    </>
  )
}
