import { challengeTokenUrlWrapper } from "@centre/verity"
import type { ChallengeTokenUrlWrapper } from "@centre/verity"
import { BadgeCheckIcon, XCircleIcon } from "@heroicons/react/outline"
import { ArrowCircleRightIcon } from "@heroicons/react/solid"
import { GetServerSideProps, NextPage } from "next"
import Link from "next/link"
import QRCode from "qrcode.react"
import useSWR from "swr"
import VerifierLayout from "../../components/verifier/Layout"
import { saveVerificationRequest } from "../../lib/database"
import { generateKycVerificationRequest } from "../../lib/verification/requests"

type Props = {
  qrCodeData: ChallengeTokenUrlWrapper
  id: string
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const verificationRequest = await generateKycVerificationRequest()
  await saveVerificationRequest(verificationRequest)

  const qrCodeData = challengeTokenUrlWrapper(
    `${process.env.HOST}/api/verification/${verificationRequest.request.id}`
  )

  return {
    props: {
      id: verificationRequest.request.id,
      qrCodeData
    }
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
      <textarea
        className="container h-40 mx-auto font-mono text-sm border-2"
        readOnly
        value={JSON.stringify(qrCodeData, null, 4)}
      />
    </>
  )
}

const VerifierPage: NextPage<Props> = ({ id, qrCodeData }) => {
  const { data } = useSWR(`/api/verification/${id}/status`, fetcher, {
    refreshInterval: 1000
  })
  const status = data && data.status

  return (
    <VerifierLayout title="KYC/AML Verification">
      <div className="space-y-8">
        <QRCodeOrStatus qrCodeData={qrCodeData} status={status} />

        {status === "approved" ? <div>Your credential is verified.</div> : null}

        {status === "rejected" ? (
          <div>Your credential was not verified.</div>
        ) : null}

        {status === "approved" || status === "rejected" ? (
          <div>
            <Link href="/revocation" passHref>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next Demo: Revocation
                <ArrowCircleRightIcon
                  className="ml-2 -mr-1 h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </Link>
          </div>
        ) : null}
      </div>
    </VerifierLayout>
  )
}

export default VerifierPage
