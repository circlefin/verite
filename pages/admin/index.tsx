import { ChevronRightIcon } from "@heroicons/react/solid"
import { NextPage } from "next"
import Link from "next/link"
import AdminLayout from "components/admin/Layout"
import { requireAdmin } from "lib/auth-fns"
import { allUsers } from "lib/database"
import type { User } from "lib/database"

type Props = {
  users: User[]
}

export const getServerSideProps = requireAdmin<Props>(async () => {
  const users = await allUsers()
  return {
    props: { users }
  }
})

const AdminPage: NextPage<Props> = ({ users }) => {
  return (
    <AdminLayout title="Admin">
      <div className="flex flex-col justify-center space-y-8">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.email}>
              <Link href={`/admin/users/${user.id}`}>
                <a className="flex justify-between py-4 hover:bg-gray-50">
                  <div className="ml-3">
                    <p className="text-sm text-gray-900">{user.email}</p>
                  </div>
                  <ChevronRightIcon
                    className="w-5 h-5 text-gray-400"
                    aria-hidden="true"
                  />
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AdminLayout>
  )
}

export default AdminPage
