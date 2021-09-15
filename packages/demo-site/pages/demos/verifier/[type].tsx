import { Disclosure } from "@headlessui/react"
import { BadgeCheckIcon, XCircleIcon } from "@heroicons/react/outline"
import { ArrowCircleRightIcon } from "@heroicons/react/solid"
import { GetServerSideProps, NextPage } from "next"
import Link from "next/link"
import { useRouter } from "next/router"
import QRCode from "qrcode.react"
import useSWR from "swr"
import VerifierLayout from "../../../components/verifier/Layout"
import { fullURL, jsonFetch } from "../../../lib/utils"
import {
  createVerificationRequest,
  VerificationRequestResponse
} from "../../../lib/verification-request"

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
  const title = type === "kyc" ? "KYC/AML" : "Credit Score"
  const { qrCodeData, challenge } = verification

  const { data } = useSWR(
    () => fullURL(`/api/verification/${verification.id}/status`),
    jsonFetch,
    { refreshInterval: 1000 }
  )
  const status = (data && (data.status as string)) || "pending"
  const result = data && data.result

  return (
    <VerifierLayout>
      <div className="prose max-w-none">
        {status === "pending" && (
          <>
            <h2>{title} Verification User Experience</h2>
            <p>
              Using the Verity demo wallet app, scan this QR code to begin the
              verification sequence:
            </p>
            <QRCode
              value={JSON.stringify(qrCodeData)}
              className="w-48 h-48 mx-auto"
              renderAs="svg"
            />
            <h2>Behind the Scenes</h2>
            <p>
              The QR code informs the wallet where to retrieve a{" "}
              <Link href="https://identity.foundation/presentation-exchange/#presentation-request">
                <a target="_blank">Presentation Request</a>
              </Link>
              . The QR code contains the following data:
            </p>
            <pre>{JSON.stringify(qrCodeData, null, 4)}</pre>
            <h2>Verification Presentation Request</h2>
            <p>
              After following the url in <code>challengeTokenUrl</code>, the
              wallet receives a complete Presentation Request, which instructs
              the wallet where and how to make the request to verify the
              credential.
            </p>

            <Disclosure>
              <Disclosure.Button>
                <p className="font-semibold underline text-md">
                  Show/Hide the Complete Presentation Request
                </p>
              </Disclosure.Button>
              <Disclosure.Panel>
                <pre>{JSON.stringify(challenge, null, 4)}</pre>
              </Disclosure.Panel>
            </Disclosure>

            <p>
              Once the client has the Presentation Request, it wraps the
              relevant Verifiable Crdential inside a{" "}
              <Link href="https://www.w3.org/TR/vc-data-model/#presentations-0">
                <a target="_blank">Verifiable Presentation</a>
              </Link>{" "}
              (preventing relay attacks). It then signs the Verifiable
              Presentation using its DID key and transmits it to the verifier.
            </p>
          </>
        )}

        {status === "approved" && (
          <>
            <h3>
              The Presentation Exchange completed and the credential was
              verified.
            </h3>

            <BadgeCheckIcon className="mx-auto text-green-600 w-36 h-36" />

            {result && (
              <>
                <p>
                  The verifier signed and returned the following verification
                  result, which can be used by a relying party such as a smart
                  contract that can validate the result.
                </p>
                <pre>{JSON.stringify(result, null, 4)}</pre>
              </>
            )}
          </>
        )}

        {status === "rejected" && (
          <>
            <h3>Your credential was not verified.</h3>
            <XCircleIcon className="mx-auto text-red-400 w-36 h-36" />
          </>
        )}

        {(status === "approved" || status === "rejected") && (
          <p>
            <Link href="/revocation" passHref>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next: Issuers Can Revoke Credentials
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
