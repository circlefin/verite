import { challengeTokenUrlWrapper } from "@centre/verity"
import type { ChallengeTokenUrlWrapper } from "@centre/verity"
import { ArrowCircleRightIcon } from "@heroicons/react/solid"
import { NextPage } from "next"
import Link from "next/link"
import QRCode from "qrcode.react"
import useSWR from "swr"
import IssuerLayout from "../../components/issuer/Layout"
import { currentUser, requireAuth } from "../../lib/auth-fns"
import { temporaryAuthToken } from "../../lib/database"
import type { User } from "../../lib/database"
import { jsonFetch } from "../../lib/utils"

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

const KycAmlPage: NextPage<Props> = ({
  createdAt,
  manifest,
  qrCodeData,
  user
}) => {
  // Setup polling to detect a newly issued credential.
  const { data } = useSWR(
    `/api/demo/get-newest-credential-from?createdAt=${createdAt}`,
    jsonFetch,
    {
      refreshInterval: 1000
    }
  )

  // Newest Credential fragment
  const credential = (data) => {
    if (!data || data.status === 404) {
      return (
        <>
          <dl className="flex flex-row justify-center mx-auto space-x-2 sm:space-x-5">
            {stats.map((item) => (
              <div
                key={item.name}
                className="px-4 py-3 overflow-hidden text-center bg-white rounded-lg shadow sm:py-5 sm:px-6 flex-0"
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
          <p>
            Using the Verity app, scan this QR code and request credentials.
          </p>
          <QRCode
            value={JSON.stringify(qrCodeData)}
            className="w-48 h-48 mx-auto"
            renderAs="svg"
          />
          <h2>QR Code Data</h2>
          <pre>{JSON.stringify(qrCodeData, null, 4)}</pre>

          <h2>Credential Manifest</h2>
          <p>
            After following the url in `challengeTokenUrl`, the mobile
            application will receive the following, which instructs the client
            where and how to make the request to issue a new credential.
          </p>

          <p>
            Read more about{" "}
            <Link href="https://identity.foundation/credential-manifest/">
              Credential Manifest
            </Link>
            .
          </p>

          <pre>{JSON.stringify(manifest, null, 4)}</pre>
        </>
      )
    } else {
      return (
        <div className="space-y-4">
          <p>
            You&apos;ve successfully issued a credential. You can see the
            Verifiable Credential below.
          </p>
          <p>
            <Link href="/verifier/" passHref>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next Demo: Verification
                <ArrowCircleRightIcon
                  className="w-5 h-5 ml-2 -mr-1"
                  aria-hidden="true"
                />
              </button>
            </Link>
          </p>
          <h2>Credential</h2>
          <pre>{JSON.stringify(data.credential, null, 4)}</pre>
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
      <div className="prose">{credential(data)}</div>
    </IssuerLayout>
  )
}

export default KycAmlPage
