import { FC } from "react"
import Layout from "../Layout"
import Navigation from "./Navigation"

type Props = {
  hideNavigation?: boolean
}

const IssuerLayout: FC<Props> = ({ children, hideNavigation }) => {
  return (
    <Layout title="Demo: Centralized App with Travel Rule">
      {!hideNavigation && <Navigation />}
      <div className="max-w-xl mx-auto">{children}</div>
    </Layout>
  )
}

export default IssuerLayout
