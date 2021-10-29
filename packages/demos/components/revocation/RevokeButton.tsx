import {
  decodeVerifiableCredential,
  isRevoked,
  JWT,
  RevocableCredential,
  RevocationListCredential
} from "@verity/core"
import { useEffect, useState } from "react"
import { LoadingButton } from "../LoadingButton"

type Props = {
  credential: RevocableCredential
  defaultRevoked?: boolean | undefined
  onToggle?: (revocationList: RevocationListCredential) => Promise<void>
}

const perform = async (
  url: string,
  credential: RevocableCredential
): Promise<JWT> => {
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
  const [isLoading, setIsLoading] = useState(false)
  const [revoked, setRevoked] = useState<boolean>(defaultRevoked)

  const doRevoke = async (credential: RevocableCredential): Promise<JWT> => {
    setIsLoading(true)
    const jwt = await perform("/api/revocation/revoke", credential)
    setIsLoading(false)
    return jwt
  }

  const doUnrevoke = async (credential: RevocableCredential): Promise<JWT> => {
    setIsLoading(true)
    const jwt = await perform("/api/revocation/unrevoke", credential)
    setIsLoading(false)
    return jwt
  }

  useEffect(() => {
    ;(async () => {
      if (defaultRevoked === undefined) {
        setRevoked(await isRevoked(credential, undefined))
      }
    })()
  }, [credential, defaultRevoked])

  if (revoked === undefined) {
    return (
      <>
        <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Loading
        </button>
      </>
    )
  }

  return (
    <>
      <LoadingButton
        loading={isLoading}
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
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {revoked ? "Unrevoke" : "Revoke"}
      </LoadingButton>
    </>
  )
}
