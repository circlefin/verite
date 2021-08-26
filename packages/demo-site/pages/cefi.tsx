import { NextPage } from "next"
import { signout, useSession } from "next-auth/client"
import React, { createRef, useState } from "react"

import Layout from "../components/Layout"
import { LoadingButton } from "../components/LoadingButton"
import Alert from "../components/cefi/Alert"
import { useBalance } from "../hooks/useBalance"

const form = createRef<HTMLFormElement>()

const Page: NextPage = () => {
  const [session] = useSession()
  const { balance } = useBalance()
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<{ text: string; type: string }>()
  const [address, setAddress] = useState<string>("")
  const [amount, setAmount] = useState<string>("")
  const [withVerification, setWithVerification] = useState<boolean>(false)

  const error = (text: string) => {
    setMessage({ text, type: "error" })
  }

  const info = (text: string) => {
    setMessage({ text, type: "success" })
  }

  const sendFunction = async (
    address: string,
    amount: string,
    withVerification = true
  ) => {
    // Disable form
    setLoading(true)

    // Perform send
    const response = await fetch(`/api/demo/send`, {
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

    // Enable and reset form
    setLoading(false)

    return response.status === 200
  }

  const TransferRow = (transfer) => {
    return (
      <>
        <div>From: {transfer.from}</div>
        <div>To: {transfer.to}</div>
        <div>Amount: {transfer.amount}</div>
        <div>Status: {transfer.status}</div>
      </>
    )
  }

  return (
    <Layout title="Project Verity Demo">
      <React.StrictMode>
        <div className="flex flex-col-reverse justify-between mb-6 -mt-6 border-b border-gray-200 sm:flex-row">
          <nav
            className="flex justify-center -mb-px space-x-8"
            aria-label="Tabs"
          >
            <span className="px-1 py-4 text-sm font-medium text-gray-500 whitespace-nowrap ">
              Balance:
              <span className="ml-3 text-lg font-bold">
                {balance?.balance} VUSDC
              </span>
            </span>
          </nav>
          {session ? (
            <div className="flex justify-between -mb-px space-x-8">
              <span className="flex items-center px-1 py-4 text-sm font-medium text-gray-500 whitespace-nowrap">
                {session?.user?.email}
              </span>
              <button
                onClick={() => signout()}
                className="px-1 py-4 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
              >
                Sign Out
              </button>
            </div>
          ) : null}
        </div>

        <div>
          <div className={`${message ? "block" : "hidden"} mb-4`}>
            <Alert
              text={message?.text}
              type={message?.type}
              onDismiss={() => setMessage(null)}
            />
          </div>

          <form
            ref={form}
            className="space-y-2"
            onSubmit={async (e) => {
              e.preventDefault()

              if (await sendFunction(address, amount, withVerification)) {
                info("Transfer complete!")
              } else {
                error("Transfer failed.")
              }
              form.current.reset()
            }}
          >
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Transfer VUSDC
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Send VUSDC to an address.
            </p>
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
                  type="text"
                  name="address"
                  id="address"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="0x..."
                  onChange={(e) => setAddress(e.target.value)}
                  defaultValue={address}
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
                  type="text"
                  name="amount"
                  id="amount"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="0 VUSDC"
                  onChange={(e) => setAmount(e.target.value)}
                  defaultValue={amount}
                />
              </div>
            </div>

            <div>
              <fieldset className="space-y-5">
                <legend className="sr-only">Notifications</legend>
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="comments"
                      aria-describedby="comments-description"
                      name="comments"
                      type="checkbox"
                      checked={withVerification}
                      onChange={(e) => {
                        setWithVerification(e.target.checked)
                      }}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="comments"
                      className="font-medium text-gray-700"
                    >
                      Perform KYC Verification with countery party
                    </label>
                    <p id="comments-description" className="text-gray-500">
                      Make API call with receiving service to verify
                      credentials.
                    </p>
                  </div>
                </div>
              </fieldset>
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

        <div>{balance?.transfers.map((x) => TransferRow(x))}</div>
      </React.StrictMode>
    </Layout>
  )
}

export default Page
