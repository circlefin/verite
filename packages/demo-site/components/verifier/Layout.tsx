import { FC } from "react"
import Layout from "../Layout"

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
