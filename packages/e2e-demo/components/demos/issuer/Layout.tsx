import { FC } from "react"

import Layout from "../../shared/Layout"
import AttestationNavigation from "./AttestationNavigation"

type Props = {
  hideNavigation?: boolean
}

const IssuerLayout: FC<Props> = ({ children, hideNavigation }) => {
  return (
    <Layout title="Demo: Basic Issuance">
      <AttestationNavigation hideNavigation={hideNavigation} />
      {children}
    </Layout>
  )
}

export default IssuerLayout
