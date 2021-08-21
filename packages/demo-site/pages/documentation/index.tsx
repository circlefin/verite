import { CalculatorIcon, UsersIcon } from "@heroicons/react/outline"
import { ChevronRightIcon } from "@heroicons/react/solid"
import { NextPage } from "next"
import Layout from "../../components/layouts/BaseLayout"
import { requireAuth } from "../../lib/auth-fns"

export const getServerSideProps = requireAuth(async () => {
  return {
    props: {}
  }
})

const DocumentationPage: NextPage = () => {
  return (
    <Layout title="Verity Documentation">
      <p className="prose-xl">Coming Soon</p>
    </Layout>
  )
}

export default DocumentationPage
