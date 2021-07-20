import { NextPage } from "next"
import QRCode from "qrcode.react"
import IssuerLayout from "components/issuer/Layout"
import { currentUser, requireAuth } from "lib/auth-fns"
import { temporaryAuthToken, User } from "lib/database"
import { ManifestUrlWrapper } from "types"

type Props = {
  manifestUrlWrapper: ManifestUrlWrapper
  user: User
}

export const getServerSideProps = requireAuth<Props>(async (context) => {
  const user = await currentUser(context)
  const authToken = await temporaryAuthToken(user)
  const manifestUrlWrapper: ManifestUrlWrapper = {
    manifestUrl: `${process.env.HOST}/api/issuance/manifests/credit-score`,
    submissionUrl: `${process.env.HOST}/api/issuance/submission/${authToken}`,
    version: "1"
  }

  return {
    props: {
      manifestUrlWrapper,
      user
    }
  }
})

const CreditScorePage: NextPage<Props> = ({ manifestUrlWrapper, user }) => {
  return (
    <IssuerLayout title="Credit Score">
      <div className="flex flex-col justify-center space-y-8">
        <dl className="flex flex-row mx-auto space-x-2 sm:space-x-5">
          <div className="px-4 py-3 overflow-hidden text-center bg-white rounded-lg shadow sm:py-5 sm:px-6 sm:px-8 flex-0">
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
    </IssuerLayout>
  )
}

export default CreditScorePage
