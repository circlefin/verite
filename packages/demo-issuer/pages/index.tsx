import { randomBytes } from "crypto"
import jwt from "jsonwebtoken"
import Head from "next/head"
import { QRCodeSVG } from "qrcode.react"
import { useState } from "react"
import {
  randomDidKey,
  composeCredentialApplication,
  verifyVerifiablePresentation,
  challengeTokenUrlWrapper,
  ChallengeTokenUrlWrapper,
  CredentialOffer,
  DecodedCredentialFulfillment,
  DecodedCredentialApplication,
  evaluateCredentialApplication
} from "verite"

import type { RevocablePresentation, Verifiable, W3CPresentation } from "verite"

type Presentation = Verifiable<W3CPresentation | RevocablePresentation>

type ServerProps = {
  props: {
    challenge: ChallengeTokenUrlWrapper
  }
}

export const getServerSideProps = (): ServerProps => {
  /**
   * Note: This code is run on the server
   *
   * For this demo, we intend to issue a credential to a mobile wallet. We
   * assume that user 1 is signed in to the current browser session. However,
   * the mobile wallet likely will not share an authenticated session. To tie
   * the two together, we will embed a JWT into the url the mobile wallet will
   * ultimately call to issue the credential.
   */

  const secret = process.env.NEXT_PUBLIC_JWT_SECRET
  const token = jwt.sign({}, secret, {
    subject: "1",
    algorithm: "HS256",
    expiresIn: "1h"
  })

  // Create the challengeTokenUrl response
  // In a production environment, you need to use an absolute URL. For
  // simplicity of the demo, we hardcode it to localhost:3000. This means you
  // likely cannot issue to a mobile wallet (e.g. as the wallet would not
  // resolve localhost to the demo API). If you bind the server to any other
  // host or port, you will need to change this value.
  const url = `${process.env.NEXT_PUBLIC_BASEURL}/api/challenges/${token}`
  const challenge = challengeTokenUrlWrapper(url)
  return {
    props: {
      challenge
    }
  }
}

export default function Home({
  challenge
}: {
  challenge: ChallengeTokenUrlWrapper
}): JSX.Element {
  // To simulate a mobile wallet, we generate a random keypair.
  const subject = randomDidKey(randomBytes)

  // Challenge Response
  const [challengeResponse, setChallengeResponse] = useState()

  // Credential Application
  const [credentialApplication, setCredentialApplication] =
    useState<DecodedCredentialApplication>()

  // Credential Response
  const [credentialResponse, setCredentialResponse] =
    useState<DecodedCredentialFulfillment>()
  // Decoded Presentation from the credential response
  const [presentation, setPresentation] = useState<Presentation>()

  // Determine what page we're on
  let page: string
  if (presentation && credentialResponse) {
    page = "credential"
  } else if (challengeResponse) {
    page = "manifest"
  } else {
    page = "challenge"
  }

  // Simulate scanning the QR Code
  const simulateScan = async (challenge: ChallengeTokenUrlWrapper) => {
    const url = challenge.challengeTokenUrl
    const response = await fetch(url)
    if (response.ok) {
      const json = await response.json()
      setChallengeResponse(json)
      return json
    }
  }

  // API call to apply for a credential
  const applyForCredential = async (offer: CredentialOffer) => {
    const manifest = offer.body.manifest
    const application = await composeCredentialApplication(subject, manifest)

    const response = await fetch(offer.reply_url, {
      method: "POST",
      body: application
    })

    if (response.ok) {
      const text = await response.text()
      const presentation = (await verifyVerifiablePresentation(
        text
      )) as DecodedCredentialFulfillment
      const decodedApplication = await evaluateCredentialApplication(
        application,
        manifest
      )
      setCredentialApplication(decodedApplication)
      setCredentialResponse(presentation)
      setPresentation(presentation)
    }
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
              <QRCodeSVG
                value={JSON.stringify(challenge)}
                className="w-48 h-48"
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
  const Manifest = ({ response }: { response: CredentialOffer }) => {
    const manifest = response.body.manifest

    const output = manifest.output_descriptors[0]
    const title = output.name
    const description = output.description

    return (
      <>
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
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
                  applyForCredential(response)
                }}
                className="inline-flex items-center px-4 py-2 font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
              >
                Request Credential
              </button>
            </div>
          </div>
        </div>

        <div className="prose" style={{ maxWidth: "100%" }}>
          <h2>Credential Offer</h2>
          <p className="max-w-prose">
            After fetching the `challengeTokenUrl`, we are returned a Credential
            Offer. It is a wrapper around a Credential Manifest, with
            supplementary properties, most important of which is the `reply_url`
            where one can submit a Credential Application.
          </p>
          <pre>{JSON.stringify(response, null, 4)}</pre>
        </div>
      </>
    )
  }

  // Component to render the issued credentail
  const Credential = ({
    credentialApplication,
    presentation
  }: {
    credentialApplication: DecodedCredentialApplication
    presentation: Presentation
  }) => {
    return (
      <>
        <div className="prose" style={{ maxWidth: "100%" }}>
          <h1>Request</h1>
          <p className="max-w-prose">
            To request a credential, a client must submit a Credential
            Application. We use did-jwt-vc to encode our data as JWTs so the
            request is an opaque string. This is the decoded version.
          </p>
          <p className="max-w-prose">
            A Credential Application may require submitting additional
            credentials, however they are not required for the KYCAMLAttestion.
            However, the signed Verifiable Presentation does demonstrate
            proof-of-control of the holder&apos;s did. This is later used to
            verify that future presentation exchanges with this did, if properly
            signed, are being made by the same entity.
          </p>
          <pre>{JSON.stringify(credentialApplication, null, 4)}</pre>
          <h1>Response</h1>
          <p className="max-w-prose">
            According to the Presentation Exchange spec, the server will respond
            with a Verifiable Presentation. We use did-jwt-vc to encode our data
            as JWTs so the response is mostly opaque. After decoding it, we can
            see there is a list of Verifiable Credentials
          </p>
          <pre>{JSON.stringify(presentation, null, 4)}</pre>
          <h2>Verifiable Credential</h2>
          <p>
            This is the verifiable credential, which can be stored in the
            user&apos;s identity wallet.
          </p>
          <pre>
            {JSON.stringify(presentation.verifiableCredential[0], null, 4)}
          </pre>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen py-2 bg-gray-50">
      <Head>
        <title>Verite Demo: Issuer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-full px-20 space-y-8">
        <div className="prose">
          <h1>Issuance Demo</h1>
          <p>
            This is a simple example of how to issue a credential to a
            self-custodied identity wallet.
          </p>
          <p>
            The page first prompts a compatible mobile wallet to scan a QR code.
            The data encoded includes a JWT to help tie identity of the mobile
            wallet to that of the current authenticated browser session.
          </p>
          <p>
            The returned{" "}
            <a href="https://identity.foundation/credential-manifest/">
              Credential Manifest
            </a>{" "}
            can be processed and show the user what is being requested.
          </p>
          <p>
            Finally, we use{" "}
            <a href="https://identity.foundation/presentation-exchange">
              Presentation Exchange
            </a>{" "}
            to request the credential.
          </p>
        </div>

        {page === "challenge" ? <Scan challenge={challenge}></Scan> : null}

        {page === "manifest" ? (
          <Manifest response={challengeResponse}></Manifest>
        ) : null}

        {page === "credential" ? (
          <Credential
            credentialApplication={credentialApplication}
            presentation={presentation}
          ></Credential>
        ) : null}
      </main>
    </div>
  )
}
