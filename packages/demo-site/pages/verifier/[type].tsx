import type { ChallengeTokenUrlWrapper } from "@centre/verity"
import { Web3Provider } from "@ethersproject/providers"
import { BadgeCheckIcon, XCircleIcon } from "@heroicons/react/outline"
import { ArrowCircleRightIcon } from "@heroicons/react/solid"
import { useWeb3React } from "@web3-react/core"
import { NextPage } from "next"
import Link from "next/link"
import { useRouter } from "next/router"
import QRCode from "qrcode.react"
import { useState, useEffect } from "react"
import useSWR from "swr"
import VerifierLayout from "../../components/verifier/Layout"
import { jsonFetch } from "../../lib/utils"

type QRCodeOrStatusProps = {
  qrCodeData: ChallengeTokenUrlWrapper
  status: string | null
}

function verificationUrl(
  baseUrl: string,
  subjectAddress: string,
  contractAddress: string
): string {
  const url = new URL(baseUrl)
  url.searchParams.append("subjectAddress", subjectAddress)
  url.searchParams.append("contractAddress", contractAddress)
  return url.href
}

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
      <pre>{JSON.stringify(qrCodeData, null, 4)}</pre>
    </>
  )
}

function GetStarted({ baseUrl, onClick }): JSX.Element {
  const { account } = useWeb3React<Web3Provider>()
  const [subjectAddress, setSubjectAddress] = useState<string>(account || "")
  const [contractAddress, setContractAddress] = useState<string>("")

  useEffect(() => {
    setSubjectAddress(account || "")
  }, [account])

  return (
    <>
      <p>
        To start, a dApp would issue an API call to a verifier to begin the
        verification flow. You can provide an optional ETH address and contract
        address. If given and the verification is successful, the Verifier will
        return a Verification Result and signature that can later be verified in
        a smart contract.
      </p>
      <p>
        This demo uses input fields, but a more user-friendly approach would be
        to have the user connect via MetaMask.
      </p>
      <div>
        <form>
          <div>
            <label
              htmlFor="subjectAddress"
              className="block text-sm font-medium text-gray-700"
            >
              ETH Address
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="subjectAddress"
                id="subjectAddress"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                onChange={(e) => setSubjectAddress(e.target.value)}
                value={subjectAddress}
                placeholder="0x..."
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="contractAddress"
              className="block text-sm font-medium text-gray-700"
            >
              Contract Address
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="contractAddress"
                id="contractAddress"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                onChange={(e) => setContractAddress(e.target.value)}
                value={contractAddress}
                placeholder="0x..."
              />
            </div>
          </div>
        </form>
      </div>
      <p>{verificationUrl(baseUrl, subjectAddress, contractAddress)}</p>
      <p>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => {
            onClick(subjectAddress, contractAddress)
          }}
        >
          Start Verification Flow
          <ArrowCircleRightIcon
            className="w-5 h-5 ml-2 -mr-1"
            aria-hidden="true"
          />
        </button>
      </p>
    </>
  )
}

function ScanView({ verification }): JSX.Element {
  const { qrCodeData, challenge } = verification

  const { data } = useSWR(
    () => `/api/verification/${verification.id}/status`,
    jsonFetch,
    { refreshInterval: 1000 }
  )
  const status = data && (data.status as string)
  const result = data && data.result

  if (!status) {
    return <></>
  }

  return (
    <>
      {status === "pending" && <p>Scan this QR code using the Verity app.</p>}

      <QRCodeOrStatus qrCodeData={qrCodeData} status={status} />

      {status === "pending" && (
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

          <pre>{JSON.stringify(challenge, null, 4)}</pre>
        </>
      )}

      {status === "approved" && (
        <>
          <p>Your credential is verified.</p>

          {result && (
            <>
              <p>
                The following verification result is returned and can be used in
                a smart contract.
              </p>
              <pre>{JSON.stringify(result, null, 4)}</pre>
            </>
          )}
        </>
      )}

      {status === "rejected" && <p>Your credential was not verified.</p>}

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
    </>
  )
}

const VerifierPage: NextPage = () => {
  const { query } = useRouter()
  const [verification, setVerification] = useState(null)
  const [title, setTitle] = useState("")
  const { type } = query
  const baseUrl = `${process.env.NEXT_PUBLIC_HOST}/api/verification?type=${type}`

  useEffect(() => {
    if (type === "kyc") {
      setTitle("KYC/AML Verification")
    } else {
      setTitle("Credit Score Verification")
    }
    setVerification(null)
  }, [type])

  return (
    <VerifierLayout title={title}>
      <div className="prose">
        {verification ? (
          <ScanView verification={verification} />
        ) : (
          <GetStarted
            baseUrl={baseUrl}
            onClick={async (subjectAddress, contractAddress) => {
              const url = verificationUrl(
                baseUrl,
                subjectAddress,
                contractAddress
              )
              const response = await fetch(url, { method: "POST" })
              const json = await response.json()
              setVerification(json)
            }}
          />
        )}
      </div>
    </VerifierLayout>
  )
}

export default VerifierPage
