import { FC } from "react"

import Layout from "../../shared/Layout"
import AttestationNavigation from "./AttestationNavigation"

const VerifierLayout: FC = ({ children }) => {
  return (
    <Layout title="Demo: Basic Verification">
      <AttestationNavigation />
      {children}
    </Layout>
  )
}

export default VerifierLayout
