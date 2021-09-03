import { FC } from "react"
import Layout from "../Layout"
import Navigation from "./Navigation"

type Props = {
  hideNavigation?: boolean
}

const IssuerLayout: FC<Props> = ({ children }) => {
  return (
    <Layout title="Demo: Centralized App with Travel Rule">
      <Navigation />
      <div className="max-w-xl mx-auto">{children}</div>
    </Layout>
  )
}

export default IssuerLayout
