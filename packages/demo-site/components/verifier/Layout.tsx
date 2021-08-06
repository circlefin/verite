import { FC } from "react"
import Layout from "../Layout"
import AttestationNavigation from "./AttestationNavigation"

type Props = {
  title: string
  hideNavigation?: boolean
}

const VerifierLayout: FC<Props> = ({ title, children, hideNavigation }) => {
  return (
    <Layout title={title} theme="blue">
      {!hideNavigation && <AttestationNavigation />}
      {children}
    </Layout>
  )
}

export default VerifierLayout
