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
    <AdminLayout title="Admin">
      <div className="prose">
        <p>
          This is an example admin tool used by Issuers to manage their
          credentials. This tool might be used day-to-day by a compliance
          analyst to inspect the details of a User, including all their issued
          credentials, and ultimately revoke credentials as needed.
        </p>

        <p>
          Project Verity uses{" "}
          <Link href="https://w3c-ccg.github.io/vc-status-list-2021">
            Status List 2021
          </Link>{" "}
          to perform revocation.
        </p>

        <h2>Users</h2>
        <p>
          We have seeded the database with multiple users to provide a more
          realistic experience and more clearly illustrate integration
          requirements. You are currently signed in as <em>{user.email}</em> so
          any previously issued credentials will likely be found under that
          user.
        </p>
        <div className="divide-y divide-gray-200">
          {users.map((user) => (
            <div key={user.email}>
              <Link href={`/admin/users/${user.id}`}>
                <span className="flex justify-between py-4 hover:bg-gray-50 cursor-pointer">
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
