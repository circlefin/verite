import type { ChallengeTokenUrlWrapper } from "@centre/verity"
import { BadgeCheckIcon, XCircleIcon } from "@heroicons/react/outline"
import { ArrowCircleRightIcon } from "@heroicons/react/solid"
import { GetServerSideProps, NextPage } from "next"
import Link from "next/link"
import QRCode from "qrcode.react"
import useSWR from "swr"
import VerifierLayout from "../../components/verifier/Layout"

type Props = {
  challenge: Record<string, unknown>
  qrCodeData: ChallengeTokenUrlWrapper
  id: string
  type: string
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const response = await fetch(
    `${process.env.HOST}/api/verification/create?type=${context.params.type}`,
    { method: "POST" }
  )
  const json = await response.json()

  return {
    props: json
  }
}

type QRCodeOrStatusProps = {
  qrCodeData: ChallengeTokenUrlWrapper
  status: string | null
}

const fetcher = (url) => fetch(url).then((res) => res.json())

function QRCodeOrStatus({
  qrCodeData,
  status
}: QRCodeOrStatusProps): JSX.Element {
  if (status === "approved") {
    return <BadgeCheckIcon className="w-48 h-48 mx-auto text-green-400" />
  } else if (status === "rejected") {
    return <XCircleIcon className="w-48 h-48 mx-auto text-red-400" />
  }

  return (
    <>
      <QRCode
        value={JSON.stringify(qrCodeData)}
        className="w-48 h-48 mx-auto"
        renderAs="svg"
      />
      <h2>QR Code Data</h2>
      <pre>{JSON.stringify(qrCodeData, null, 4)}</pre>
    </>
  )
}

const VerifierPage: NextPage<Props> = ({ challenge, id, qrCodeData, type }) => {
  const { data } = useSWR(`/api/verification/${id}/status`, fetcher, {
    refreshInterval: 1000
  })
  const status = data && data.status

  let title: string
  if (type === "kyc") {
    title = "KYC/AML Verification"
  } else if (type === "credit-score") {
    title = "Credit Score Verification"
  }

  return (
    <VerifierLayout title={title}>
      <div className="prose">
        {status === "pending" ? (
          <p>Scan this QR code using the Verity app.</p>
        ) : null}

        <QRCodeOrStatus qrCodeData={qrCodeData} status={status} />

        {status === "pending" ? (
          <>
            <h2>Verification Presentation Request</h2>
            <p>
              After following the url in `challengeTokenUrl`, the mobile
              application will receive the following, which instructs the client
              where and how to make the request to verify the credential.
            </p>
            <p>
              Read more about{" "}
              <Link href="https://identity.foundation/presentation-exchange/">
                Presentation Exchange
              </Link>
              .
            </p>

            <pre>{JSON.stringify(challenge, null, 4)}</pre>
          </>
        ) : null}

        {status === "approved" ? <p>Your credential is verified.</p> : null}

        {status === "rejected" ? (
          <p>Your credential was not verified.</p>
        ) : null}

        {status === "approved" || status === "rejected" ? (
          <p>
            <Link href="/admin" passHref>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next Demo: Revocation
                <ArrowCircleRightIcon
                  className="w-5 h-5 ml-2 -mr-1"
                  aria-hidden="true"
                />
              </button>
            </Link>
          </p>
        ) : null}
      </div>
    </VerifierLayout>
  )
}

export default VerifierPage
