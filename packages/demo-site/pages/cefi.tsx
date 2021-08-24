import { NextPage } from "next"
import React from "react"

import Layout from "../components/layouts/EthLayout"
import { useBalance } from "../hooks/useBalance"
import { useEthBalance } from "../hooks/useBalance"

const sendFunction = async () => {
  await fetch("/api/demo/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      transaction: {
        amount: "10",
        address: "0xFAEd4F38A7a2628d65699C71be0650FBff4617e6"
      }
    })
  })
}

const Page: NextPage = () => {
  const { balance } = useBalance()
  const { data } = useEthBalance(balance?.address)
  const alice = useEthBalance("0xFAEd4F38A7a2628d65699C71be0650FBff4617e6")

  console.log(data)
  return (
    <Layout title="Project Verity Demo">
      <React.StrictMode>
        <div>
          <div>
            On-Chain Balance: {data?.balance.toString()} {data?.symbol}
          </div>
          <div>Available Balance: {balance?.balance}</div>
          <div>Address: {balance?.address}</div>
          <button onClick={sendFunction}>Send</button>
        </div>

        <div>Alice: {alice?.data?.balance?.toString()}</div>
      </React.StrictMode>
    </Layout>
  )
}

export default Page
