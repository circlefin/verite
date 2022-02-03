import { Web3Provider } from "@ethersproject/providers"
import { Wallet } from "@ethersproject/wallet"
import { useWeb3React } from "@web3-react/core"
import { NextPage } from "next"
import React from "react"

import ConnectWallet from "../../../components/demos/dapp/ConnectWallet"
import DappLayout from "../../../components/demos/dapp/Layout"
import Demo6 from "../../../components/demos/demo6/Demo6"

type ServerProps = {
  props: {
    verifierAddress: string
  }
}

// Only environment variables prefixed with NEXT_PUBLIC_ are available to
// the client. Private keys should not be made public, so to encourage good
// habits, we'll generate the Verifier's address on the server, and pass the
// value to our app as a Prop.
export const getServerSideProps = async (): Promise<ServerProps> => {
  const wallet = new Wallet(process.env.VERIFIER_PRIVATE_KEY)
  const address = await wallet.getAddress()

  return {
    props: {
      verifierAddress: address
    }
  }
}

type Props = {
  verifierAddress: string
}

const DappPage: NextPage<Props> = ({ verifierAddress }) => {
  const { active } = useWeb3React<Web3Provider>()

  // The first next thing we need to do is ask the user to connect the wallet.
  // When the wallet gets connected, we are going to save the users's address
  // in the component's state. So if it hasn't been saved yet, we show the
  // ConnectWallet component.
  //
  // Note that we pass it a callback that is going to be called when the user
  // clicks a button. This callback just calls the _connectWallet method.
  if (active) {
    return <Demo6 verifierAddress={verifierAddress} />
  } else {
    return (
      <DappLayout>
        <ConnectWallet />
      </DappLayout>
    )
  }
}

export default DappPage
