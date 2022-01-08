import {
  randomDidKey,
  buildAndSignVerifiableCredential,
  KYCAMLAttestation,
  buildIssuer,
  decodeVerifiableCredential,
  RevocableCredential,
  buildPresentationSubmission,
  VerificationOffer,
  ChallengeTokenUrlWrapper
} from "@verity/core"
import type { Verifiable } from "@verity/core"
import Head from "next/head"
import QRCode from "qrcode.react"
import { useState } from "react"
import useSWRImmutable from "swr/immutable"
import { W3CCredential } from "did-jwt-vc"
import { CheckIcon, XIcon } from "@heroicons/react/solid"

const holder = randomDidKey()

/**
 * Issue a Verifiable Credential. This would traditionally be issued by the
 * issuer, but for the sake of the demo's focus on verification, we will do it
 * here. Note that a verifier and an issuer are not necessarily the same, so we
 * intentionally are not having the server return it to us in this demo.
 */
const issueCredential = async () => {
  // In a production environment, these values would be secured by the issuer
  const issuer = buildIssuer(
    process.env.NEXT_PUBLIC_ISSUER_DID,
    process.env.NEXT_PUBLIC_ISSUER_SECRET
  )

  // We will create a random did to represent our own identity wallet
  const subject = holder

  // Stubbed out credential data
  const attestation: KYCAMLAttestation = {
    "@type": "KYCAMLAttestation",
    process: "https://demos.verite.id/schemas/definitions/1.0.0/kycaml/usa",
    approvalDate: new Date().toISOString()
  }

  // Generate the signed, encoded credential
  const encoded = await buildAndSignVerifiableCredential(
    issuer,
    subject,
    attestation
  )

  const decoded = await decodeVerifiableCredential(encoded)

  return decoded
}
/**
 * Using Presentation Exchange, this is an API call that simulates the server
 * returning a Presentation Request, which will instruct the client how to
 * complete verification.
 */
const somethingThatRequiresVerification = async () => {
  // Assuming 0x18Fc8eA6c36f76b4B7DB6367657512a491BFe111 is our eth address
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASEURL}/api/job?subjectAddress=0x18Fc8eA6c36f76b4B7DB6367657512a491BFe111`,
    { method: "POST" }
  )
  if (response.ok) {
    return response.json()
  }
}

export default function Home(): JSX.Element {
  // Challenge Response
  const [challengeResponse, setChallengeResponse] = useState()

  // Whether verification is successful or not.
  const [result, setResult] = useState<boolean>()

  // Credential
  const { data: credential } = useSWRImmutable("credential", async () =>
    issueCredential()
  )

  // Verification Presentation Request
  const { data: jobResponse } = useSWRImmutable(
    "somethingThatRequiresVerification",
    async () => somethingThatRequiresVerification()
  )
  const verificationRequest = challengeResponse

  // Signature returned after completing verification
  const [signature, setSignature] = useState()

  const simulateScan = async (challenge: ChallengeTokenUrlWrapper) => {
    const url = challenge.challengeTokenUrl
    const response = await fetch(url, {
      method: "GET"
    })
    if (response.ok) {
      const json = await response.json()
      setChallengeResponse(json)
      return json
    }
  }

  // API call to complete verification
  const verifyCredential = async (
    verificationRequest: VerificationOffer,
    credential: Verifiable<W3CCredential> | RevocableCredential
  ) => {
    const subject = holder
    const request = await buildPresentationSubmission(
      subject,
      verificationRequest.body.presentation_definition,
      credential
    )

    const response = await fetch(verificationRequest.reply_url, {
      method: "POST",
      body: request
    })

    if (response.ok) {
      const json = await response.json()
      setResult(true)
      setSignature(json)
    } else {
      setResult(false)
    }
  }

  // Determine which page to show
  let page: string
  if (signature) {
    page = "done"
  } else if (verificationRequest) {
    page = "verification"
  } else if (jobResponse) {
    page = "challenge"
  }

  // Component to render the QR code
  const Scan = ({ challenge }) => {
    return (
      <>
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900">
              Scan this QR Code with your mobile wallet
            </h3>
            <div className="prose">
              <QRCode
                value={JSON.stringify(challenge)}
                className="w-48 h-48"
                renderAs="svg"
              />
              <pre>{JSON.stringify(challenge, null, 4)}</pre>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  simulateScan(challenge)
                }}
                className="inline-flex items-center px-4 py-2 font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
              >
                Simulate Scanning
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Component to render a Manifest
  const VerificationOffer = ({
    presentationRequest
  }: {
    presentationRequest: VerificationOffer
  }) => {
    const input =
      presentationRequest.body.presentation_definition.input_descriptors[0]
    const title = input.name
    const description = input.purpose

    return (
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {result === true ? (
            <span className="flex flex-row items-center">
              <CheckIcon className="inline w-16 h-16 text-green-500"></CheckIcon>
              <span className="text-xl">Verified</span>
            </span>
          ) : null}

          {result === false ? (
            <span className="flex flex-row items-center">
              <XIcon className="inline w-16 h-16 text-red-500"></XIcon>
              <span className="text-xl">Not Verified</span>
            </span>
          ) : null}

          {result === undefined ? (
            <>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {title}
              </h3>
              <div className="max-w-xl mt-2 text-sm text-gray-500">
                <p>{description}</p>
              </div>
              <div className="mt-5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    verifyCredential(presentationRequest, credential)
                  }}
                  className="inline-flex items-center px-4 py-2 font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                >
                  Verify Credential
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    )
  }

  // Component to render the final successful result
  const VerificationResult = ({ result }) => {
    return (
      <>
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="mb-4 text-lg font-medium leading-6 text-gray-900">
              Verification Signature
            </h3>
            <div className="max-w-xl mt-2 text-sm text-gray-500">
              <p>
                After successful verification, the verifier will return a
                VerificationInfo object. These are encoded, hashed, and signed
                following{" "}
                <a href="https://eips.ethereum.org/EIPS/eip-712">EIP-712</a>.
                This signature, can be used when calling a compatible smart
                contract to guarantee the calling address satisfies the
                verifier&apos;s requirements.
              </p>
            </div>
            <div className="mt-4 prose">
              <pre>{JSON.stringify(result, null, 4)}</pre>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen py-2">
      <Head>
        <title>Verity Demo: Verifier</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-full px-20 pt-10 pb-20 space-y-8">
        <div className="prose">
          <h1>Verifier Demo</h1>
          <p>
            This is a simple example of how to verify a credential using a
            self-custodied identity wallet.
          </p>
          <p>
            The first page prompts a compatable mobile wallet to scan a QR code.
            When you click <em>Simulate Scanning</em>, it will follow the URL to
            retrieve the full presentation request. Assuming the mobile wallet
            does not share state with the browser, details about the user and
            verification request are encoded in a JWT and passed along in the
            URL.
          </p>
          <p>
            Using{" "}
            <a href="https://identity.foundation/presentation-exchange">
              Presentation Exchange
            </a>{" "}
            the server will prompt us to provide a credential that satisfies its
            constraints. When you click the <em>Verify Credential</em> button,
            it will submit it to the server to be verified.
          </p>
        </div>
        {page === "challenge" ? <Scan challenge={jobResponse}></Scan> : null}

        {page === "verification" ? (
          <>
            <VerificationOffer
              presentationRequest={verificationRequest}
            ></VerificationOffer>

            <div className="prose">
              <h2>Presentation Request</h2>
              <p>
                Then, using the Presentation Exchange spec, the server will
                issue a Presentation Request that we, as the client, will
                fulfill. Below is the Presentation Request.
              </p>
            </div>
            <div className="prose" style={{ maxWidth: "100%" }}>
              <pre>{JSON.stringify(verificationRequest, null, 4)}</pre>
            </div>
            <div className="prose">
              <h2>Verifiable Credential</h2>
              <p>
                This is the Verifiable Credential we will use for verification.
              </p>
            </div>
            <div className="prose" style={{ maxWidth: "100%" }}>
              <pre>{JSON.stringify(credential, null, 4)}</pre>
            </div>
          </>
        ) : null}

        {page === "done" ? (
          <VerificationResult result={signature}></VerificationResult>
        ) : null}
      </main>
    </div>
  )
}
