import { NextPage } from "next"
import Link from "next/link"
import Layout from "components/Layout"

const Home: NextPage = () => {
  return (
    <Layout title="Project Verity Demo">
      <div className="container px-4 py-4 mx-auto sm:px-8">
        <div className="flex flex-col">
          <Link href="/issuer">
            <a>Issuer</a>
          </Link>
          <Link href="/verifier">
            <a>Verifier</a>
          </Link>
          <Link href="/admin">
            <a>Admin</a>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

export default Home
