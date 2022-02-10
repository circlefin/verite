import { BigNumber } from "ethers"
import { NextPage } from "next"
import React, { createRef, useState } from "react"

import Alert from "../../../components/demos/cefi/Alert"
import Layout from "../../../components/demos/cefi/Layout"
import Modal from "../../../components/demos/cefi/Modal"
import PendingSendPanel from "../../../components/demos/cefi/PendingSendPanel"
import Tabs from "../../../components/demos/cefi/Tabs"
import { LoadingButton } from "../../../components/shared/LoadingButton"
import Spinner from "../../../components/shared/Spinner"
import { useBalance } from "../../../hooks/useBalance"
import { requireAuth } from "../../../lib/auth-fns"

export const getServerSideProps = requireAuth(async () => {
  return { props: {} }
})

const form = createRef<HTMLFormElement>()

const Page: NextPage = () => {
  const { data, mutate } = useBalance()
  const [message, setMessage] = useState<{ text: string; type: string }>()
  const [open, setOpen] = useState<boolean>(false)
  const [address, setAddress] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [pendingSendLoading, setPendingSendLoading] = useState(false)

  const error = (text: string) => {
    setMessage({ text, type: "error" })
  }

  const info = (text: string) => {
    setMessage({ text, type: "success" })
  }

  const promptBeforeSend = (amount: string): boolean => {
    try {
      if (BigNumber.from(amount).gte(10)) {
        setOpen(true)
        return true
      }
    } catch (ignore) {}

    return false
  }

  const sendFunction = async (
    address: string,
    amount: string,
    withVerification = true
  ) => {
    // Disable form
    setLoading(true)

    // Perform send
    const response = await fetch(`/api/demos/cefi/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        withVerification,
        transaction: {
          amount,
          address
        }
      })
    })

    await mutate(undefined, true)

    // Enable and reset form
    setLoading(false)

    if (response.ok) {
      const result = await response.json()
      if (result.status === "pending") {
        info("Transfer sent.")
      } else {
        info("Transfer complete.")
      }
    } else {
      error("Transfer failed.")
    }

    return response.ok
  }

  const pendingSendCancel = async (id: string) => {
    setPendingSendLoading(true)

    const response = await fetch(`/api/demos/cefi/send/${id}`, {
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

  const tabs = [
    { name: "My Account", href: "/demos/cefi", current: false },
    { name: "Send", href: "/demos/cefi/send", current: true },
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

          {open && (
            <Modal
              confirmFunction={() => {
                sendFunction(address, amount)
                form.current.reset()
              }}
              onClose={setOpen}
              open={open}
              setOpen={setOpen}
            ></Modal>
          )}

          <div className="my-4">
            {data.pendingSend ? (
              <PendingSendPanel
                row={data.pendingSend}
                loading={pendingSendLoading}
                onCancel={() => pendingSendCancel(data.pendingSend.id)}
              ></PendingSendPanel>
            ) : null}
          </div>
          <div className="mt-8">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Send VUSDC
              </h3>
              <p className="max-w-4xl mt-2 text-sm text-gray-500">
                In this demo, transfers of 10 or more VUSDC will require
                providing information to the counterparty.
              </p>
            </div>

            <form
              ref={form}
              className="mt-4 space-y-2"
              onSubmit={async (e) => {
                e.preventDefault()

                if (promptBeforeSend(amount)) {
                  return
                }

                await sendFunction(address, amount)
                form.current.reset()
              }}
            >
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Recipient Address
                </label>
                <div className="mt-1">
                  <input
                    disabled={loading}
                    required={true}
                    type="text"
                    name="address"
                    id="address"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0x..."
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Amount of VUSDC
                </label>
                <div className="mt-1">
                  <input
                    disabled={loading}
                    required={true}
                    type="text"
                    name="amount"
                    id="amount"
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="0 VUSDC"
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <LoadingButton
                type="submit"
                style="dot-loader"
                loading={loading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Transfer
              </LoadingButton>
            </form>
          </div>
        </div>
      </React.StrictMode>
    </Layout>
  )
}

export default Page
