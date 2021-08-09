import { challengeTokenUrlWrapper, manifestWrapper } from "@centre/verity"
import type { ChallengeTokenUrlWrapper, ManifestWrapper } from "@centre/verity"
import { NextPage } from "next"
import Link from "next/link"
import QRCode from "qrcode.react"
import DemoLayout from "../../components/demo/Layout"
import { currentUser, requireAuth } from "../../lib/auth-fns"
import { temporaryAuthToken } from "../../lib/database"
import { MANIFEST_MAP } from "../../lib/manifest"

type Props = {
  qrCodeData: ChallengeTokenUrlWrapper
  responseData: ManifestWrapper
}

export const getServerSideProps = requireAuth<Props>(async (context) => {
  const user = await currentUser(context)
  const authToken = await temporaryAuthToken(user)
  const qrCodeData = challengeTokenUrlWrapper(
    `${process.env.HOST}/api/manifests/kyc/${authToken}`
  )
  const manifest = MANIFEST_MAP["kyc"]
  const responseData = manifestWrapper(
    manifest,
    `${process.env.HOST}/api/issuance/${authToken}`
  )

  return {
    props: {
      qrCodeData,
      responseData
    }
  }
})

const DemoPage: NextPage<Props> = ({ qrCodeData, responseData }) => {
  const nextDemoButton = (
    <div className="mt-4">
      <Link href="verification" passHref>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Next Demo: Verification
        </button>
      </Link>
    </div>
  )

  return (
    <DemoLayout title="Demo: Issuance">
      {/* TODO: Add hint about the env variable. */}
      <p>
        When an issuer, such as Coinbase, issues a KYC and credit score
        credential to a customer&apos;s mobile (iOS) wallet, they begin by
        presenting a QR code to scan.
      </p>
      <p className="mt-4">
        Using the Verity mobile application, scan the QR code. You should be
        prompted whether you want to complete the request. After tapping
        &quot;Request&quot; you will be issued a credential titled &quot;Proof
        of KYC from Verity&quot;
      </p>

      <p
        className={`mt-4 ${
          process.env.HOSTNAME === "localhost" ? "font-semibold" : ""
        }`}
      >
        <strong>Dev note:</strong> Since we are running the demo locally, you
        will need to update your{" "}
        <a href="https://github.com/centrehq/demo-site/blob/main/packages/demo-site/.env.development">
          .env.development
        </a>{" "}
        file and set your HOSTNAME to your IP address. Note that you must
        restart your server for it to take effect. The host for the manifestUrl
        and submissionUrl shown below should reflect your IP address, not
        localhost.
      </p>

      <div>
        <QRCode
          value={JSON.stringify(qrCodeData)}
          className="w-48 h-48 mt-8"
          renderAs="svg"
        />
        <div className="container mx-auto mt-8 overflow-scroll font-mono text-sm border-2">
          <pre>{JSON.stringify(qrCodeData, null, 4)}</pre>
        </div>
      </div>

      <p className="mt-4">
        Read on below for more details or skip to the next demo.
      </p>

      {nextDemoButton}

      <h2 className="mt-4 text-lg font-semibold">How it works:</h2>
      {/* TODO: Add summary of Verifiable Credentials, Presentations, DIDs, and did:key */}
      <p className="mt-4">Verity uses the Verifiable Credentials Data Model.</p>
      <p className="mt-4">
        A DID is a decentralized identifier associated with a subject. There are
        several DID methods, or ways to generate and resolve DIDs, but for demo
        purposes we use the{" "}
        <a href="https://w3c-ccg.github.io/did-method-key/">did:key method</a>.
        They are created by generating a keypair. The public key is used as the
        identifier and the private key is used to sign and verify ownership of
        the did. For our demo, the wallet application will generate a DID to
        identify itself.
      </p>
      <p className="mt-4">
        Verifiable Credentials are a set of claims by an issuer about the
        subject. The subject is referenced by its DID. The claims can be
        cryptographically verified with a proof signed by the issuer.
      </p>
      <p className="mt-4">
        Verifiable Credentials are generally not used on their own. Instead,
        they are wrapped with a Verifiable Presentation. This allows you to
        present one or more credentials at a time or even data synthesized from,
        but do not contain, the original verifiable credential.
      </p>
      <p className="mt-4">
        The QR code contains metadata necessary to fetch the Credential
        Manifest, a URL to submit the request, and a version number. A minimal
        amount of information is given to keep the QR code complexity as low as
        possible for easy scanning.
      </p>
      <p className="mt-4">
        The Credential Manifest contains information such as: the credential
        that will be issued, some style and display properties to assist in
        presenting it to a user, and the inputs necessary to make the request.
        Below is an example manifest.
      </p>
      <p className="mt-4">
        {/* TODO: This explanation is unclear, however I am not sure how to explain it */}
        For project Verity, the only input necessary is an empty Verifiable
        Presentation used to verify proof of identifier ownership of the DID.
      </p>
      <div className="container mx-auto mt-4 overflow-scroll font-mono text-sm border-2">
        {/* TODO: Why are there undefined values in this? */}
        <pre>{JSON.stringify(responseData, null, 4)}</pre>
      </div>

      {nextDemoButton}
    </DemoLayout>
  )
}

export default DemoPage
