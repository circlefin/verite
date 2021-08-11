import { Web3Provider } from "@ethersproject/providers"
import { Web3ReactProvider } from "@web3-react/core"
import { FC } from "react"
import EthHeader from "../EthHeader"
import Header, { HeaderProps } from "../Header"

function getLibrary(provider): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

const Layout: FC<HeaderProps> = ({ children, ...headerProps }) => {
  return (
    <>
      <Web3ReactProvider getLibrary={getLibrary}>
        <div className="text-base antialiased text-black bg-white font-inter font-feature-default">
          <Header {...headerProps}>
            <EthHeader />
          </Header>
          <main className="-mt-32">
            <div className="max-w-3xl px-4 pb-12 mx-auto sm:px-6 lg:px-8">
              <div className="px-5 py-6 bg-white rounded-lg shadow sm:px-6">
                {children}
              </div>
            </div>
          </main>
        </div>
      </Web3ReactProvider>
    </>
  )
}

export default Layout
