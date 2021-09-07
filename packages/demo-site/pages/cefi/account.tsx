import { BigNumber } from "@ethersproject/bignumber"
import { NextPage } from "next"
import React, { useState } from "react"
import Spinner from "../../components/Spinner"
import Alert from "../../components/cefi/Alert"
import EmptyAccount from "../../components/cefi/Empty"
import HistoryList from "../../components/cefi/HistoryList"
import Layout from "../../components/cefi/Layout"
import PickupPanel from "../../components/cefi/PickupPanel"
import Tabs from "../../components/cefi/Tabs"
import NoTokensMessage from "../../components/dapp/NoTokensMessage"
import { useBalance } from "../../hooks/useBalance"
import { requireAuth } from "../../lib/auth-fns"
import { fullURL } from "../../lib/utils"

export const getServerSideProps = requireAuth(async () => {
  return { props: {} }
})

const Page: NextPage = () => {
  const { data } = useBalance()
  const [message, setMessage] = useState<{ text: string; type: string }>()

  const error = (text: string) => {
    setMessage({ text, type: "error" })
  }

  const info = (text: string) => {
    setMessage({ text, type: "success" })
  }

  const faucetFunction = async (address: string): Promise<boolean> => {
    try {
      const resp = await fetch(fullURL("/api/demo/faucet"), {
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({ address })
      })
      const json = await resp.json()
      if (json.status !== "ok") {
        console.error(json)
        error(`API call to faucet failed: ${JSON.stringify(json)}`)
        return false
      }
    } catch (e) {
      console.error(e)
      error(`API call to faucet failed: ${e.message}`)
      return false
    }

    return true
  }

  if (!data) {
    return (
      <Layout hideNavigation>
        <Spinner className="w-12 h-12 mx-auto my-12" />
      </Layout>
    )
  }

  const accountBalance = BigNumber.from(data.balance || 0)

  if (accountBalance.lte(0)) {
    return (
      <Layout>
        <React.StrictMode>
          <NoTokensMessage
            faucetFunction={faucetFunction}
            selectedAddress={data.address}
          ></NoTokensMessage>
        </React.StrictMode>
      </Layout>
    )
  }

  const tabs = [
    { name: "My Account", href: "/cefi", current: true },
    { name: "Send", href: "/cefi/send", current: false },
    { name: "Receive", href: "/cefi/receive", current: false }
  ]

  if (!data) {
    return null
  }

  return (
    <Layout>
      <React.StrictMode>
        <Tabs tabs={tabs}></Tabs>

        <div className={`${message ? "block" : "hidden"} my-4`}>
          <Alert
            text={message?.text}
            type={message?.type}
            onDismiss={() => setMessage(null)}
          />
        </div>

        {data.history?.length > 0 ? (
          <div className="my-8">
            <HistoryList history={data.history}></HistoryList>
          </div>
        ) : (
          <EmptyAccount></EmptyAccount>
        )}
      </React.StrictMode>
    </Layout>
  )
}

export default Page
