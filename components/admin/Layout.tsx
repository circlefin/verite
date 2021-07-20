import { FC } from "react"
import Layout from "components/Layout"

type Props = {
  title: string
}

const AdminLayout: FC<Props> = ({ title, children }) => {
  return (
    <Layout title={title} theme="green">
      {children}
    </Layout>
  )
}

export default AdminLayout
