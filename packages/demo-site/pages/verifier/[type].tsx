import {
  createVerificationRequest,
  VerificationRequestResponse
} from "@centre/demo-site/lib/verification-request"
import { BadgeCheckIcon, XCircleIcon } from "@heroicons/react/outline"
import { ArrowCircleRightIcon } from "@heroicons/react/solid"
import { GetServerSideProps, NextPage } from "next"
import Link from "next/link"
import { useRouter } from "next/router"
import QRCode from "qrcode.react"
import useSWR from "swr"
import VerifierLayout from "../../components/verifier/Layout"
import { jsonFetch } from "../../lib/utils"

type Props = {
  verification: VerificationRequestResponse
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const verification = await createVerificationRequest(ctx.query.type as string)

  return {
    props: {
      verification
    }
  }
}

const VerifierPage: NextPage<Props> = ({ verification }) => {
  const { query } = useRouter()
  const { type } = query
  const title =
    type === "kyc" ? "KYC/AML Verification" : "Credit Score Verification"
  const { qrCodeData, challenge } = verification

  const { data } = useSWR(
    () => `/api/verification/${verification.id}/status`,
    jsonFetch,
    { refreshInterval: 1000 }
  )
  const status = (data && (data.status as string)) || "pending"
  const result = data && data.result

  return (
    <VerifierLayout title={title}>
      <div className="prose">
        {status === "pending" && (
          <>
            <p>
              Using the Verity app, scan this QR code to submit your
              credentials.
            </p>
            <QRCode
              value={JSON.stringify(qrCodeData)}
              className="w-48 h-48 mx-auto"
              renderAs="svg"
            />
            <h2>QR Code Data</h2>
            <pre>{JSON.stringify(qrCodeData, null, 4)}</pre>
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
        )}

        {status === "approved" && (
          <>
            <BadgeCheckIcon className="w-48 h-48 mx-auto text-green-400" />
            <p>Your credential is verified.</p>

            {result && (
              <>
                <p>
                  The following verification result is returned and can be used
                  in a smart contract.
                </p>
                <pre>{JSON.stringify(result, null, 4)}</pre>
              </>
            )}
          </>
        )}

        {status === "rejected" && (
          <>
            <XCircleIcon className="w-48 h-48 mx-auto text-red-400" />
            <p>Your credential was not verified.</p>
          </>
        )}

        {(status === "approved" || status === "rejected") && (
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
        )}
      </div>
    </VerifierLayout>
  )
}

export default VerifierPage
