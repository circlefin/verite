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
        address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      }
    })
  })
}

const Page: NextPage = () => {
  const { balance } = useBalance()
  const { data } = useEthBalance(balance?.address)

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
      </React.StrictMode>
    </Layout>
  )
}

export default Page
