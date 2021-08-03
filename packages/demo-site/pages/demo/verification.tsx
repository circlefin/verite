import type { VerificationRequest } from "@centre/verity"
import { GetServerSideProps, NextPage } from "next"
import Link from "next/link"
import DemoLayout from "../../components/demo/Layout"
import QRCodeOrStatus from "../../components/issuer/QRCodeOrStatus"
import { requireAuth } from "../../lib/auth-fns"
import { saveVerificationRequest } from "../../lib/database"
import { generateKycVerificationRequest } from "../../lib/verification/requests"

export type VerificationRequestWrapper = {
  requestUrl: string
  version: string
}

type Props = {
  verificationRequest: VerificationRequest
  verificationRequestWrapper: VerificationRequestWrapper
  id: string
}

export const getServerSideProps: GetServerSideProps<Props> = requireAuth(
  async () => {
    const verificationRequest = generateKycVerificationRequest()
    await saveVerificationRequest(verificationRequest)

    const verificationRequestWrapper: VerificationRequestWrapper = {
      requestUrl: `${process.env.HOST}/api/verification/${verificationRequest.request.id}`,
      version: "1"
    }

    return {
      props: {
        id: verificationRequest.request.id,
        verificationRequestWrapper,
        verificationRequest
      }
    }
  }
)

const DemoPage: NextPage<Props> = ({
  id,
  verificationRequest,
  verificationRequestWrapper
}) => {
  return (
    <DemoLayout title="Demo: Verification">
      <p>
        When a service, such as Compound Finance, requires verification of a
        credential from a customer&apos;s mobile (iOS) wallet, they begin by
        presenting a QR code to scan.
      </p>
      <p className="mt-4">
        Using the Verity mobile application, scan the QR code. A user could
        potentially have many credentials so you will be prompted to pick one to
        satisfy the request.
      </p>
      <p className="mt-4">
        After verification is complete, the callback URL provided by the service
        will be hit with the results. You will see after verifying the QR code
        turn into a checkmark.
      </p>

      <div className="mt-4">
        <QRCodeOrStatus id={id} qrcodeData={verificationRequestWrapper} />
      </div>

      <div className="mt-4">
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Link href="revocation">Next Demo: Revocation</Link>
        </button>
      </div>

      <h2 className="mt-4 text-lg font-semibold">How it works:</h2>
      <p className="mt-4">
        Like issuance, the QR code contains a minimal amount of data to keep its
        complexity as low as possible for easy scanning. The mobile wallet will
        follow the URL for more details.
      </p>
      <p className="mt-4">
        The Presentation Request describes what a verifier requires. In this
        example, the service is requesting a KYC credential issued by one of
        three trusted verifiers.
      </p>
      <p className="mt-4">
        Upon picking a credential, the mobile wallet will submit a the
        credential to the `reply_to` URL, which will return a verification
        result. The wallet will then proxy the same result to the
        `callback_url`.
      </p>
      <p className="mt-4">
        In the real world, the `reply_to` URL will be to a trusted 3rd party
        verification service, such as Centre. And the `callback_url` will be
        defined by the service such that it can be notified of the result.
      </p>

      <div className="container mt-8 mx-auto font-mono text-sm border-2 overflow-scroll">
        <pre>{JSON.stringify(verificationRequest, null, 4)}</pre>
      </div>
    </DemoLayout>
  )
}

export default DemoPage
