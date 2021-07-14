import { NextPage } from "next"
import Authenticated from "components/Authenticated"
import Layout from "components/Layout"

const DashboardPage: NextPage = () => {
  return (
    <Authenticated>
      <Layout title="Dashboard">
        <div className="container px-4 py-4 mx-auto sm:px-8">👋</div>
      </Layout>
    </Authenticated>
  )
}

export default DashboardPage
