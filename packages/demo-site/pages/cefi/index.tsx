import { BigNumber } from "@ethersproject/bignumber"
import { NextPage } from "next"
import React, { useState } from "react"

import Alert from "../../components/cefi/Alert"
import EmptyAccount from "../../components/cefi/Empty"
import HistoryList from "../../components/cefi/HistoryList"
import Layout from "../../components/cefi/Layout"
import PendingSendPanel from "../../components/cefi/PendingSendPanel"
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
  const { data, mutate } = useBalance()
  const [pickupLoading, setPickupLoading] = useState(false)
  const [pendingSendLoading, setPendingSendLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: string }>()

  const error = (text: string) => {
    setMessage({ text, type: "error" })
  }

  const info = (text: string) => {
    setMessage({ text, type: "success" })
  }

  const pickupFunction = async (id: string) => {
    setPickupLoading(true)

    const response = await fetch(`/api/cefi/pickup/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    })
    await mutate(undefined, true)

    if (response.ok) {
      info("Pickup succeessful.")
    } else {
      error(
        "Pickup failed. This can happen if the counterparty canceled the request, verification is expired, or if the counterparty does not have sufficient funds."
      )
    }

    setPickupLoading(false)
  }

  const pickupCancelFunction = async (id: string) => {
    setPickupLoading(true)

    const response = await fetch(`/api/cefi/pickup/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    })

    await mutate(undefined, true)

    if (response.ok) {
      info("Pickup cancelled.")
    } else {
      error("Something went wrong.")
    }

    setPickupLoading(false)
  }

  const pendingSendCancel = async (id: string) => {
    setPendingSendLoading(true)

    const response = await fetch(`/api/cefi/send/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      }
    })

    await mutate(undefined, true)

    if (response.ok) {
      info("Cancelling transaction.")
    } else {
      error("Something went wrong.")
    }

    setPendingSendLoading(false)
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
    return <>Loading</>
  }

  const accountBalance = BigNumber.from(data.balance)

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

        <div className="my-4">
          {data.pendingReceive ? (
            <PickupPanel
              row={data.pendingReceive}
              pickupLoading={pickupLoading}
              pickupFunction={() => pickupFunction(data.pendingReceive.id)}
              pickupCancelFunction={() =>
                pickupCancelFunction(data.pendingReceive.id)
              }
            ></PickupPanel>
          ) : null}
        </div>

        <div className="my-4">
          {data.pendingSend ? (
            <PendingSendPanel
              row={data.pendingSend}
              loading={pendingSendLoading}
              onCancel={() => pendingSendCancel(data.pendingSend.id)}
            ></PendingSendPanel>
          ) : null}
        </div>

        {data.history?.length > 0 ? (
          <HistoryList history={data.history}></HistoryList>
        ) : (
          <EmptyAccount></EmptyAccount>
        )}
      </React.StrictMode>
    </Layout>
  )
}

export default Page
