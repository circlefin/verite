import { NextPage } from "next"
import Layout from "components/Layout"
import Dapp from "components/Dapp"
import React from "react"

const Home: NextPage = () => {
  return (
    <Layout title="Project Verity Demo">
      <React.StrictMode>
        <Dapp />
      </React.StrictMode>
    </Layout>
  );
}

export default Home
