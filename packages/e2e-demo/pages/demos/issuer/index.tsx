import { GetServerSideProps, NextPage } from "next"
import { getSession } from "next-auth/react"

import SignInForm from "../../../components/auth/SignInForm"
import IssuerLayout from "../../../components/demos/issuer/Layout"

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)

  if (session) {
    return {
      redirect: {
        destination: "/demos/issuer/picker",
        permanent: false
      }
    }
  }

  return {
    props: {}
  }
}

const IssuerPage: NextPage = () => {
  return (
    <IssuerLayout hideNavigation={true}>
      <div className="pb-2 prose max-w-none">
        <h2>Request and Custody Verifiable Credentials</h2>
        <p>
          When you sign into your account at Circle, Coinbase, Square, or
          another trusted institution, you might request credentials that prove
          those providers have confirmed your identity, credit/risk score,
          accredited investor status, or other key claims.
        </p>

        <p>
          To receive one of these credentials, you will have to sign in to your
          account at one of the trusted institutions.
        </p>

        <SignInForm />
      </div>
    </IssuerLayout>
  )
}

export default IssuerPage
