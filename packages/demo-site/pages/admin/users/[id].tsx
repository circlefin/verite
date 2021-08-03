import RevokeButton from "@centre/demo-site/components/issuer/RevokeButton"
import type {
  RevocableCredential,
  RevocationListCredential
} from "@centre/verity"
import { asyncMap, isRevoked } from "@centre/verity"
import { reverse, sortBy } from "lodash"
import { NextPage } from "next"
import router from "next/router"
import AdminLayout from "../../../components/admin/Layout"
import { requireAdmin } from "../../../lib/auth-fns"
import {
  allRevocationLists,
  DatabaseCredential,
  findCredentialsByUserId,
  findUser
} from "../../../lib/database"
import type { User } from "../../../lib/database"
import revoke from "../../api/revoke"

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

function CredentialTable({ credentials }) {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Issued
                  </th>

                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Revoke</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {credentials.map((credential, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {credential.credential.credential.type[1]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {
                        credential?.credential?.credential?.credentialSubject
                          ?.KYCAMLAttestation?.approvalDate
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <RevokeButton
                        credential={credential.credential.credential}
                        defaultRevoked={credential.revoked}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
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

const AdminUserPage: NextPage<Props> = ({ credentialList, user }) => {
  const activeCredentials = reverse(
    sortBy(
      credentialList.filter(({ revoked }) => !revoked),
      (i) => {
        i?.credential?.credential?.credentialSubject?.KYCAMLAttestation
          ?.approvalDate
      }
    )
  )
  const revokedCredentials = reverse(
    sortBy(
      credentialList.filter(({ revoked }) => revoked),
      (i) => {
        i?.credential?.credential?.credentialSubject?.KYCAMLAttestation
          ?.approvalDate
      }
    )
  )

  const kycCreds = activeCredentials
    .filter((credential) => {
      return credential.credential.credential.type[1] === "KYCAMLAttestation"
    })
    .map((credential) => {
      return credential.credential.credential
    })

  const creditScoreCreds = activeCredentials
    .filter((credential) => {
      return (
        credential.credential.credential.type[1] === "CreditScoreAttestation"
      )
    })
    .map((credential) => {
      return credential.credential.credential
    })

  return (
    <AdminLayout title={user.email}>
      <div className="space-y-8">
        <div>
          When revoking a user&apos;s credentials, it is recommended to revoke
          all credentials of the same type. This ensures no previously issued
          credentials can still be used.
        </div>
        <div>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={async () => {
              // Dev Note: Ideally, your API would handle this in bulk, but for simplicity we loop over them one by one }
              for (const credential of kycCreds) {
                await doRevoke(credential)
              }
              router.reload()
            }}
          >
            Revoke KYC Credentials
          </button>
        </div>
        <div>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={async () => {
              // Dev Note: Ideally, your API would handle this in bulk, but for simplicity we loop over them one by one
              for (const credential of creditScoreCreds) {
                await doRevoke(credential)
              }
              router.reload()
            }}
          >
            Revoke Credit Score Credentials
          </button>
        </div>
        <div>Active Credentials</div>
        <CredentialTable credentials={activeCredentials} />

        <div>Revoked Credentials</div>
        <CredentialTable credentials={revokedCredentials} />
      </div>
    </AdminLayout>
  )
}

export default AdminUserPage
