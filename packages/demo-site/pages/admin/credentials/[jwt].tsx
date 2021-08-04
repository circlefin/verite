import RevokeButton from "@centre/demo-site/components/issuer/RevokeButton"
import {
  decodeVerifiableCredential,
  fetchStatusList,
  RevocableCredential,
  RevocationListCredential
} from "@centre/verity"
import { isRevoked } from "@centre/verity"
import { NextPage } from "next"
import { useState } from "react"
import AdminLayout from "../../../components/admin/Layout"
import { requireAdmin } from "../../../lib/auth-fns"
import { findUser } from "../../../lib/database"

type Props = {
  credential: RevocableCredential
  revocationList: RevocationListCredential
  revoked: boolean
}

export const getServerSideProps = requireAdmin<Props>(async (context) => {
  const jwt = context.params.jwt as string
  const credential = (await decodeVerifiableCredential(
    jwt
  )) as RevocableCredential

  if (!credential) {
    return {
      redirect: {
        permanent: false,
        destination: "/admin"
      }
    }
  }

  const revocationList = await fetchStatusList(credential)
  const revoked = await isRevoked(credential, revocationList)

  return {
    props: {
      credential: JSON.parse(JSON.stringify(credential)),
      revocationList: JSON.parse(JSON.stringify(revocationList)),
      revoked
    }
  }
})

const AdminCredentialPage: NextPage<Props> = ({
  credential,
  revocationList,
  revoked
}) => {
  // Revocation List can change if we revoke the credential so we need to store state
  const [list, setList] = useState<RevocationListCredential>(revocationList)

  return (
    <AdminLayout title="Foo">
      <div className="space-y-8">
        <div>
          <RevokeButton
            credential={credential}
            defaultRevoked={revoked}
            onToggle={async (revocationList) => setList(revocationList)}
          />
        </div>

        <div>Credential</div>

        <div>
          <pre className="overflow-x-scroll">
            {JSON.stringify(credential, null, 4)}
          </pre>
        </div>

        <div>Status List 2021</div>
        <div>
          <pre className="overflow-x-scroll">
            {JSON.stringify(list, null, 4)}
          </pre>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminCredentialPage
