import { GetServerSideProps, NextPage } from "next"
import { getSession } from "next-auth/client"
import Authenticated, { SessionProps } from "components/Authenticated"
import Layout from "components/Layout"

export const getServerSideProps: GetServerSideProps<SessionProps> = async (
  context
) => {
  const session = await getSession(context)

  return {
    props: {
      session
    }
  }
}

const Protected: NextPage = () => {
  return (
    <Authenticated>
      <Layout>
        <main className="container py-4 mx-auto font-inter">
          <h1 className="text-4xl font-extrabold tracking-tight text-center">
            Welcome back!
          </h1>
        </main>
      </Layout>
    </Authenticated>
  )
}

export default Protected
