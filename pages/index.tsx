import { GetServerSideProps, NextPage } from "next"
import { getSession } from "next-auth/client"
import Layout from "components/Layout"
import SignInForm from "components/SignInForm"

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
      <div className="container px-4 py-4 mx-auto sm:px-8">
        <SignInForm />
      </div>
    </Layout>
  )
}

export default Home
