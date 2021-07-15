import { FC } from "react"
import AttestationNavigation from "./AttestationNavigation"
import Layout from "components/Layout"

type Props = {
  title: string
}

const AttestationLayout: FC<Props> = ({ children, title }) => {
  return (
    <Layout title={title}>
      <AttestationNavigation />
      {children}
    </Layout>
  )
}

export default AttestationLayout
