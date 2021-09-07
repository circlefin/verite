import { FC } from "react"
import Layout from "../Layout"
import Navigation from "./Navigation"

type Props = {
  hideNavigation?: boolean
  fullWidth?: boolean
}

const IssuerLayout: FC<Props> = ({ children, fullWidth, hideNavigation }) => {
  return (
    <Layout title="Demo: Centralized App with Travel Rule">
      {!hideNavigation && <Navigation />}
      <div className={`${!fullWidth ? "max-w-xl" : null} mx-auto`}>
        {children}
      </div>
    </Layout>
  )
}

export default IssuerLayout
