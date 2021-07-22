import Layout from "components/Layout"
import { FC } from "react"

type Props = {
  title: string
}

const VerifierLayout: FC<Props> = ({ title, children }) => {
  return (
    <Layout title={title} theme="indigo" skipAuth={true}>
      {children}
    </Layout>
  )
}

export default VerifierLayout
