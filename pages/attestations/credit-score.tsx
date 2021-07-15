import { GetServerSideProps, NextPage } from "next"
import { getSession } from "next-auth/client"
import QRCode from "qrcode.react"
import Authenticated, { SessionProps } from "components/Authenticated"
import Layout from "components/Layout"
import { findUser, temporaryAuthToken, User } from "lib/database"
import { ManifestUrlWrapper } from "types"

type Props = SessionProps & {
  manifestUrlWrapper: ManifestUrlWrapper
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
  const manifestUrlWrapper: ManifestUrlWrapper = {
    manifestUrl: `${process.env.HOST}/api/issuance/manifests/credit-score`,
    submissionUrl: `${process.env.HOST}/api/issuance/submission/${authToken}`,
    version: "1"
  }

  return {
    props: {
      manifestUrlWrapper,
      session,
      user
    }
  }
}

const CreditScorePage: NextPage<Props> = ({ manifestUrlWrapper, user }) => {
  return (
    <Authenticated>
      <Layout title="Credit Score">
        <div className="flex flex-col justify-center space-y-8">
          <dl className="flex flex-row mx-auto space-x-5">
            <div className="px-6 py-5 overflow-hidden text-center bg-white rounded-lg shadow sm:px-8 flex-0">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Credit Score
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {user.creditScore}
              </dd>
            </div>
          </dl>
          <QRCode
            value={JSON.stringify(manifestUrlWrapper)}
            className="w-48 h-48 mx-auto"
            renderAs="svg"
          />
          <textarea
            className="container h-40 mx-auto font-mono text-sm border-2"
            readOnly
            value={JSON.stringify(manifestUrlWrapper, null, 4)}
          />
        </div>
      </Layout>
    </Authenticated>
  )
}

export default CreditScorePage
