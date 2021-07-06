import { GetServerSideProps, NextPage } from "next"
import { getSession } from "next-auth/client"
import QRCode from "qrcode.react"
import Authenticated, { SessionProps } from "components/Authenticated"
import Layout from "components/Layout"
import { User } from "lib/database"
import { issuanceManifestUrl } from "lib/issuance/manifest"
import { ManifestUrlObject } from "types/Manifest"

type Props = SessionProps & {
  manifestUrl: ManifestUrlObject
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

  return {
    props: {
      manifestUrl: await issuanceManifestUrl(session.user as User),
      session
    }
  }
}

const Protected: NextPage<Props> = ({ manifestUrl }) => {
  return (
    <Authenticated>
      <Layout>
        <main className="container py-4 mx-auto font-inter">
          <h1 className="pb-8 text-4xl font-extrabold tracking-tight text-center">
            Welcome back!
          </h1>

          <h2 className="pb-4 text-xl text-center">KYC Credential:</h2>
          <QRCode
            value={JSON.stringify(manifestUrl)}
            className="mx-auto w-96 h-96"
            renderAs="svg"
          />
          <textarea
            className="container mx-auto my-2 font-mono border-2 h-36"
            readOnly
            value={JSON.stringify(manifestUrl, null, 4)}
          />
        </main>
      </Layout>
    </Authenticated>
  )
}

export default Protected
