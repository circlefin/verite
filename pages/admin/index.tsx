import { NextPage } from "next"
import AdminLayout from "components/admin/Layout"
import { requireAuth } from "lib/auth-fns"

export const getServerSideProps = requireAuth(async () => {
  return {
    props: {}
  }
})

const AdminPage: NextPage = () => {
  return (
    <AdminLayout title="Admin">
      <div className="flex flex-col justify-center space-y-8">👋</div>
    </AdminLayout>
  )
}

export default AdminPage
