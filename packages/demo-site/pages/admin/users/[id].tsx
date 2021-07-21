import { NextPage } from "next"
import AdminLayout from "components/admin/Layout"
import { requireAdmin } from "lib/auth-fns"
import { findUser } from "lib/database"
import type { User } from "lib/database"

type Props = {
  user: User
}

export const getServerSideProps = requireAdmin<Props>(async (context) => {
  const user = await findUser(context.params.id as string)

  if (!user) {
    return {
      redirect: {
        permanent: false,
        destination: "/admin"
      }
    }
  }

  return {
    props: { user }
  }
})

const AdminUserPage: NextPage<Props> = ({ user }) => {
  return (
    <AdminLayout title={user.email}>
      <div className="flex flex-col justify-center space-y-8">
        <h1>{user.email}</h1>
      </div>
    </AdminLayout>
  )
}

export default AdminUserPage
