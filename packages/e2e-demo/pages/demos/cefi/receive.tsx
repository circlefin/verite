import { NextPage } from "next"
import { QRCodeSVG } from "qrcode.react"
import React, { useState } from "react"

import Alert from "../../../components/demos/cefi/Alert"
import Layout from "../../../components/demos/cefi/Layout"
import PickupPanel from "../../../components/demos/cefi/PickupPanel"
import Tabs from "../../../components/demos/cefi/Tabs"
import Spinner from "../../../components/shared/Spinner"
import { useBalance } from "../../../hooks/useBalance"
import { requireAuth } from "../../../lib/auth-fns"

export const getServerSideProps = requireAuth(async () => {
  return { props: {} }
})

const Page: NextPage = () => {
  const { data, mutate } = useBalance()
  const [message, setMessage] = useState<{ text: string; type: string }>()
  const [pickupLoading, setPickupLoading] = useState(false)

  const error = (text: string) => {
    setMessage({ text, type: "error" })
  }

  const info = (text: string) => {
    setMessage({ text, type: "success" })
  }

  const pickupFunction = async (id: string) => {
    setPickupLoading(true)

    const response = await fetch(`/api/demos/cefi/pickup/${id}`, {
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

    const response = await fetch(`/api/demos/cefi/pickup/${id}`, {
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

  const tabs = [
    { name: "My Account", href: "/demos/cefi", current: false },
    { name: "Send", href: "/demos/cefi/send", current: false },
    { name: "Receive", href: "/demos/cefi/receive", current: true }
  ]

  if (!data) {
    return (
      <Layout>
        <Tabs tabs={tabs}></Tabs>
        <Spinner className="w-12 h-12 mx-auto my-12" />
      </Layout>
    )
  }

  return (
    <Layout>
      <React.StrictMode>
        <Tabs tabs={tabs}></Tabs>

        <div className="max-w-xl mx-auto">
          <div className={`${message ? "block" : "hidden"} my-4`}>
            <Alert
              text={message?.text}
              type={message?.type}
              onDismiss={() => setMessage(null)}
            />
          </div>

          <div className="mt-8 space-y-4">
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

            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Receive VUSDC
            </h3>

            <p className="text-gray-500 max-w-4xltext-sm">
              You can receive VUSDC at this address:
            </p>
            <p>{data?.address}</p>

            <QRCodeSVG value={data?.address} className="w-48 h-48" />
          </div>
        </div>
      </React.StrictMode>
    </Layout>
  )
}

export default Page
