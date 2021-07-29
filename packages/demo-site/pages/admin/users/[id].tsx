import type {
  RevocableCredential,
  RevocationListCredential
} from "@centre/verity"
import { asyncMap, isRevoked } from "@centre/verity"
import { NextPage } from "next"
import { useRouter } from "next/router"
import AdminLayout from "../../../components/admin/Layout"
import { requireAdmin } from "../../../lib/auth-fns"
import {
  allRevocationLists,
  DatabaseCredential,
  findCredentialsByUserId,
  findUser
} from "../../../lib/database"
import type { User } from "../../../lib/database"

type Props = {
  credentialList: {
    credential: DatabaseCredential
    revoked: boolean
  }[]
  user: User
}

export const getServerSideProps = requireAdmin<Props>(async (context) => {
  const user = await findUser(context.params.id as string)

  // Create list of credentials

  // Props cannot have undefined values
  // https://github.com/vercel/next.js/discussions/11209
  const credentials = JSON.parse(
    JSON.stringify(await findCredentialsByUserId(user.id))
  ) as DatabaseCredential[]
  const revocationLists = JSON.parse(
    JSON.stringify(await allRevocationLists())
  ) as RevocationListCredential[]

  // Map data for easy rendering
  const credentialList = await asyncMap(credentials, async (credential) => {
    // Find the credential's revocation list
    const url = credential.credential.credentialStatus.statusListCredential
    const revocationList = revocationLists.find((l) => l.id === url)

    // If revocation list cannot be found, assume it is not revocable
    if (!revocationList) {
      return { credential, revoked: false }
    }

    return {
      credential,
      revoked: await isRevoked(credential.credential, revocationList)
    }
  })

  if (!user) {
    return {
      redirect: {
        permanent: false,
        destination: "/admin"
      }
    }
  }

  return {
    props: {
      user,
      credentialList
    }
  }
})

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

const AdminUserPage: NextPage<Props> = ({ credentialList, user }) => {
  const router = useRouter()

  const credentials = credentialList.map(({ credential, revoked }) => {
    return (
      <div key={credential.credential.credentialSubject.id}>
        <pre className="overflow-auto whitespace-pre-wrap">
          {JSON.stringify(credential.credential)}
        </pre>
        <div>Revoked: {revoked ? "Yes" : "No"} </div>
        <div>
          <button
            onClick={async () => {
              revoked
                ? await doUnrevoke(credential.credential)
                : await doRevoke(credential.credential)
              router.reload()
            }}
            className="block w-full px-4 py-2 text-sm text-left text-gray-700"
          >
            {revoked ? "Unrevoke" : "Revoke"}
          </button>
        </div>
      </div>
    )
  })

  return (
    <AdminLayout title={user.email}>
      <div className="flex flex-col justify-center space-y-8">
        <h1>{user.email}</h1>
        <div>{credentials}</div>
      </div>
    </AdminLayout>
  )
}

export default AdminUserPage
