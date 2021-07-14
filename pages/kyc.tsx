import { GetServerSideProps, NextPage } from "next"
import { getSession } from "next-auth/client"
import Head from "next/head"
import QRCode from "qrcode.react"
import Authenticated, { SessionProps } from "components/Authenticated"
import Layout from "components/Layout"
import { temporaryAuthToken, User } from "lib/database"

export type ManifestUrlContainer = {
  manifestUrl: string
  submissionUrl: string
  version: string
}

type Props = SessionProps & {
  manifestUrlContainer: ManifestUrlContainer
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const session = await getSession(context)

  if (!session || !session.user) {
    return {
      redirect: {
        destination: "/",
        permanent: false
      }
    }
  }

  const manifestToken = await temporaryAuthToken(session.user as User)
  const manifestUrlContainer: ManifestUrlContainer = {
    manifestUrl: `${process.env.HOST}/api/issuance/manifest`,
    submissionUrl: `${process.env.HOST}/api/issuance/submission/${manifestToken}`,
    version: "1"
  }

  return {
    props: {
      manifestUrlContainer,
      session
    }
  }
}

const KycAmlPage: NextPage<Props> = ({ manifestUrlContainer }) => {
  return (
    <Authenticated>
      <Head>
        <title>KYC/AML Attestation - Verity Demo</title>
      </Head>
      <Layout>
        <div className="container px-4 py-4 mx-auto sm:px-8 font-inter">
          <h1 className="pb-8 text-4xl font-extrabold tracking-tight text-center">
            KYC/AML Attestation
          </h1>
          <QRCode
            value={JSON.stringify(manifestUrlContainer)}
            className="w-48 h-48 mx-auto"
            renderAs="svg"
          />
          <textarea
            className="container h-40 mx-auto my-2 font-mono text-sm border-2"
            readOnly
            value={JSON.stringify(manifestUrlContainer, null, 4)}
          />
        </div>
      </Layout>
    </Authenticated>
  )
}

export default KycAmlPage
