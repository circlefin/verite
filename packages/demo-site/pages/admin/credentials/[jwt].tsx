import {
  decodeVerifiableCredential,
  fetchStatusList,
  isRevocable,
  MaybeRevocableCredential,
  RevocableCredential,
  RevocationListCredential
} from "@centre/verity"
import { isRevoked } from "@centre/verity"
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
      <div className="prose">
        <h2>
          User: <Link href={`/admin/users/${user.id}`}>{user.email}</Link>
        </h2>
        <p>
          Note: We can only reconcile this credential to a specific user in the
          system because we stored it when issuing the credential. No one else
          would know their email address or other identifying information. See
          the credential below.
        </p>
        {revocable && (
          <>
            <p>
              You can revoke the credential using the button below. Notice that
              credentials are immutable. After revoking the credential, the
              revocation list credential is updated. You will see the
              `encodedList` property change.
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

        <h2>Credential</h2>

        <pre className="overflow-x-scroll">
          {JSON.stringify(credential, null, 4)}
        </pre>
        {revocable && (
          <>
            <h2>Revocation List Credential</h2>

            <pre className="overflow-x-scroll">
              {JSON.stringify(list, null, 4)}
            </pre>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminCredentialPage
