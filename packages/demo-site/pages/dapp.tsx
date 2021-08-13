import { NextPage } from "next"
import React from "react"
import Dapp from "../components/dapp/Dapp"
import Layout from "../components/layouts/EthAuthLayout"

const DappPage: NextPage = () => {
  return (
    <Layout title="Project Verity Demo">
      <React.StrictMode>
        <Dapp />
      </React.StrictMode>
    </Layout>
  )
}

export default DappPage
