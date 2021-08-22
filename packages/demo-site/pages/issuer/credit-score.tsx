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
    <IssuerLayout title="Credit Score Verifiable Credential">
      <div className="prose">
        <h2>User Experience</h2>
        <p>
          Credentials contain data specific to their schema types. Compared to a
          KYC/AML credential, a credential that attests to a credit score has
          additional data to contain a numeric score, and the credential expires
          relatively quickly.
        </p>
        <p>
          The currently signed-in user for this demonstration has the following
          credit score:
        </p>
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
        <p>
          Request a credit score credential by scanning this QR code with the
          Verity mobile app:
        </p>
        <QRCode
          value={JSON.stringify(qrCodeData)}
          className="w-48 h-48 mx-auto"
          renderAs="svg"
        />
        <h2>Behind the Scenes</h2>

        <p>
          As in the KYC/AML example, the QR code contains a{" "}
          <code>challengeTokenUrl</code> that enables the wallet to retrieve a{" "}
          <Link href="https://identity.foundation/credential-manifest/">
            <a target="_blank">Credential Manifest</a>
          </Link>{" "}
          defining the credentials that the issuer can issue and how a wallet
          can request them. It looks like this:
        </p>

        <pre>{JSON.stringify(qrCodeData, null, 4)}</pre>

        <button
          className="flex justify-center text-md "
          onClick={() => {
            const el = document.getElementById("manifest")
            el.style.display = el.style.display === "" ? "block" : ""
          }}
        >
          <p className="underline font-semibold">
            Show/Hide the Complete Credential Manifest
          </p>
        </button>

        <div id="manifest" className="hidden">
          <pre>{JSON.stringify(manifest, null, 4)}</pre>
        </div>

        <p>
          After scanning the QR code and completing the protocol sequence, you
          will be able to view the actual Verifiable Credential.
        </p>
      </div>
    </IssuerLayout>
  )
}

export default CreditScorePage
