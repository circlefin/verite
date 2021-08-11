import { FC } from "react"
import Layout from "../layouts/UserAuthLayout"

type Props = {
  title: string
}

const AdminLayout: FC<Props> = ({ title, children }) => {
  return <Layout title={title}>{children}</Layout>
}

export default AdminLayout
