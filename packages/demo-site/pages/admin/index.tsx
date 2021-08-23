import { ChevronRightIcon } from "@heroicons/react/solid"
import { NextPage } from "next"
import Link from "next/link"
import AdminLayout from "../../components/admin/Layout"
import { currentUser, requireAdmin } from "../../lib/auth-fns"
import { allUsers } from "../../lib/database"
import type { User } from "../../lib/database"

type Props = {
  user: User
  users: User[]
}

export const getServerSideProps = requireAdmin<Props>(async (context) => {
  const users = await allUsers()
  const user = await currentUser(context)
  return {
    props: { user, users }
  }
})

const AdminPage: NextPage<Props> = ({ user, users }) => {
  return (
    <AdminLayout title="Credential Administration">
      <div className="prose max-w-none">
        <h2>Simulating an Issuer&apos;s Compliance Tool</h2>
        <p>
          This example simulates an admin tool used by issuers to manage
          credentials. Such a tool might be used by a compliance analyst to
          inspect the details of a user, including all credentials issued to a
          user, and to revoke credentials if needed.
        </p>

        <p>
          To protect privacy, Verity employs{" "}
          <Link href="https://w3c-ccg.github.io/vc-status-list-2021">
            <a target="_blank">Status List 2021</a>
          </Link>{" "}
          to execute credential revocation.
        </p>

        <h2>Demo Users</h2>
        <p>
          You are currently signed in as{" "}
          <b>
            <em>{user.email}</em>
          </b>
        </p>
        <div className="divide-y divide-gray-200">
          {users.map((user) => (
            <div key={user.email}>
              <Link href={`/admin/users/${user.id}`} passHref>
                <span className="flex justify-between py-4 cursor-pointer hover:bg-gray-50">
                  <div className="ml-3">
                    <span className="text-sm text-gray-900">{user.email}</span>
                  </div>
                  <ChevronRightIcon
                    className="w-5 h-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminPage
