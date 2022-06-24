import { GetServerSideProps, NextPage } from "next"
import { getSession } from "next-auth/react"
import Image from "next/image"

import Layout from "../../../components/demos/cefi/Layout"
import SignInFormCeFi from "../../../components/demos/cefi/SignInFormCeFi"

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)

  if (session) {
    return {
      redirect: {
        destination: "/demos/cefi/account",
        permanent: false
      }
    }
  }

  return {
    props: {}
  }
}

const CeFiPage: NextPage = () => {
  const coinboss = [
    { email: "bob@test.com", password: "testing" },
    { email: "kim@test.com", password: "testing" },
    { email: "brice@test.com", password: "testing" }
  ]
  const coinbossLogo = (
    <Image
      height="26px"
      width="145px"
      alt="Coinboss Logo"
      src="/img/logo-coinboss.png"
    />
  )

  const trapezoid = [
    { email: "sean@test.com", password: "testing" },
    { email: "matt@test.com", password: "testing" },
    { email: "alice@test.com", password: "testing" }
  ]
  const trapezoidLogo = (
    <Image
      height="26px"
      width="186px"
      alt="Trapezoid Logo"
      src="/img/logo-trapezoid.png"
    />
  )

  return (
    <Layout hideNavigation={true}>
      <div className="pb-2 prose max-w-none">
        <h2>Centralized App with Travel Rule</h2>
        <p>
          In this demo, we have assigned our test users to two different
          institutions: Trapezoid and Coinboss. To experience the end-to-end
          demo, you will want to open the demo in two different browser windows.
          Click a different user in each browser to sign in. One user should act
          as the sender, and the other should act as the receiver.
        </p>

        <div className="flex flex-row">
          <SignInFormCeFi users={coinboss} logo={coinbossLogo} />
          <SignInFormCeFi users={trapezoid} logo={trapezoidLogo} />
        </div>
      </div>
    </Layout>
  )
}

export default CeFiPage
