import {
  buildAndSignVerifiableCredential,
  buildIssuer,
  decodeVerifiableCredential,
  generateRevocationList,
  isRevoked,
  randomDidKey,
  RevocableCredential,
  RevocationListCredential,
  revokeCredential,
  unrevokeCredential
} from "@verity/core"
import type {
  KYCAMLAttestation,
  Verifiable,
  W3CCredential,
  Issuer
} from "@verity/core"
import Head from "next/head"
import useSWRImmutable from "swr/immutable"
import useSWR from "swr"
import { useState } from "react"

// In a production environment, these values would be secured by the issuer
const issuer = buildIssuer(
  process.env.NEXT_PUBLIC_ISSUER_DID,
  process.env.NEXT_PUBLIC_ISSUER_SECRET
)

/**
 * Issue a Revocation List Credential. This would traditionally be issued by the
 * issuer, but for the sake of the demo's focus on verification, we will do it
 * here.
 */
const issueRevocationList = async () => {
  /**
   * Note that the second parameter should be a URL that resolves to the
   * Revocation List Credential.
   */
  return generateRevocationList(
    [],
    "http://localhost:3000/api/demos/revocation",
    issuer.did,
    issuer
  )
}

/**
 * Issue a Verifiable Credential. This would traditionally be issued by the
 * issuer, but for the sake of the demo's focus on verification, we will do it
 * here.
 */
const issueCredential = async (
  revocationList: RevocationListCredential
): Promise<RevocableCredential> => {
  // We will create a random did to represent our own identity wallet
  const subject = randomDidKey()

  // Stubbed out credential data
  const attestation: KYCAMLAttestation = {
    "@type": "KYCAMLAttestation",
    process: "https://demos.verity.id/schemas/definitions/1.0.0/kycaml/usa",
    authorityId: "did:web:demos.verity.id",
    approvalDate: new Date().toISOString(),
    authorityName: "verity.id",
    authorityUrl: "https://verity.id",
    authorityCallbackUrl: "https://verity.id"
  }

  /**
   * Note that the `statusListCredential` should be a URL that resolves to the
   * Revocation List Credential.
   */
  const credentialStatus = {
    id: `${revocationList.id}#0`,
    type: "RevocationList2021Status",
    statusListIndex: "0",
    statusListCredential: `http://localhost:3000/${revocationList.id}`
  }

  // Generate the signed, encoded credential
  const encoded = await buildAndSignVerifiableCredential(
    issuer,
    subject,
    attestation,
    { credentialStatus }
  )

  const decoded = await decodeVerifiableCredential(encoded)

  return decoded as RevocableCredential
}

export default function Home(): JSX.Element {
  // Revocation list credential
  const [revocationList, setRevocationList] =
    useState<RevocationListCredential>()

  // Set the initial Revocation List.
  // This is a simple hack to get around the fact it is an async method.
  useSWRImmutable("revocationList", async () => {
    setRevocationList(await issueRevocationList())
  })

  // Set the Credential.
  // In a production environment this would be issued somewhere else.
  const { data: credential } = useSWRImmutable(
    `credential+${revocationList}}`,
    async () => (revocationList ? issueCredential(revocationList) : null)
  )

  // Component to render the issued credentail
  const RevocationList = ({
    credential
  }: {
    credential: RevocationListCredential
  }) => {
    return (
      <>
        <div className="prose" style={{ maxWidth: "100%" }}>
          <h1>Revocation List</h1>
          <p>
            The revocation list is a verifiable credential itself. When a
            credential is revoked, we simply modify it. When clients check the
            revocaiton status by fetching the list from the known url, they will
            get the latest version.
          </p>
          <pre>{JSON.stringify(credential, null, 4)}</pre>
        </div>
      </>
    )
  }

  // Component to render the issued credentail
  const Credential = ({
    credential,
    revocationList
  }: {
    credential:
      | Verifiable<W3CCredential>
      | RevocationListCredential
      | RevocableCredential
    revocationList: RevocationListCredential
  }) => {
    const { data } = useSWR("revoked", async () =>
      isRevoked(credential, revocationList)
    )
    return (
      <>
        <div className="prose" style={{ maxWidth: "100%" }}>
          <h1>Credential</h1>
          <p>
            This is a revocable credential. Notice the `credentialStatus`
            property. It points to a URL where you can find the revocation list
            and the index for this credential.
          </p>
          <pre>{JSON.stringify(credential, null, 4)}</pre>
        </div>
      </>
    )
  }

  const RevokeButton = ({
    credential,
    revocationList,
    issuer
  }: {
    credential: RevocableCredential
    revocationList: RevocationListCredential
    issuer: Issuer
  }) => {
    /**
     * We use the JWT as the SWR key to avoid caching mistakes.
     * We use SWR here to avoid convoluted useEffect setups
     *
     * In a production environment, we would not have the revocation list
     * in-memory. It would need to be fetched via API. The `isRevoked`
     * method will do as such, but for demo purposes it is not assumed that
     * any of the URLs will properly resolve. So we do everything client-side.
     */
    const { data: revoked } = useSWR(revocationList.proof.jwt, async () =>
      isRevoked(credential, revocationList)
    )

    return (
      <>
        <button
          type="button"
          onClick={async (e) => {
            /**
             * In a production environment, this mutation would be done on the
             * server, persisted, and later returned via API when a client
             * looks up the revocation status of a credential.
             *
             * For simplicity of the demo, we will simply mutate it in memory.
             */
            e.preventDefault()
            if (revoked) {
              const list = await unrevokeCredential(
                credential,
                revocationList,
                issuer
              )
              setRevocationList(list)
            } else {
              const list = await revokeCredential(
                credential,
                revocationList,
                issuer
              )
              setRevocationList(list)
            }
          }}
          className="inline-flex items-center px-4 py-2 font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
        >
          {revoked ? "Unrevoke" : "Revoke"}
        </button>
      </>
    )
  }

  if (!revocationList || !credential) {
    return <>Loading</>
  }

  return (
    <div className="min-h-screen py-2">
      <Head>
        <title>Demo Revocation</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="w-full px-20 pt-10 pb-20 space-y-8">
        <div className="prose">
          <h1>Revocation Demo</h1>
          <p>
            This is a simple example of how revocation works using{" "}
            <a href="https://w3c-ccg.github.io/vc-status-list-2021/">
              Status List 2021
            </a>
            . The revocation status is essentially stored in a compressed and
            encoded bitstring, with each credential having its own index. If the
            bit at the index is a 1, the credential is revoked. Otherwise, it is
            not revoked.
          </p>
          <p>
            To simplify the demo, everything is performed within the browser. In
            a produciton envrionment:
          </p>
          <ul>
            <li>
              Both the Credential and the Revocation List Credential would be
              issued by the issuing service
            </li>
            <li>
              Revocation List Credential would be served from a URL, as
              referenced in the credential status.
            </li>
            <li>
              Clients would determine whether a credential was revoked by first
              fetching the credential from said URL and then checking its
              revocation status.
            </li>
            <li>
              Revoking / Unrevoking a credential would require an authenticated
              API call to the issuing service, e.g. from a compliance agent.
            </li>
          </ul>
          <p>
            When revoking and unrevoking a credential. Notice that the
            Revocation List Credential changes, but the KYC credential does not.
          </p>
        </div>
        <RevokeButton
          credential={credential}
          revocationList={revocationList}
          issuer={issuer}
        ></RevokeButton>
        <RevocationList credential={revocationList}></RevocationList>
        <Credential
          credential={credential}
          revocationList={revocationList}
        ></Credential>
      </main>
    </div>
  )
}
