import { FC } from "react"
import Layout from "../Layout"
import AttestationNavigation from "./AttestationNavigation"

type Props = {
  title: string
  hideNavigation?: boolean
}

const IssuerLayout: FC<Props> = ({ title, children, hideNavigation }) => {
  return (
    <Layout title={title}>
      <AttestationNavigation hideNavigation={hideNavigation} />
      {children}
    </Layout>
  )
}

export default IssuerLayout
