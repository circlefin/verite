import {
  isRevocable,
  MaybeRevocableCredential,
  RevocableCredential,
  RevocationListCredential
} from "@centre/verity"
import { asyncMap, isRevoked } from "@centre/verity"
import { ArrowCircleLeftIcon } from "@heroicons/react/solid"
import { reverse, sortBy } from "lodash"
import { NextPage } from "next"
import Link from "next/link"
import router from "next/router"
import AdminLayout from "../../../components/admin/Layout"
import { requireAdmin } from "../../../lib/auth-fns"
import {
  allRevocationLists,
  DecodedDatabaseCredential,
  findCredentialsByUserId,
  findUser
} from "../../../lib/database"
import type { User } from "../../../lib/database"

type CredentialList = Array<{
  credential: DecodedDatabaseCredential
  revoked?: boolean
}>

type Props = {
  credentialList: CredentialList
  user: User
}

export const getServerSideProps = requireAdmin<Props>(async (context) => {
  const user = await findUser(context.params.id as string)

  // Create list of credentials

  // Props cannot have undefined values
  // https://github.com/vercel/next.js/discussions/11209
  const credentials = JSON.parse(
    JSON.stringify(await findCredentialsByUserId(user.id))
  ) as DecodedDatabaseCredential[]
  const revocationLists = JSON.parse(
    JSON.stringify(await allRevocationLists())
  ) as RevocationListCredential[]

  // Map data for easy rendering
  const credentialList = await asyncMap(credentials, async (credential) => {
    if (!isRevocable(credential.credential)) {
      return { credential }
    }

    // Find the credential's revocation list
    const url = (credential.credential as RevocableCredential).credentialStatus
      .statusListCredential
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

function CredentialTable({
  credentials
}: {
  credentials: CredentialList
}): JSX.Element {
  return (
    <table>
      <thead>
        <tr>
          <th>Type</th>
          <th>Issued</th>
          <th>
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
            <td>{credential.credential.credential.type[1]}</td>
            <td>
              {credential.credential?.credential?.credentialSubject
                ?.KYCAMLAttestation?.approvalDate ||
                credential.credential.createdAt}
            </td>
            <td>
              <Link
                href={`/admin/credentials/${credential?.credential?.credential?.proof?.jwt}`}
              >
                Details
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const doRevoke = async (credential: MaybeRevocableCredential) => {
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

  return (
    <AdminLayout title={user.email}>
      <div className="prose">
        <h2>Issuer Review: {user.email}</h2>
        <p>
          When revoking a credential, the best practice is to revoke all of a
          user&apos;s credentials of the same type. This ensures that no
          previously issued credentials can still be used.
        </p>
        <p>
          In this demo, KYC/AML credentials can be revoked, but Credit Score
          cannot &mdash; it simply expires relatively quickly, as a snapshot in
          time. Not all credentials must be revocable.
        </p>

        <h2>Active Credentials</h2>
        <CredentialTable credentials={activeCredentials} />

        <h2>Revoked Credentials</h2>
        <CredentialTable credentials={revokedCredentials} />

        <Link href="/admin" passHref>
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

export default AdminUserPage
