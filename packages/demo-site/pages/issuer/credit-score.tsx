import { challengeTokenUrlWrapper } from "@centre/verity"
import type { ChallengeTokenUrlWrapper } from "@centre/verity"
import { NextPage } from "next"
import Link from "next/link"
import QRCode from "qrcode.react"
import IssuerLayout from "../../components/issuer/Layout"
import { currentUser, requireAuth } from "../../lib/auth-fns"
import { temporaryAuthToken } from "../../lib/database"
import type { User } from "../../lib/database"

type Props = {
  manifest: Record<string, unknown>
  qrCodeData: ChallengeTokenUrlWrapper
  user: User
}

export const getServerSideProps = requireAuth<Props>(async (context) => {
  const user = await currentUser(context)
  const authToken = await temporaryAuthToken(user)
  const qrCodeData = challengeTokenUrlWrapper(
    `${process.env.HOST}/api/manifests/credit-score/${authToken}`
  )

  const response = await fetch(qrCodeData.challengeTokenUrl)
  const manifest = await response.json()

  return {
    props: {
      manifest,
      qrCodeData,
      user
    }
  }
})

const CreditScorePage: NextPage<Props> = ({ manifest, qrCodeData, user }) => {
  return (
    <IssuerLayout title="Credit Score">
      <div className="prose">
        <dl className="flex flex-row justify-center mx-auto space-x-2 sm:space-x-5">
          <div className="px-4 py-3 overflow-hidden text-center bg-white rounded-lg shadow sm:py-5 sm:px-6 flex-0">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Credit Score
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {user.creditScore}
            </dd>
          </div>
        </dl>
        <p>Using the Verity app, scan this QR code to request credentials.</p>
        <QRCode
          value={JSON.stringify(qrCodeData)}
          className="w-48 h-48 mx-auto"
          renderAs="svg"
        />
        <h2>QR Code Data</h2>
        <p>
          <pre>{JSON.stringify(qrCodeData, null, 4)}</pre>
        </p>

        <h2>Credential Manifest</h2>
        <p>
          After following the url in `challengeTokenUrl`, the mobile application
          will receive the following, which instructs the client where and how
          to make the request to issue a new credential.
        </p>

        <p>
          Read more about{" "}
          <Link href="https://identity.foundation/credential-manifest/">
            Credential Manifest
          </Link>
          .
        </p>

        <p>
          <pre>{JSON.stringify(manifest, null, 4)}</pre>
        </p>
      </div>
    </IssuerLayout>
  )
}

export default CreditScorePage
