import { NextPage } from "next"
import React from "react"

import Layout from "../components/layouts/EthAuthLayout"
import { useBalance } from "../hooks/useBalance"
import { useEthBalance } from "../hooks/useBalance"

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
        </div>
      </React.StrictMode>
    </Layout>
  )
}

export default Page
