import { GetServerSideProps, NextPage } from "next"
import { getSession } from "next-auth/client"
import Head from "next/head"
import Layout from "components/Layout"

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)

  if (session) {
    return {
      redirect: {
        permanent: false,
        destination: "/dashboard"
      }
    }
  }

  return {
    props: {
      session
    }
  }
}

const Home: NextPage = () => {
  return (
    <Layout title="Project Verity Demo">
      <Head>
        <title>Verity Demo</title>
      </Head>

      <div className="container px-4 py-4 mx-auto sm:px-8">👋</div>
    </Layout>
  )
}

export default Home
