import { NextPage } from "next"
import React, { useState } from "react"

import Layout from "../components/layouts/EthLayout"
import { useBalance } from "../hooks/useBalance"
import { useEthBalance } from "../hooks/useBalance"

const sendFunction = async (address: string, amount: string) => {
  await fetch("/api/demo/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      transaction: {
        amount,
        address
      }
    })
  })
}

const Page: NextPage = () => {
  const { balance } = useBalance()
  const { data } = useEthBalance(balance?.address)
  const alice = useEthBalance("0xFAEd4F38A7a2628d65699C71be0650FBff4617e6")
  const [address, setAddress] = useState<string>(
    "0xFAEd4F38A7a2628d65699C71be0650FBff4617e6"
  )
  const [amount, setAmount] = useState<string>("")

  console.log(data)
  return (
    <Layout title="Project Verity Demo">
      <React.StrictMode>
        <div>
          <form
            className="space-y-2"
            onSubmit={(e) => {
              e.preventDefault()
              sendFunction(address, amount)
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
                  type="text"
                  name="address"
                  id="address"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="0x"
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
                  type="text"
                  name="amount"
                  id="amount"
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="0 VUSDC"
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Transfer
            </button>
          </form>
        </div>

        <div className="mt-8">
          <p>Debugger:</p>
          <div>
            On-Chain Balance: {data?.balance.toString()} {data?.symbol}
          </div>
          <div>Balance: {balance?.balance} VUSDC</div>
          <div>Alice: {alice?.data?.balance?.toString()} VUSDC</div>
        </div>
      </React.StrictMode>
    </Layout>
  )
}

export default Page
