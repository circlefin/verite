import {
  randomDidKey,
  buildCredentialApplication,
  decodeVerifiablePresentation,
  challengeTokenUrlWrapper,
  ChallengeTokenUrlWrapper,
  CredentialOffer
} from "@verity/core"
import type {
  CredentialManifest,
  RevocablePresentation,
  Verifiable,
  W3CPresentation
} from "@verity/core"
import Head from "next/head"
import QRCode from "qrcode.react"
import { useState } from "react"
import jwt from "jsonwebtoken"

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
  // In a production environment, the URL would need to be absolute, but for
  // sake of simplicity we will just use a path since the demo is entirely
  // within the browser.
  const url = `/api/challenges/${token}`
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
  const subject = randomDidKey()

  // Challenge Response
  const [challengeResponse, setChallengeResponse] = useState()

  // Credential Response
  const [credentialResponse, setCredentialResponse] = useState()
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
  const applyForCredential = async (manifest: CredentialManifest) => {
    const application = await buildCredentialApplication(subject, manifest)

    const response = await fetch("/api/credentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(application)
    })

    if (response.ok) {
      const json = await response.json()
      const presentation = await decodeVerifiablePresentation(json.presentation)
      setCredentialResponse(json)
      setPresentation(presentation)
    }
  }

  // Component to render the QR code
  const Scan = ({ challenge }) => {
    return (
      <>
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
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
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
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
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {title}
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>{description}</p>
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                applyForCredential(manifest)
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            >
              Request Credential
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Component to render the issued credentail
  const Credential = ({
    response,
    presentation
  }: {
    response: unknown
    presentation: Presentation
  }) => {
    return (
      <>
        <div className="prose" style={{ maxWidth: "100%" }}>
          <h1>Response</h1>
          <p>
            According to the Presentation Exchange spec, the server will respond
            with a Verifiable Presentation. We use did-jwt-vc to encode our data
            as JWTs so the response is mostly opaque.
          </p>
          <h2>Response</h2>
          <pre>{JSON.stringify(response, null, 4)}</pre>
          <h2>Decoded Verifiable Presentation</h2>
          <p>
            After decoding it, we can see there is a list of Verifiable
            Credentials
          </p>
          <pre>{JSON.stringify(presentation, null, 4)}</pre>
          <h2>Verifiable Credential</h2>
          <p>This is the verifiable credential.</p>
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
        <title>Verity Demo: Issuer</title>
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
            response={credentialResponse}
            presentation={presentation}
          ></Credential>
        ) : null}
      </main>
    </div>
  )
}
