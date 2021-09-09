import {
  randomDidKey,
  createCredentialApplication,
  decodeVerifiablePresentation
} from "@centre/verity"
import type {
  CredentialManifest,
  RevocablePresentation,
  Verifiable,
  W3CPresentation
} from "@centre/verity"
import Head from "next/head"
import { useState } from "react"
import useSWR from "swr"
import type { NextPage } from "next"

type Presentation = Verifiable<W3CPresentation | RevocablePresentation>

const jsonFetch = (url: string): Promise<Record<string, unknown>> =>
  fetch(url).then((res) => res.json())

export default function Home(): JSX.Element {
  const subject = randomDidKey()

  const [response, setResponse] = useState()
  const [presentation, setPresentation] = useState<Presentation>()

  // Fetch the Credential Manifests for the supported credentials
  const manifests = useSWR("/api/manifests", jsonFetch).data as
    | CredentialManifest[]
    | undefined

  // Handle empty state
  if (!manifests) {
    return <></>
  }

  // API call to apply for a credential
  const applyForCredential = async (manifest: CredentialManifest) => {
    const application = await createCredentialApplication(subject, manifest)

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
      setResponse(json)
      setPresentation(presentation)
    }
  }

  // Component to render a Manifest
  const Manifest = ({ manifest }: { manifest: CredentialManifest }) => {
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
    <div className="min-h-screen py-2">
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
            The page first loads the list of{" "}
            <a href="https://identity.foundation/credential-manifest/">
              Credential Manifests
            </a>{" "}
            provided by the API. We use those manifests to render a title and
            description. We then use{" "}
            <a href="https://identity.foundation/presentation-exchange">
              Presentation Exchange
            </a>{" "}
            to request the credential.
          </p>
        </div>

        <div className="flex flex-row space-x-8">
          {manifests.map((manifest: CredentialManifest) => {
            return <Manifest manifest={manifest} key={manifest.id}></Manifest>
          })}
        </div>

        {presentation && response ? (
          <Credential
            response={response}
            presentation={presentation}
          ></Credential>
        ) : null}
      </main>
    </div>
  )
}
