import { BigNumber } from "@ethersproject/bignumber"
import { NextPage } from "next"
import { signout, useSession } from "next-auth/client"
import React, { createRef, useState } from "react"

import Layout from "../components/Layout"
import { LoadingButton } from "../components/LoadingButton"
import Alert from "../components/cefi/Alert"
import Modal from "../components/cefi/Modal"
import { useBalance } from "../hooks/useBalance"
import { requireAuth } from "../lib/auth-fns"

type Props = Record<string, never>

export const getServerSideProps = requireAuth<Props>(async () => {
  return { props: {} }
})

const form = createRef<HTMLFormElement>()

const Page: NextPage = () => {
  const [open, setOpen] = useState<boolean>(false)
  const [session] = useSession()
  const { balance, mutate } = useBalance()
  const [pickupLoading, setPickupLoading] = useState(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<{ text: string; type: string }>()
  const [address, setAddress] = useState<string>("")
  const [amount, setAmount] = useState<string>("")

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

  const PickupPanel = (row) => {
    const result = JSON.parse(row.result)
    const amount = result.transaction.amount
    return (
      <div className="bg-gray-50 sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Someone is trying to send you VUSDC
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>
              Someone has sent you {amount} VUSDC. Before it can be picked up,
              we must provide beneficiary information to the counterparty.
            </p>
          </div>
          <div className="mt-5">
            <LoadingButton
              type="submit"
              style="dot-loader"
              loading={pickupLoading}
              onClick={async () => {
                setPickupLoading(true)

                const response = await fetch(`/api/cefi/pickup/${row.id}`, {
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
                    "Pickup failed. This can happen if the verification is expired or if the counterparty does not have sufficient funds."
                  )
                }

                setPickupLoading(false)
              }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Send information to pickup funds
            </LoadingButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Layout title="Project Verity Demo">
      <React.StrictMode>
        {open && (
          <Modal
            confirmFunction={() => sendFunction(address, amount)}
            onClose={setOpen}
            open={open}
            setOpen={setOpen}
          ></Modal>
        )}
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

        <div className={`${message ? "block" : "hidden"} mb-4`}>
          <Alert
            text={message?.text}
            type={message?.type}
            onDismiss={() => setMessage(null)}
          />
        </div>

        <div>
          {balance?.pendingTransaction
            ? PickupPanel(balance?.pendingTransaction)
            : null}
        </div>

        <div>
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Send VUSDC
            </h3>
            <p className="mt-2 max-w-4xl text-sm text-gray-500">
              In this demo, transfers of 10 or more VUSDC will require providing
              information to the counterparty.
            </p>
          </div>

          <form
            ref={form}
            className="space-y-2 mt-4"
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
                  required={true}
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

        <div className="mt-8">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Receive VUSDC
          </h3>
          <p className="mt-2 max-w-4xl text-sm text-gray-500">
            You can receive VUSDC at this address:
          </p>
          <p className="mt-2">{balance?.address}</p>
        </div>
      </React.StrictMode>
    </Layout>
  )
}

export default Page
