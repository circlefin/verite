import {
  decodeVerifiableCredential,
  fetchStatusList,
  isRevocable,
  MaybeRevocableCredential,
  RevocableCredential,
  RevocationListCredential
} from "@centre/verity"
import { isRevoked } from "@centre/verity"
import { ArrowCircleLeftIcon } from "@heroicons/react/solid"
import { NextPage } from "next"
import Link from "next/link"
import { useState } from "react"
import AdminLayout from "../../../components/admin/Layout"
import RevokeButton from "../../../components/issuer/RevokeButton"
import { requireAdmin } from "../../../lib/auth-fns"
import { findUserByCredential, User } from "../../../lib/database"

type Props = {
  credential: RevocableCredential
  revocable: boolean
  revocationList?: RevocationListCredential
  revoked: boolean
  user: User
}

export const getServerSideProps = requireAdmin<Props>(async (context) => {
  const jwt = context.params.jwt as string
  const credential = (await decodeVerifiableCredential(
    jwt
  )) as MaybeRevocableCredential

  if (!credential) {
    return {
      redirect: {
        permanent: false,
        destination: "/admin"
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
})

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
    <AdminLayout title="Credential Details">
      <div className="prose max-w-none">
        <h2>{credential.type}</h2>
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

        <button
          className="flex justify-center text-md "
          onClick={() => {
            const el = document.getElementById("vc")
            el.style.display = el.style.display === "" ? "block" : ""
          }}
        >
          <p className="underline font-semibold">
            Show/Hide the Verifiable Credential
          </p>
        </button>
        <pre id="vc" className="overflow-x-scroll hidden">
          {JSON.stringify(credential, null, 4)}
        </pre>

        <Link href={`/admin/users/${user.id}`} passHref>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 text-sm 
                font-medium text-white bg-blue-600 border border-transparent 
                rounded-md shadow-sm hover:bg-blue-700 focus:outline-none 
                focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowCircleLeftIcon className="w-5 h-5 mr-2" aria-hidden="true" />
            Back
          </button>
        </Link>
      </div>
    </AdminLayout>
  )
}

export default AdminCredentialPage
