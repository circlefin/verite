import { isRevoked, RevocableCredential } from "@centre/verity"
import { useEffect, useState } from "react"

type Props = {
  credential: RevocableCredential
  revoked: boolean
}

const doRevoke = async (credential: RevocableCredential) => {
  const url = "/api/revoke"
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: credential.proof.jwt
  })
}

const doUnrevoke = async (credential: RevocableCredential) => {
  const url = "/api/unrevoke"
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: credential.proof.jwt
  })
}

export default function RevokeButton({ credential }: Props): JSX.Element {
  const [revoked, setRevoked] = useState<boolean>()
  useEffect(() => {
    ;(async () => {
      setRevoked(await isRevoked(credential, undefined))
    })()
  }, [credential])

  if (revoked == undefined) {
    return (
      <>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Loading
        </button>
      </>
    )
  }

  return (
    <>
      <button
        onClick={async () => {
          revoked ? await doUnrevoke(credential) : await doRevoke(credential)
          setRevoked(!revoked)
        }}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {revoked ? "Unrevoke" : "Revoke"}
      </button>
    </>
  )
}
