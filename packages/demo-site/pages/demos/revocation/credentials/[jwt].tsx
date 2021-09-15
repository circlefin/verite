import {
  decodeVerifiableCredential,
  fetchStatusList,
  isRevocable,
  MaybeRevocableCredential,
  RevocableCredential,
  RevocationListCredential
} from "@centre/verity"
import { isRevoked } from "@centre/verity"
import { Disclosure } from "@headlessui/react"
import { ArrowCircleLeftIcon } from "@heroicons/react/solid"
import { NextPage } from "next"
import Link from "next/link"
import { useState } from "react"
import RevocationLayout from "../../../../components/revocation/Layout"
import RevokeButton from "../../../../components/revocation/RevokeButton"
import { requireAuth } from "../../../../lib/auth-fns"
import { findUserByCredential, User } from "../../../../lib/database"

type Props = {
  credential: RevocableCredential
  revocable: boolean
  revocationList?: RevocationListCredential
  revoked: boolean
  user: User
}

export const getServerSideProps = requireAuth<Props>(async (context) => {
  const jwt = context.params.jwt as string
  const credential = (await decodeVerifiableCredential(
    jwt
  )) as MaybeRevocableCredential

  if (!credential) {
    return {
      redirect: {
        permanent: false,
        destination: "/demos/revocation"
      }
    }
  }

  const revocable = isRevocable(credential)
  const revocationList = await fetchStatusList(credential)
  const revoked = await isRevoked(credential, revocationList)
  const user = await findUserByCredential(jwt)

  return {
    props: {
      credential: JSON.parse(JSON.stringify(credential)),
      revocable,
      revocationList: revocationList
        ? JSON.parse(JSON.stringify(revocationList))
        : null,
      revoked,
      user
    }
  }
}, "/demos/revocation")

const formatType = (credential: MaybeRevocableCredential) => {
  try {
    return credential.type[credential.type.length - 1]
  } catch (e) {
    console.log(e)
    return credential.type
  }
}

const AdminCredentialPage: NextPage<Props> = ({
  credential,
  revocable,
  revocationList,
  revoked,
  user
}) => {
  // Revocation List can change if we revoke the credential so we need to store state
  const [list, setList] = useState<RevocationListCredential>(revocationList)

  return (
    <RevocationLayout>
      <div className="prose max-w-none">
        <h2>{formatType(credential)}</h2>
        <p>
          An issuer can reconcile this credential to a specific user in its
          system because the issuer persists that mapping internally whenever it
          issues a revocable credential. No one other than the issuer could map
          the credential to the user&apos;s email address or other identifying
          information.
        </p>
        {revocable && (
          <>
            <p>
              Credentials themselves are immutable, it is their corresponding
              revocation lists that update (specifically, the{" "}
              <code>encodedList</code> property in the revocation list
              credential will change). A single revocation list can accomodate
              thousands of credentials, allowing verifiers to query them without
              leaking which specific credential is being queried.
            </p>
            <p>
              <RevokeButton
                credential={credential}
                defaultRevoked={revoked}
                onToggle={async (revocationList) => setList(revocationList)}
              />
            </p>
          </>
        )}

        {!revocable && (
          <>
            <h4>
              This credential is not revocable. Issuer administrators can view
              it, but not revoke it.
            </h4>
          </>
        )}

        {revocable && (
          <>
            <h3>Revocation List Credential:</h3>

            <pre className="overflow-x-scroll">
              {JSON.stringify(list, null, 4)}
            </pre>
          </>
        )}

        <Disclosure>
          <Disclosure.Button>
            <p className="font-semibold underline text-md">
              Show/Hide the Verifiable Credential
            </p>
          </Disclosure.Button>
          <Disclosure.Panel>
            <pre>{JSON.stringify(credential, null, 4)}</pre>
          </Disclosure.Panel>
        </Disclosure>

        <div>
          <Link href={`/demos/revocation/users/${user.id}`} passHref>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowCircleLeftIcon
                className="w-5 h-5 mr-2"
                aria-hidden="true"
              />
              Back
            </button>
          </Link>
        </div>
      </div>
    </RevocationLayout>
  )
}

export default AdminCredentialPage
