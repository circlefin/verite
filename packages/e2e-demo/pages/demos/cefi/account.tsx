import { NextPage } from "next"
import React, { useState } from "react"

import Alert from "../../../components/demos/cefi/Alert"
import EmptyAccount from "../../../components/demos/cefi/Empty"
import HistoryList from "../../../components/demos/cefi/HistoryList"
import Layout from "../../../components/demos/cefi/Layout"
import Tabs from "../../../components/demos/cefi/Tabs"
import NoTokensMessage from "../../../components/demos/dapp/NoTokensMessage"
import Spinner from "../../../components/shared/Spinner"
import { useBalance } from "../../../hooks/useBalance"
import { requireAuth } from "../../../lib/auth-fns"
import { fullURL } from "../../../lib/utils"

export const getServerSideProps = requireAuth(async () => {
  return { props: {} }
})

const Page: NextPage = () => {
  const { data, accountBalance } = useBalance()
  const [message, setMessage] = useState<{ text: string; type: string }>()

  const error = (text: string) => {
    setMessage({ text, type: "error" })
  }

  const faucetFunction = async (address: string): Promise<boolean> => {
    try {
      const resp = await fetch(fullURL("/api/demos/dapp/faucet"), {
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

  const tabs = [
    { name: "My Account", href: "/demos/cefi", current: true },
    { name: "Send", href: "/demos/cefi/send", current: false },
    { name: "Receive", href: "/demos/cefi/receive", current: false }
  ]

  if (!data) {
    return (
      <Layout>
        <Tabs tabs={tabs}></Tabs>
        <Spinner className="w-12 h-12 mx-auto my-12" />
      </Layout>
    )
  }

  if (accountBalance.lte(0)) {
    return (
      <Layout>
        <React.StrictMode>
          <div className={`${message ? "block" : "hidden"} my-4`}>
            <Alert
              text={message?.text}
              type={message?.type}
              onDismiss={() => setMessage(null)}
            />
          </div>

          <NoTokensMessage
            faucetFunction={faucetFunction}
            selectedAddress={data.address}
          ></NoTokensMessage>
        </React.StrictMode>
      </Layout>
    )
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
