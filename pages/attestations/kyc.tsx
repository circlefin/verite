import { GetServerSideProps, NextPage } from "next"
import { getSession } from "next-auth/client"
import QRCode from "qrcode.react"
import Authenticated, { SessionProps } from "components/Authenticated"
import Layout from "components/Layout"
import { findUser, temporaryAuthToken, User } from "lib/database"
import { ManifestUrlWrapper } from "types"

type Props = SessionProps & {
  manifestUrlContainer: ManifestUrlWrapper
  user: User
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

  const user = findUser((session.user as User).id)
  const authToken = await temporaryAuthToken(user)
  const manifestUrlContainer: ManifestUrlWrapper = {
    manifestUrl: `${process.env.HOST}/api/issuance/manifests/kyc`,
    submissionUrl: `${process.env.HOST}/api/issuance/submission/${authToken}`,
    version: "1"
  }

  return {
    props: {
      manifestUrlContainer,
      session,
      user
    }
  }
}

const KycAmlPage: NextPage<Props> = ({ manifestUrlContainer, user }) => {
  const stats = [
    { name: "Jumio Score", stat: user.jumioScore },
    { name: "OFAC Score", stat: user.ofacScore }
  ]

  return (
    <Authenticated>
      <Layout title="KYC/AML Attestation">
        <div className="flex flex-col justify-center space-y-8">
          <dl className="flex flex-row mx-auto space-x-5">
            {stats.map((item) => (
              <div
                key={item.name}
                className="px-6 py-5 overflow-hidden text-center bg-white rounded-lg shadow sm:px-8 flex-0"
              >
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {item.name}
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {item.stat}
                </dd>
              </div>
            ))}
          </dl>
          <QRCode
            value={JSON.stringify(manifestUrlContainer)}
            className="w-48 h-48 mx-auto"
            renderAs="svg"
          />
          <textarea
            className="container h-40 mx-auto font-mono text-sm border-2"
            readOnly
            value={JSON.stringify(manifestUrlContainer, null, 4)}
          />
        </div>
      </Layout>
    </Authenticated>
  )
}

export default KycAmlPage
