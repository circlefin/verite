import { FC } from "react"
import AttestationNavigation from "./AttestationNavigation"
import Layout from "components/Layout"

type Props = {
  title: string
  hideNavigation?: boolean
}

const IssuerLayout: FC<Props> = ({ title, children, hideNavigation }) => {
  return (
    <Layout title={title} theme="blue">
      {!hideNavigation && <AttestationNavigation />}
      {children}
    </Layout>
  )
}

export default IssuerLayout
