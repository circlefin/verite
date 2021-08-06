import {
  challengeTokenUrlWrapper,
  generateCreditScoreVerificationRequest,
  generateKycVerificationRequest
} from "@centre/verity"
import type { ChallengeTokenUrlWrapper } from "@centre/verity"
import { BadgeCheckIcon, XCircleIcon } from "@heroicons/react/outline"
import { ArrowCircleRightIcon } from "@heroicons/react/solid"
import { GetServerSideProps, NextPage } from "next"
import Link from "next/link"
import QRCode from "qrcode.react"
import useSWR from "swr"
import { v4 as uuidv4 } from "uuid"
import VerifierLayout from "../../components/verifier/Layout"
import { saveVerificationRequest } from "../../lib/database"

type Props = {
  challenge: Record<string, unknown>
  qrCodeData: ChallengeTokenUrlWrapper
  id: string
  type: string
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const type = context.params.type
  if (type !== "kyc" && type !== "credit-score") {
    return {
      redirect: {
        permanent: false,
        destination: "/verifier"
      }
    }
  }

  let verificationRequest
  if (type === "kyc") {
    const id = uuidv4()
    verificationRequest = await generateKycVerificationRequest(
      process.env.VERIFIER_DID,
      `${process.env.HOST}/api/verification/${id}`,
      process.env.VERIFIER_DID,
      `${process.env.HOST}/api/verification/${id}/callback`,
      [process.env.ISSUER_DID],
      id
    )
  } else if (type === "credit-score") {
    const id = uuidv4()
    verificationRequest = await generateCreditScoreVerificationRequest(
      process.env.VERIFIER_DID,
      `${process.env.HOST}/api/verification/${id}`,
      process.env.VERIFIER_DID,
      `${process.env.HOST}/api/verification/${id}/callback`,
      [process.env.ISSUER_DID],
      id
    )
  }
  await saveVerificationRequest(verificationRequest)

  const qrCodeData = challengeTokenUrlWrapper(
    `${process.env.HOST}/api/verification/${verificationRequest.request.id}`
  )

  const response = await fetch(qrCodeData.challengeTokenUrl)
  const challenge = await response.json()

  return {
    props: {
      challenge,
      id: verificationRequest.request.id,
      qrCodeData,
      type
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
      <h2>QR Code Data</h2>
      <p>
        <pre>{JSON.stringify(qrCodeData, null, 4)}</pre>
      </p>
    </>
  )
}

const VerifierPage: NextPage<Props> = ({ challenge, id, qrCodeData, type }) => {
  const { data } = useSWR(`/api/verification/${id}/status`, fetcher, {
    refreshInterval: 1000
  })
  const status = data && data.status

  let title
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
            <p>
              <pre>{JSON.stringify(challenge, null, 4)}</pre>
            </p>
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
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Next Demo: Revocation
                <ArrowCircleRightIcon
                  className="ml-2 -mr-1 h-5 w-5"
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
