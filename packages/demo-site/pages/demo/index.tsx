import { NextPage } from "next"
import Link from "next/link"
import DemoLayout from "../../components/demo/Layout"
import { requireAuth } from "../../lib/auth-fns"

export const getServerSideProps = requireAuth(async () => {
  return {
    props: {}
  }
})

const DemoPage: NextPage = () => {
  return (
    <DemoLayout title="Demo">
      <p className="mt-4">
        This demo captures 3 key sequences: issuance, verification, and
        revocation of credentials.
      </p>
      <p className="mt-4">
        <strong>Basic issuance:</strong> Demonstrate how an issuer, such as
        Coinbase, issues a KYC and credit score credential to a customer’s
        mobile (iOS) wallet, and describe the same process for browser
        (MetaMask) and hosted wallets.
      </p>

      <p className="mt-4">
        <strong>Basic verification:</strong> Demonstrate how a verifier,
        including a DeFi smart contract as well as a central service such as
        Circle, requests proof of KYC and how the customer provides it using the
        previously-issued credential (show both web and mobile wallet).
      </p>
      <p className="mt-4">
        <strong>Revocation:</strong> Demonstrate how an issuer such as Coinbase
        can revoke one of its previously-issued credentials.
      </p>
      <p className="mt-4">
        <Link href="/demo/issuance" passHref>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Get Started
          </button>
        </Link>
      </p>
    </DemoLayout>
  )
}

export default DemoPage
