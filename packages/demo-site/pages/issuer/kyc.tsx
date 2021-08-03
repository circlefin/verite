import { challengeTokenUrlWrapper } from "@centre/verity"
import type { ChallengeTokenUrlWrapper } from "@centre/verity"
import { NextPage } from "next"
import QRCode from "qrcode.react"
import useSWR from "swr"
import IssuerLayout from "../../components/issuer/Layout"
import { currentUser, requireAuth } from "../../lib/auth-fns"
import { temporaryAuthToken } from "../../lib/database"
import type { User } from "../../lib/database"

type Props = {
  createdAt: string
  manifest: Record<string, unknown>
  qrCodeData: ChallengeTokenUrlWrapper
  user: User
}

export const getServerSideProps = requireAuth<Props>(async (context) => {
  const user = await currentUser(context)
  const authToken = await temporaryAuthToken(user)
  const qrCodeData = challengeTokenUrlWrapper(
    `${process.env.HOST}/api/manifests/kyc/${authToken}`
  )

  const response = await fetch(qrCodeData.challengeTokenUrl)
  const manifest = await response.json()

  return {
    props: {
      createdAt: new Date().toISOString(),
      manifest,
      qrCodeData,
      user
    }
  }
})

const fetcher = (url) => fetch(url).then((res) => res.json())

const KycAmlPage: NextPage<Props> = ({
  createdAt,
  manifest,
  qrCodeData,
  user
}) => {
  // Setup polling to detect a newly issued credential.
  const { data } = useSWR(
    `/api/demo/get-newest-credential-from?createdAt=${createdAt}`,
    fetcher,
    {
      refreshInterval: 1000
    }
  )

  // Newest Credential fragment
  const credential = (data) => {
    if (!data || data.status === 404) {
      return (
        <div>
          Using the Verity app, scan the QR code above to request credentials.
        </div>
      )
    } else {
      return (
        <div>
          <textarea
            className="container h-40 mx-auto font-mono text-sm border-2"
            readOnly
            value={JSON.stringify(data, null, 4)}
          />
        </div>
      )
    }
  }

  const stats = [
    { name: "Jumio Score", stat: user.jumioScore },
    { name: "OFAC Score", stat: user.ofacScore }
  ]

  return (
    <IssuerLayout title="KYC/AML Attestation">
      <div className="flex flex-col justify-center space-y-8">
        <dl className="flex flex-row mx-auto space-x-2 sm:space-x-5">
          {stats.map((item) => (
            <div
              key={item.name}
              className="px-4 py-3 overflow-hidden text-center bg-white rounded-lg shadow sm:py-5 sm:px-6 sm:px-8 flex-0"
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
          value={JSON.stringify(qrCodeData)}
          className="w-48 h-48 mx-auto"
          renderAs="svg"
        />
        <div>QR Code Data</div>
        <textarea
          className="container h-40 mx-auto font-mono text-sm border-2"
          readOnly
          value={JSON.stringify(qrCodeData, null, 4)}
        />

        <div>Credential Manifest</div>
        <textarea
          className="container h-40 mx-auto font-mono text-sm border-2"
          readOnly
          value={JSON.stringify(manifest, null, 4)}
        />

        <div>Credential</div>
        {credential(data)}
      </div>
    </IssuerLayout>
  )
}

export default KycAmlPage
