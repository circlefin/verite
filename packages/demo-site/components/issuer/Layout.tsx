import { FC } from "react"
import Layout from "../layouts/UserAuthLayout"
import AttestationNavigation from "./AttestationNavigation"

type Props = {
  title: string
  hideNavigation?: boolean
}

const IssuerLayout: FC<Props> = ({ title, children, hideNavigation }) => {
  return (
    <Layout title={title}>
      {!hideNavigation && <AttestationNavigation />}
      {children}
    </Layout>
  )
}

export default IssuerLayout
