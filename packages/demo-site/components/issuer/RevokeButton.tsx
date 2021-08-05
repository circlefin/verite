import {
  decodeVerifiableCredential,
  isRevoked,
  JWT,
  RevocableCredential,
  RevocationListCredential
} from "@centre/verity"
import { useEffect, useState } from "react"

type Props = {
  credential: RevocableCredential
  defaultRevoked?: boolean | undefined
  onToggle?: (revocationList: RevocationListCredential) => Promise<void>
}

const doRevoke = async (credential: RevocableCredential): Promise<JWT> => {
  const url = "/api/revoke"
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: credential.proof.jwt
  })
  return response.text()
}

const doUnrevoke = async (credential: RevocableCredential): Promise<JWT> => {
  const url = "/api/unrevoke"
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain"
    },
    body: credential.proof.jwt
  })
  return response.text()
}

export default function RevokeButton({
  credential,
  defaultRevoked,
  onToggle
}: Props): JSX.Element {
  const [revoked, setRevoked] = useState<boolean>(defaultRevoked)
  useEffect(() => {
    ;(async () => {
      if (defaultRevoked === undefined) {
        setRevoked(await isRevoked(credential, undefined))
      }
    })()
  }, [credential, defaultRevoked])

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
          const data = revoked
            ? await doUnrevoke(credential)
            : await doRevoke(credential)

          if (onToggle) {
            const revocationList = (await decodeVerifiableCredential(
              data
            )) as RevocationListCredential
            await onToggle(revocationList)
          }

          setRevoked(!revoked)
        }}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {revoked ? "Unrevoke" : "Revoke"}
      </button>
    </>
  )
}
