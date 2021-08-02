import { challengeTokenUrlWrapper } from "@centre/verity"
import type { ChallengeTokenUrlWrapper } from "@centre/verity"
import { BadgeCheckIcon, XCircleIcon } from "@heroicons/react/outline"
import { GetServerSideProps, NextPage } from "next"
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

const fetcher = (url) => fetch(url).then((res) => res.json())

function QRCodeOrStatus({ id, qrCodeData }: Props): JSX.Element {
  const { data } = useSWR(`/api/verification/${id}/status`, fetcher, {
    refreshInterval: 1000
  })

  if (data) {
    if (data.status === "approved") {
      return <BadgeCheckIcon className="w-48 h-48 mx-auto text-green-400" />
    } else if (data.status === "rejected") {
      return <XCircleIcon className="w-48 h-48 mx-auto text-red-400" />
    }
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
  return (
    <VerifierLayout title="KYC/AML Verification">
      <div className="flex flex-col justify-center space-y-8">
        <QRCodeOrStatus id={id} qrCodeData={qrCodeData} />
      </div>
    </VerifierLayout>
  )
}

export default VerifierPage
