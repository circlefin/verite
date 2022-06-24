import { GetServerSideProps, NextPage } from "next"
import { getSession } from "next-auth/react"

import SignInForm from "../../components/auth/SignInForm"
import Layout from "../../components/shared/Layout"

type Props = {
  redirectTo: string
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const session = await getSession(context)
  const redirectTo = (context.query.redirectTo || "/demos/issuer") as string

  // There is a special Sign In page for the CeFi demo
  if (
    ["/demos/cefi/account", "/demos/cefi/send", "/demos/cefi/receive"].includes(
      redirectTo
    )
  ) {
    return {
      redirect: {
        permanent: false,
        destination: "/demos/cefi"
      }
    }
  }

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
    <Layout title="Please sign in">
      <div className="container px-4 py-4 mx-auto sm:px-8">
        <div className="prose">
          <h3>This part of the demo requires authentication.</h3>
          <p>
            To <strong>issue credentials</strong>, an issuer would require the
            end-user to authenticate to be identified and to issue a
            user-specific credential.
          </p>
          <p>
            To <strong>revoke credentials</strong>, an issuer needs an internal
            compliance administrator to authenticate to access the revocation
            controls. In this case, you can use the <strong>Alice</strong>{" "}
            sample account.
          </p>
        </div>
        <SignInForm />
      </div>
    </Layout>
  )
}

export default Home
