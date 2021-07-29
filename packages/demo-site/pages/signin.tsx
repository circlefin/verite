import { GetServerSideProps, NextPage } from "next"
import { getSession } from "next-auth/client"
import Layout from "../components/Layout"
import SignInForm from "../components/SignInForm"

type Props = {
  redirectTo: string
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const session = await getSession(context)
  const redirectTo = (context.query.redirectTo || "/issuer") as string

  if (session) {
    return {
      redirect: {
        permanent: false,
        destination: redirectTo
      }
    }
  }

  return {
    props: {
      redirectTo
    }
  }
}

const Home: NextPage = () => {
  return (
    <Layout title="Sign in">
      <div className="container px-4 py-4 mx-auto sm:px-8">
        <SignInForm />
      </div>
    </Layout>
  )
}

export default Home
