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
      <Layout title="KYC/AML Attestation">
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
      </Layout>
    </Authenticated>
  )
}

export default KycAmlPage
