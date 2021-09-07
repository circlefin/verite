import { useSession } from "next-auth/client"
import { FC } from "react"
import Layout from "../Layout"
import Navigation from "./Navigation"

type Props = {
  hideNavigation?: boolean
  fullWidth?: boolean
}

const IssuerLayout: FC<Props> = ({ children, fullWidth, hideNavigation }) => {
  const [session] = useSession()

  const circle = ["alice@test.com", "sean@test.com", "matt@test.com"]

  let theme = "blue"
  if (circle.includes(session?.user?.email)) {
    theme = "red"
  }

  return (
    <Layout title="Demo: Centralized App with Travel Rule" theme={theme}>
      {!hideNavigation && <Navigation />}
      <div className={`${!fullWidth ? "max-w-xl" : null} mx-auto`}>
        {children}
      </div>
    </Layout>
  )
}

export default IssuerLayout
