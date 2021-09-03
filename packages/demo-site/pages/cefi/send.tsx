import Alert from "@centre/demo-site/components/cefi/Alert"
import Tabs from "@centre/demo-site/components/cefi/Tabs"
import { useBalance } from "@centre/demo-site/hooks/useBalance"
import { BigNumber } from "ethers"
import { NextPage } from "next"
import React, { createRef, useState } from "react"
import { LoadingButton } from "../../components/LoadingButton"
import Layout from "../../components/cefi/Layout"
import Modal from "../../components/cefi/Modal"

const form = createRef<HTMLFormElement>()

const Page: NextPage = () => {
  const { data, mutate } = useBalance()
  const [message, setMessage] = useState<{ text: string; type: string }>()
  const [open, setOpen] = useState<boolean>(false)
  const [address, setAddress] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

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
    const response = await fetch(`/api/cefi/send`, {
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
        info("Transfer pending.")
      } else {
        info("Transfer complete.")
      }
    } else {
      error("Transfer failed.")
    }

    return response.ok
  }

  const tabs = [
    { name: "My Account", href: "/cefi", current: false },
    { name: "Send", href: "/cefi/send", current: true },
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
        <div className="mt-8">
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Send VUSDC
            </h3>
            <p className="max-w-4xl mt-2 text-sm text-gray-500">
              In this demo, transfers of 10 or more VUSDC will require providing
              information to the counterparty.
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
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
      </React.StrictMode>
    </Layout>
  )
}

export default Page
