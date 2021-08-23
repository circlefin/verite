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
          <h2>Issue User Experience</h2>
          <p className="pb-4">
            Credentials and DID data may be custodied in crypto/identity wallets
            such as browser extensions, mobile apps, or hosted wallet providers.
            For this demo, begin the request protocol by scanning this QR code
            using the Verity demo mobile app wallet:
          </p>
          <QRCode
            value={JSON.stringify(qrCodeData)}
            className="w-48 h-48 mx-auto"
            renderAs="svg"
          />
          <h2>Behind the Scenes</h2>
          <p>
            The QR code contains a <code>challengeTokenUrl</code> that enables
            the wallet to retrieve a{" "}
            <Link href="https://identity.foundation/credential-manifest/">
              <a target="_blank">Credential Manifest</a>
            </Link>{" "}
            defining the credentials that the issuer can issue and how a wallet
            can request them. Credential Manifests are a developing standard by
            the Decentralized Identity Foundation (of which Centre is a member).
          </p>

          <pre>{JSON.stringify(qrCodeData, null, 4)}</pre>

          <p>
            This Credential Manifest contains the DID of the issuer, information
            about the supported cryptographic algorithms used in credentials and
            presentations, requirements for the requesting wallet (such as
            proving it controls its own DID), and other data to help the client
            compose a presentation to receive the credential.
          </p>

          <button
            className="flex justify-center text-md "
            onClick={() => {
              const el = document.getElementById("manifest")
              el.style.display = el.style.display === "" ? "block" : ""
            }}
          >
            <p className="font-semibold underline">
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
        </>
      )
    } else {
      return (
        <div className="space-y-4">
          <p>
            The issuer created a credential for a{" "}
            <Link href="https://www.w3.org/TR/did-core/">
              <a target="_blank">DID</a>
            </Link>{" "}
            owned by{" "}
            <b>
              <em>{user.email}</em>
            </b>
            . The issuer signed the Verifiable Credential with its own DID. The
            raw VC is below.
          </p>
          <p>
            <Link href="/verifier/" passHref>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next: Verification
                <ArrowCircleRightIcon
                  className="w-5 h-5 ml-2 -mr-1"
                  aria-hidden="true"
                />
              </button>
            </Link>
          </p>
          <h3>Raw KYC Verifiable Credential:</h3>
          <pre>{JSON.stringify(data.credential, null, 4)}</pre>
        </div>
      )
    }
  }

  return (
    <IssuerLayout title="KYC/AML Verifiable Credential">
      <div className="prose max-w-none">{credential(data)}</div>
    </IssuerLayout>
  )
}

export default KycAmlPage
