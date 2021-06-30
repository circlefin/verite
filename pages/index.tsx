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
        destination: "/protected"
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
    <Layout>
      <Head>
        <title>Verity Demo</title>
      </Head>

      <main className="container py-4 mx-auto font-inter">
        <h1 className="text-4xl font-extrabold tracking-tight text-center">
          Project Verity Demo
        </h1>
      </main>
    </Layout>
  )
}

export default Home
