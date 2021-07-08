import { GetServerSideProps, NextPage } from "next"
import { getSession } from "next-auth/client"
import QRCode from "qrcode.react"
import Authenticated, { SessionProps } from "components/Authenticated"
import Layout from "components/Layout"
import { User } from "lib/database"
import { inssuanceManifestToken } from "lib/issuance/manifest"

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

  const manifestToken = await inssuanceManifestToken(session.user as User)
  const manifestUrlContainer: ManifestUrlContainer = {
    manifestUrl: `${process.env.ROOT_URL}/api/issuance/manifest`,
    submissionUrl: `${process.env.ROOT_URL}/api/issuance/submission/${manifestToken}`,
    version: "1"
  }

  return {
    props: {
      manifestUrlContainer,
      session
    }
  }
}

const Protected: NextPage<Props> = ({ manifestUrlContainer }) => {
  return (
    <Authenticated>
      <Layout>
        <main className="container py-4 mx-auto font-inter">
          <h1 className="pb-8 text-4xl font-extrabold tracking-tight text-center">
            Welcome back!
          </h1>

          <h2 className="pb-4 text-xl text-center">KYC Credential:</h2>
          <QRCode
            value={JSON.stringify(manifestUrlContainer)}
            className="w-48 h-48 mx-auto"
            renderAs="svg"
          />
          <textarea
            className="container mx-auto my-2 font-mono text-sm border-2 h-36"
            readOnly
            value={JSON.stringify(manifestUrlContainer, null, 4)}
          />
        </main>
      </Layout>
    </Authenticated>
  )
}

export default Protected
